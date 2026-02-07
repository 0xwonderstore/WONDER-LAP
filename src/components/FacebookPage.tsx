import { useMemo, useState, useRef, useEffect } from "react";
import FacebookCard from "./FacebookCard";
import Pagination from "./Pagination";
import { useTranslation } from "react-i18next";
import FacebookFilterComponent from "./FacebookFilterComponent";
import { useFacebookBlacklistStore } from "../stores/facebookBlacklistStore";
import { useFacebookPageStore } from "../stores/facebookPageStore";
import { CheckSquare } from "lucide-react";
import { FacebookPost } from "../types";
import LoadingSpinner from "./LoadingSpinner";
import { useQuery } from "@tanstack/react-query";
import { loadFacebookPosts } from "../utils/facebookLoader";
import { startOfDay, endOfDay } from "date-fns";
import { useToastStore } from "../stores/toastStore";

const FacebookPage = () => {
  const { t } = useTranslation();
  const { showToast, hideToast } = useToastStore();
  
  const [pendingHideIds, setPendingHideIds] = useState<Set<string>>(new Set());
  const pendingHideIdsRef = useRef<Set<string>>(new Set());
  const hideTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  const { blacklistedUsers, blacklistedPosts, addPosts, addUser, removeUser } = useFacebookBlacklistStore();
  
  const { currentPage, postsPerPage, filters, dateRange, sort, sortBy, setCurrentPage, setPostsPerPage, setFilters, setDateRange, setSort, setSortBy, reset } = useFacebookPageStore();

  // Changed queryKey to force refresh and removed Infinity staleTime to ensure fresh data on reload
  const { data: allPosts = [], isLoading: loadingPosts } = useQuery<FacebookPost[]>({
    queryKey: ['facebookPosts_v2'], 
    queryFn: loadFacebookPosts,
    staleTime: 0, 
    gcTime: 0 
  });

  const basePosts = useMemo(() => {
    // We are no longer filtering duplicates to ensure all posts are shown as requested
    return allPosts;
  }, [allPosts]);

  const allUniqueUsernames = useMemo(() => {
    const usernames = new Set<string>();
    for (const post of basePosts) usernames.add(post.username);
    return Array.from(usernames).sort();
  }, [basePosts]);

  const filteredAndSortedPosts = useMemo(() => {
    if (basePosts.length === 0) return [];
    let posts = basePosts;

    // Disabled blacklist filtering to show EVERYTHING as requested
    // if (blacklistedUsers.size > 0 || blacklistedPosts.size > 0 || pendingHideIds.size > 0) {
    //     posts = posts.filter(post => !blacklistedUsers.has(post.username) && !blacklistedPosts.has(post.permalink) && !pendingHideIds.has(post.permalink));
    // }

    if (filters.username) posts = posts.filter((p) => p.username === filters.username);
    if (filters.minLikes !== null && filters.minLikes > 0) posts = posts.filter((p) => p.likes >= filters.minLikes!);
    if (filters.minComments !== null && filters.minComments > 0) posts = posts.filter((p) => p.comments >= filters.minComments!);
    if (filters.minShares !== null && filters.minShares > 0) posts = posts.filter((p) => p.shares >= filters.minShares!);
    
    if (dateRange?.from) posts = posts.filter((p) => new Date(p.timestamp) >= startOfDay(new Date(dateRange.from!)));
    if (dateRange?.to) posts = posts.filter((p) => new Date(p.timestamp) <= endOfDay(new Date(dateRange.to!)));

    const sortedPosts = [...posts];
    sortedPosts.sort((a, b) => {
        let valA: number, valB: number;
        if (sortBy === 'date') { valA = new Date(a.timestamp).getTime(); valB = new Date(b.timestamp).getTime(); }
        else if (sortBy === 'comments') { valA = a.comments; valB = b.comments; }
        else if (sortBy === 'shares') { valA = a.shares; valB = b.shares; }
        else { valA = a.likes; valB = b.likes; }
        return sort === "asc" ? valA - valB : valB - valA;
    });
    return sortedPosts;
  }, [filters, dateRange, sort, sortBy, blacklistedUsers, blacklistedPosts, pendingHideIds, basePosts]);

  const totalPages = Math.ceil(filteredAndSortedPosts.length / postsPerPage);
  const paginatedPosts = filteredAndSortedPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const processPendingHides = (ids: string[]) => {
    if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    ids.forEach(id => pendingHideIdsRef.current.add(id));
    setPendingHideIds(new Set(pendingHideIdsRef.current));
    showToast(t('archiving_in_progress', { count: pendingHideIdsRef.current.size }), 'undo', 5000, () => {
        pendingHideIdsRef.current.clear();
        setPendingHideIds(new Set());
        if (hideTimeoutRef.current) clearTimeout(hideTimeoutRef.current);
    });
    hideTimeoutRef.current = setTimeout(() => {
        const finalIds = Array.from(pendingHideIdsRef.current);
        if (finalIds.length > 0) addPosts(finalIds);
        pendingHideIdsRef.current.clear();
        setPendingHideIds(new Set());
        hideToast();
    }, 5000);
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

  if (loadingPosts) return <div className="container mx-auto p-2 flex justify-center items-center h-96"><LoadingSpinner message={t('loading_facebook_posts')} /></div>;

  return (
    <div className="container mx-auto p-2 animate-fade-in-up">
      <FacebookFilterComponent usernames={allUniqueUsernames} filters={filters} onFilterChange={setFilters} onSortChange={setSort} onSortByChange={setSortBy} onReset={reset} currentSort={sort} currentSortBy={sortBy} date={dateRange} onDateChange={setDateRange} postsPerPage={postsPerPage} onPostsPerPageChange={setPostsPerPage} />
      <div className="mb-6 flex justify-end">
        <button onClick={() => processPendingHides(paginatedPosts.map(p => p.permalink))} disabled={paginatedPosts.length === 0} className="uiverse-hide-button bg-blue-600 hover:bg-blue-700 !w-auto !px-6 !rounded-full group">
            <div className="uiverse-nav-icon transition-transform group-hover:scale-110"><CheckSquare size={22} /></div>
            <span className="ml-3 text-white font-bold text-sm tracking-wide whitespace-nowrap">{t('hide_all_page', { count: paginatedPosts.length })}</span>
        </button>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {paginatedPosts.map((post, index) => (<FacebookCard key={`${post.permalink}-${index}`} post={post} />))}
      </div>
      {paginatedPosts.length === 0 && <div className="flex flex-col items-center justify-center py-20 text-gray-500"><p className="text-xl font-medium">{t('noResults')}</p><button onClick={reset} className="mt-4 text-blue-500 hover:underline">{t('resetFilters')}</button></div>}
      {totalPages > 1 && <div className="mt-8"><Pagination currentPage={currentPage} totalPages={totalPages} onPageChange={setCurrentPage} itemsPerPage={postsPerPage} totalItems={filteredAndSortedPosts.length} t={t} /></div>}
    </div>
  );
};

export default FacebookPage;
