import { useMemo, useCallback, useEffect, useState } from "react";
import InstagramCard from "./InstagramCard";
import Pagination from "./Pagination";
import { useTranslation } from "react-i18next";
import InstagramFilterComponent from "./InstagramFilterComponent";
import { DateRange } from "react-day-picker";
import { useInstagramBlacklistStore } from "../stores/instagramBlacklistStore";
import { useInstagramPageStore } from "../stores/instagramPageStore";
import { Eye } from "lucide-react";
import { InstagramPost } from "../types";
import { instagramLanguageMapping } from '../data/instagramLanguageMapping';
import LoadingSpinner from "./LoadingSpinner"; // Import the new component

const InstagramPage = () => {
  const { t } = useTranslation();
  const { blacklistedUsers, addUser, removeUser } = useInstagramBlacklistStore();
  const { currentPage, filters, dateRange, sort, setCurrentPage, setFilters, setDateRange, setSort, reset } = useInstagramPageStore();

  const POSTS_PER_PAGE = 100;

  const [allPosts, setAllPosts] = useState<InstagramPost[]>([]);
  const [loadingPosts, setLoadingPosts] = useState(true);

  useEffect(() => {
    const loadInstagramPosts = async () => {
      const modules = import.meta.glob('/src/data/instagram/*.json');
      const loadedPosts: InstagramPost[] = [];
      for (const path in modules) {
        try {
          const module: any = await modules[path]();
          const postsPage = Array.isArray(module.default) ? module.default : module.default?.posts;
          if (postsPage && Array.isArray(postsPage)) {
            loadedPosts.push(...postsPage);
          }
        } catch (error) {
          console.error(`Error loading or processing ${path}:`, error);
        }
      }
      setAllPosts(loadedPosts);
      setLoadingPosts(false);
    };

    loadInstagramPosts();
  }, []);

  const allUniqueUsernames = useMemo(() => {
    return [...new Set(allPosts.map((p) => p.username).filter(Boolean))];
  }, [allPosts]);

  const filteredAndSortedPosts = useMemo(() => {
    let posts = [...allPosts];

    // Remove duplicates
    const seen = new Set();
    posts = posts.filter(post => {
      const duplicate = seen.has(post.permalink);
      seen.add(post.permalink);
      return !duplicate;
    });

    // Filter out blacklisted users
    posts = posts.filter(post => !blacklistedUsers.has(post.username));

    // Apply standard filters
    if (filters.username) {
      posts = posts.filter((p) => p.username === filters.username);
    }
    if (filters.languages && filters.languages.length > 0) {
      posts = posts.filter((p) => filters.languages.includes(instagramLanguageMapping[p.username]));
    }
    if (filters.minLikes !== null) {
      posts = posts.filter((p) => p.likes >= filters.minLikes);
    }
    if (filters.maxLikes !== null) {
      posts = posts.filter((p) => p.likes <= filters.maxLikes);
    };
    if (dateRange?.from) {
      posts = posts.filter((p) => new Date(p.timestamp) >= dateRange.from);
    }
    if (dateRange?.to) {
      posts = posts.filter((p) => new Date(p.timestamp) <= dateRange.to);
    }

    // Apply sorting
    if (sort) {
      posts.sort((a, b) => sort === "asc" ? a.likes - b.likes : b.likes - a.likes);
    } else {
      posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    return posts;
  }, [filters, dateRange, sort, blacklistedUsers, allPosts]);

  const totalPages = Math.ceil(filteredAndSortedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredAndSortedPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(newFilters);
    setCurrentPage(1);
  }, [setFilters, setCurrentPage]);
  
  const handleDateChange = useCallback((newDateRange: DateRange | undefined) => {
      setDateRange(newDateRange);
      setCurrentPage(1);
    }, [setDateRange, setCurrentPage]);

  const handleSortChange = useCallback((newSort: "asc" | "desc" | null) => {
    setSort(newSort);
    setCurrentPage(1);
  }, [setSort, setCurrentPage]);
  
  const handleReset = useCallback(() => {
    reset();
  }, [reset]);

  const handleBlacklistToggle = (username: string) => {
    if (blacklistedUsers.has(username)) {
      removeUser(username);
    } else {
      addUser(username);
    }
  };

  if (loadingPosts) {
    return (
      <div className="container mx-auto p-2 flex justify-center items-center h-96">
        <LoadingSpinner message={t('loading_instagram_posts')} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2">
      <InstagramFilterComponent
        usernames={allUniqueUsernames}
        filters={filters}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onDateChange={handleDateChange}
        onReset={handleReset}
        currentSort={sort}
        date={dateRange}
        setDate={handleDateChange}
      />
      <div className="mb-4">
        <h3 className="text-lg font-semibold">{t('blacklist')} ({blacklistedUsers.size})</h3>
        <div className="flex flex-wrap gap-2 mt-2">
          {Array.from(blacklistedUsers).map(user => (
            <div key={user} className="flex items-center gap-2 bg-gray-200 dark:bg-gray-700 rounded-full px-3 py-1">
              <span>{user}</span>
              <button onClick={() => handleBlacklistToggle(user)} className="text-red-500 hover:text-red-700">
                <Eye size={16} />
              </button>
            </div>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-1">
        {paginatedPosts.map((post) => (
          <InstagramCard
            key={post.permalink}
            post={post}
            onBlacklistToggle={handleBlacklistToggle}
            isBlacklisted={blacklistedUsers.has(post.username)}
          />
        ))}
      </div>
      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={POSTS_PER_PAGE}
          totalItems={filteredAndSortedPosts.length}
          t={t}
        />
      </div>
    </div>
  );
};

export default InstagramPage;
