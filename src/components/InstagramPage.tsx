import { useMemo, useCallback, useEffect } from "react";
import InstagramCard from "./InstagramCard";
import posts1 from "../data/instagram_posts_1.json";
import posts2 from "../data/instagram_posts_2.json";
import posts3 from "../data/instagram_posts_3.json";
import posts4 from "../data/instagram_posts_4.json";
import posts5 from "../data/instagram_posts_5.json";
import posts6 from "../data/instagram_posts_6.json";
import posts7 from "../data/instagram_posts_7.json";
import posts8 from "../data/instagram_posts_8.json";
import posts9 from "../data/instagram_posts_9.json";
import posts10 from "../data/instagram_posts_10.json";
import posts11 from "../data/instagram_posts_11.json";
import posts12 from "../data/instagram_posts_12.json";
import posts13 from "../data/instagram_posts_13.json";
import posts14 from "../data/instagram_posts_14.json";
import posts15 from "../data/instagram_posts_15.json";
import posts16 from "../data/instagram_posts_16.json";
import posts17 from "../data/instagram_posts_17.json";
import posts18 from "../data/instagram_posts_18.json";
import posts19 from "../data/instagram_posts_19.json";
import posts20 from "../data/instagram_posts_20.json";
import Pagination from "./Pagination";
import { useTranslation } from "react-i18next";
import InstagramFilterComponent from "./InstagramFilterComponent";
import { DateRange } from "react-day-picker";
import { useInstagramBlacklistStore } from "../stores/instagramBlacklistStore";
import { useInstagramPageStore } from "../stores/instagramPageStore";
import { Eye } from "lucide-react";
import { InstagramPost } from "../types";
import { instagramLanguageMapping } from '../data/instagramLanguageMapping';

const allPosts: InstagramPost[] = [
  ...posts1, ...posts2, ...posts3, ...posts4, ...posts5, 
  ...posts6, ...posts7, ...posts8, ...posts9, ...posts10,
  ...posts11, ...posts12, ...posts13, ...posts14, ...posts15,
  ...posts16, ...posts17, ...posts18, ...posts19, ...posts20
] as InstagramPost[];

const InstagramPage = () => {
  const { t } = useTranslation();
  const { blacklistedUsers, addUser, removeUser } = useInstagramBlacklistStore();
  const { currentPage, filters, dateRange, sort, setCurrentPage, setFilters, setDateRange, setSort, reset } = useInstagramPageStore();

  const POSTS_PER_PAGE = 100;

  const allUniqueUsernames = useMemo(() => {
    return [...new Set(allPosts.map((p) => p.username).filter(Boolean))];
  }, []);

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
    }
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
  }, [filters, dateRange, sort, blacklistedUsers]);

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
