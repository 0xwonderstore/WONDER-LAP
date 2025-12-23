import React, { useMemo, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { loadTikTokPosts } from '../utils/tiktokLoader';
import { useTikTokPageStore } from '../stores/tiktokPageStore';
import { TikTokPost } from '../types';
import TikTokCard from './TikTokCard';
import Pagination from './Pagination';
import LoadingSpinner from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { SortDesc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import TikTokFilterComponent from './TikTokFilterComponent';

const TikTokPage = () => {
    const { t } = useTranslation();
    const { 
        currentPage, 
        filters, 
        dateRange,
        sort, 
        sortBy, 
        setCurrentPage, 
        setFilters, 
        setDateRange,
        setSort, 
        setSortBy, 
        reset 
    } = useTikTokPageStore();

    const POSTS_PER_PAGE = 12;

    const { data: allPosts = [], isLoading } = useQuery<TikTokPost[]>({
        queryKey: ['tiktokPosts'],
        queryFn: loadTikTokPosts,
        staleTime: Infinity,
        gcTime: Infinity
    });

    // --- Derived Data ---
    const filteredAndSortedPosts = useMemo(() => {
        let posts = [...allPosts];

        // Search Username
        if (filters.username) {
            const lowerUser = filters.username.toLowerCase();
            posts = posts.filter(p => 
                p.author.toLowerCase().includes(lowerUser)
            );
        }

        // Filter by Date Range
        if (dateRange?.from) {
            posts = posts.filter(p => new Date(p.createTime) >= dateRange.from!);
        }
        if (dateRange?.to) {
            posts = posts.filter(p => new Date(p.createTime) <= dateRange.to!);
        }

        // Filter by Stats (using new flat structure)
        if (filters.minPlayCount) posts = posts.filter(p => p.playCount >= filters.minPlayCount!);
        if (filters.minDiggCount) posts = posts.filter(p => p.diggCount >= filters.minDiggCount!);
        if (filters.minCommentCount) posts = posts.filter(p => p.commentCount >= filters.minCommentCount!);
        if (filters.minShareCount) posts = posts.filter(p => p.shareCount >= filters.minShareCount!);
        if (filters.minCollectCount) posts = posts.filter(p => p.collectCount >= filters.minCollectCount!);
        if (filters.isAd !== null) posts = posts.filter(p => p.isAd === filters.isAd);

        // Sort
        if (sort) {
            posts.sort((a, b) => {
                // @ts-ignore: Dynamic access
                const valA = a[sortBy];
                // @ts-ignore: Dynamic access
                const valB = b[sortBy];
                return sort === 'asc' ? valA - valB : valB - valA;
            });
        } else {
             // Default sort by Date Desc (parsing string date)
             posts.sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime());
        }

        return posts;
    }, [allPosts, filters, dateRange, sort, sortBy]);

    const totalPages = Math.ceil(filteredAndSortedPosts.length / POSTS_PER_PAGE);
    const paginatedPosts = filteredAndSortedPosts.slice((currentPage - 1) * POSTS_PER_PAGE, currentPage * POSTS_PER_PAGE);

    // --- Handlers ---
    const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const val = e.target.value;
        if (val === 'default') {
            setSort(null);
            setSortBy('diggCount');
        } else {
            const [field, direction] = val.split('-');
            setSortBy(field as any);
            setSort(direction as 'asc' | 'desc');
        }
        setCurrentPage(1);
    };

    const handleFilterChange = useCallback((newFilters: any) => {
        setFilters(newFilters);
        setCurrentPage(1);
    }, [setFilters, setCurrentPage]);

    const handleDateChange = useCallback((newDateRange: any) => {
        setDateRange(newDateRange);
        setCurrentPage(1);
    }, [setDateRange, setCurrentPage]);

    const handleReset = useCallback(() => {
        reset();
        setCurrentPage(1);
    }, [reset, setCurrentPage]);


    if (isLoading) {
        return (
             <div className="flex justify-center items-center h-96">
                <LoadingSpinner message={t('loading_posts') || "Loading TikToks..."} />
             </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in-up">
            
            {/* Header */}
            <div className="mb-8">
                <h1 className="text-4xl font-black mb-2 text-gray-900 dark:text-white flex items-center gap-3">
                        <span className="bg-black text-white dark:bg-white dark:text-black p-2 rounded-lg">
                        <svg viewBox="0 0 24 24" fill="currentColor" className="w-6 h-6"><path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z"/></svg>
                        </span>
                        {t('tiktok_feature') || "TikTok Library"}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">
                        {t('tiktok_subtitle') || "Browse top performing TikTok videos and ads."}
                </p>
            </div>

            {/* Advanced Filters */}
            <TikTokFilterComponent 
                filters={filters}
                onFilterChange={handleFilterChange}
                date={dateRange}
                setDate={handleDateChange}
                onReset={handleReset}
                posts={allPosts}
            />

            {/* Sort Bar (Separate for clarity below filters) */}
            <div className="flex justify-end mb-6">
                <div className="flex items-center gap-2">
                    <SortDesc size={16} className="text-gray-400" />
                    <span className="text-sm font-bold text-gray-500">{t('sort_by')}:</span>
                    <select 
                        onChange={handleSortChange}
                        className="pl-2 pr-8 py-1.5 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium outline-none focus:ring-2 focus:ring-brand-primary/20"
                    >
                        <option value="default">{t('sort_default') || "Default (Newest)"}</option>
                        <option value="playCount-desc">Most Viewed</option>
                        <option value="diggCount-desc">Most Liked</option>
                        <option value="shareCount-desc">Most Shared</option>
                        <option value="collectCount-desc">Most Saved</option>
                    </select>
                </div>
            </div>

            {/* Grid */}
            {paginatedPosts.length > 0 ? (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 mb-12">
                        <AnimatePresence mode="popLayout">
                            {paginatedPosts.map((post) => (
                                <motion.div
                                    key={post.id}
                                    layout
                                    initial={{ opacity: 0, scale: 0.9 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.9 }}
                                    transition={{ duration: 0.2 }}
                                >
                                    <TikTokCard post={post} />
                                </motion.div>
                            ))}
                        </AnimatePresence>
                    </div>
                    
                    <Pagination 
                        currentPage={currentPage}
                        totalPages={totalPages}
                        onPageChange={setCurrentPage}
                        totalItems={filteredAndSortedPosts.length}
                        itemsPerPage={POSTS_PER_PAGE}
                        t={t}
                    />
                </>
            ) : (
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700">
                    <EmptyState 
                        title={t('noResults')} 
                        hint={t('noResultsHint')} 
                    />
                </div>
            )}
        </div>
    );
};

export default TikTokPage;
