import { useMemo, useState, useRef } from "react";
import InstagramCard from "./InstagramCard";
import Pagination from "./Pagination";
import { useTranslation } from "react-i18next";
import InstagramFilterComponent from "./InstagramFilterComponent";
import { useInstagramBlacklistStore } from "../stores/instagramBlacklistStore";
import { useInstagramPageStore } from "../stores/instagramPageStore";
import { CheckSquare } from "lucide-react";
import { InstagramPost } from "../types";
import { instagramLanguageMapping } from '../data/instagramLanguageMapping';
import LoadingSpinner from "./LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { loadInstagramPosts } from "../utils/instagramLoader";
import { startOfDay, endOfDay } from "date-fns";
import { useToastStore } from "../stores/toastStore";

const InstagramPage = () => {
  const { t } = useTranslation();
  const { showToast, hideToast } = useToastStore();
  
  const [pendingHideIds, setPendingHideIds] = useState<Set<string>>(new Set());
  const pendingHideIdsRef = useRef<Set<string>>(new Set());
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { 
    blacklistedUsers, 
    blacklistedPosts, 
    addUser, 
    removeUser, 
    addPost, 
    addPosts, 
  } = useInstagramBlacklistStore();
  
  const { 
    currentPage, 
    postsPerPage,
    filters, 
    dateRange, 
    sort, 
    sortBy, 
    setCurrentPage, 
    setPostsPerPage,
    setFilters, 
    setDateRange, 
    setSort, 
    setSortBy, 
    reset 
  } = useInstagramPageStore();

  const { data: allPosts = [], isLoading: loadingPosts } = useQuery<InstagramPost[]>({
    queryKey: ['instagramPosts'],
    queryFn: loadInstagramPosts,
    staleTime: Infinity,
    gcTime: Infinity
  });

  // Re-implementing Duplicate Removal based on permalink
  const basePosts = useMemo(() => {
    let posts = [...allPosts];
    const seen = new Set();
    return posts.filter(post => {
      const duplicate = seen.has(post.permalink);
      seen.add(post.permalink);
      return !duplicate;
    });
  }, [allPosts]);

  const allUniqueUsernames = useMemo(() => {
    const usernames = new Set<string>();
    for (let i = 0; i < basePosts.length; i++) {
        usernames.add(basePosts[i].username);
    }
    return Array.from(usernames).sort();
  }, [basePosts]);

  const filteredAndSortedPosts = useMemo(() => {
    let posts = [...basePosts];

    // Filter out blacklisted AND pending-to-be-hidden posts
    if (blacklistedUsers.size > 0 || blacklistedPosts.size > 0 || pendingHideIds.size > 0) {
        posts = posts.filter(post => 
            !blacklistedUsers.has(post.username) && 
            !blacklistedPosts.has(post.permalink) &&
            !pendingHideIds.has(post.permalink)
        );
    }

    // Apply standard filters
    if (filters.username) {
      posts = posts.filter((p) => p.username === filters.username);
    }
    
    if (filters.languages && filters.languages.length > 0) {
      posts = posts.filter((p) => {
          const lang = instagramLanguageMapping[p.username];
          return lang && filters.languages.includes(lang);
      });
    }
    
    if (filters.minLikes !== null && filters.minLikes > 0) {
      posts = posts.filter((p) => p.likes >= filters.minLikes!);
    }
    
    if (filters.minComments !== null && filters.minComments > 0) {
        posts = posts.filter((p) => p.comments >= filters.minComments!);
    }
    
    if (dateRange?.from) {
      const fromDate = startOfDay(new Date(dateRange.from));
      posts = posts.filter((p) => new Date(p.timestamp) >= fromDate);
    }
    if (dateRange?.to) {
      const toDate = endOfDay(new Date(dateRange.to));
      posts = posts.filter((p) => new Date(p.timestamp) <= toDate);
    }

    // Apply sorting
    posts.sort((a, b) => {
        let valA: number;
        let valB: number;
        if (sortBy === 'date') {
            valA = new Date(a.timestamp).getTime();
            valB = new Date(b.timestamp).getTime();
        } else if (sortBy === 'comments') {
            valA = a.comments;
            valB = b.comments;
        } else {
            valA = a.likes;
            valB = b.likes;
        }
        return sort === "asc" ? valA - valB : valB - valA;
    });

    return posts;
  }, [filters, dateRange, sort, sortBy, blacklistedUsers, blacklistedPosts, pendingHideIds, basePosts]);

  const totalPages = Math.ceil(filteredAndSortedPosts.length / postsPerPage);
  const paginatedPosts = filteredAndSortedPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const processPendingHides = (ids: string[]) => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    ids.forEach(id => pendingHideIdsRef.current.add(id));
    setPendingHideIds(new Set(pendingHideIdsRef.current));

    showToast(`Hiding ${pendingHideIdsRef.current.size} posts...`, 'undo', 5000, () => {
        pendingHideIdsRef.current.clear();
        setPendingHideIds(new Set());
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    });

    hideTimeoutRef.current = setTimeout(() => {
        const finalIds = Array.from(pendingHideIdsRef.current);
        if (finalIds.length > 0) {
            addPosts(finalIds);
        }
        pendingHideIdsRef.current.clear();
        setPendingHideIds(new Set());
        hideToast();
    }, 5000);
  };

  const handleHideAllInPage = () => {
    const permalinks = paginatedPosts.map(p => p.permalink);
    if (permalinks.length > 0) {
      processPendingHides(permalinks);
    }
  };

  const handleHidePost = (permalink: string) => {
    processPendingHides([permalink]);
  };

  const handleBlacklistToggle = (username: string) => {
    if (blacklistedUsers.has(username)) {
      removeUser(username);
      showToast(`${username} removed from blacklist`, 'success');
    } else {
      addUser(username);
      showToast(`${username} added to blacklist`, 'removed');
    }
  };

  if (loadingPosts) {
    return (
      <div className="container mx-auto p-2 flex justify-center items-center h-96">
        <LoadingSpinner message={t('loading_posts')} />
      </div>
    );
  }

  return (
    <div className="container mx-auto p-2 animate-fade-in-up">
      <InstagramFilterComponent
        usernames={allUniqueUsernames}
        filters={filters}
        onFilterChange={setFilters}
        onSortChange={setSort}
        onSortByChange={setSortBy}
        onReset={reset}
        currentSort={sort}
        currentSortBy={sortBy}
        date={dateRange}
        onDateChange={setDateRange}
        postsPerPage={postsPerPage}
        onPostsPerPageChange={setPostsPerPage}
      />
      
      <div className="mb-6 flex justify-end">
        <button 
            onClick={handleHideAllInPage}
            disabled={paginatedPosts.length === 0}
            className="group flex items-center gap-2 px-6 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-sm font-bold transition-all shadow-lg active:scale-95 disabled:opacity-50 disabled:pointer-events-none"
        >
            <CheckSquare size={20} className="group-hover:rotate-12 transition-transform" /> 
            Hide All In Page ({paginatedPosts.length})
        </button>
      </div>

      {/* Posts Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedPosts.map((post) => (
          <InstagramCard
            key={post.permalink}
            post={post}
            onBlacklistToggle={handleBlacklistToggle}
            isBlacklisted={blacklistedUsers.has(post.username)}
            onHidePost={handleHidePost}
          />
        ))}
      </div>
      
      {/* Empty State */}
      {paginatedPosts.length === 0 && (
          <div className="flex flex-col items-center justify-center py-20 text-gray-500">
              <p className="text-xl font-medium">{t('no_results')}</p>
              <button onClick={reset} className="mt-4 text-blue-500 hover:underline">
                  {t('resetFilters')}
              </button>
          </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="mt-8">
            <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={setCurrentPage}
            itemsPerPage={postsPerPage}
            totalItems={filteredAndSortedPosts.length}
            t={t}
            />
        </div>
      )}
    </div>
  );
};

export default InstagramPage;
