import React, { useMemo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useQuery } from '@tanstack/react-query';
import { loadTikTokPosts } from '../utils/tiktokLoader';
import { useTikTokPageStore } from '../stores/tiktokPageStore';
import { TikTokPost } from '../types';
import TikTokCard from './TikTokCard';
import Pagination from './Pagination';
import LoadingSpinner from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { Search, RotateCcw, Filter, SortAsc, SortDesc } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Select from './Select';

const TikTokPage = () => {
    const { t } = useTranslation();
    const { 
        currentPage, 
        filters, 
        sort, 
        sortBy, 
        setCurrentPage, 
        setFilters, 
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
                p.author.nickname.toLowerCase().includes(lowerUser) || 
                p.author.uniqueId.toLowerCase().includes(lowerUser)
            );
        }

        // Filter by Stats
        if (filters.minPlayCount) posts = posts.filter(p => p.stats.playCount >= filters.minPlayCount!);
        if (filters.minDiggCount) posts = posts.filter(p => p.stats.diggCount >= filters.minDiggCount!);
        if (filters.isAd !== null) posts = posts.filter(p => p.isAd === filters.isAd);

        // Sort
        if (sort) {
            posts.sort((a, b) => {
                const valA = a.stats[sortBy];
                const valB = b.stats[sortBy];
                return sort === 'asc' ? valA - valB : valB - valA;
            });
        } else {
             // Default sort by Date Desc
             posts.sort((a, b) => b.createTime - a.createTime);
        }

        return posts;
    }, [allPosts, filters, sort, sortBy]);

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

    const toggleAdFilter = () => {
        if (filters.isAd === null) setFilters({ isAd: true });
        else if (filters.isAd === true) setFilters({ isAd: false });
        else setFilters({ isAd: null });
        setCurrentPage(1);
    };

    if (isLoading) {
        return (
             <div className="flex justify-center items-center h-96">
                <LoadingSpinner message={t('loading_posts') || "Loading TikToks..."} />
             </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 animate-fade-in-up">
            
            {/* Header & Controls */}
            <div className="mb-10 space-y-6">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                     <div>
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

                     <div className="flex gap-2">
                         <button 
                            onClick={reset}
                            className="p-2 text-gray-500 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all"
                            title={t('resetFilters')}
                         >
                             <RotateCcw size={20} />
                         </button>
                     </div>
                </div>

                {/* Filters Bar */}
                <div className="bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col lg:flex-row gap-4 items-center">
                    
                    {/* Search */}
                    <div className="relative w-full lg:w-72 group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-brand-primary transition-colors" size={18} />
                        <input 
                            type="text" 
                            placeholder={t('search_user') || "Search username..."}
                            value={filters.username}
                            onChange={(e) => { setFilters({ username: e.target.value }); setCurrentPage(1); }}
                            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 focus:ring-2 focus:ring-brand-primary/20 focus:border-brand-primary outline-none transition-all"
                        />
                    </div>

                    {/* Ad Filter Toggle */}
                    <button 
                        onClick={toggleAdFilter}
                        className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-bold transition-all border
                            ${filters.isAd === true ? 'bg-yellow-100 text-yellow-700 border-yellow-200' : 
                              filters.isAd === false ? 'bg-green-100 text-green-700 border-green-200' : 
                              'bg-gray-50 text-gray-600 border-gray-200 dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600'}`}
                    >
                        <span>{filters.isAd === true ? "Ads Only" : filters.isAd === false ? "Organic Only" : "All Posts"}</span>
                    </button>

                    <div className="h-8 w-px bg-gray-200 dark:bg-gray-700 hidden lg:block" />

                    {/* Sort Select */}
                    <div className="flex items-center gap-2 w-full lg:w-auto">
                        <SortDesc size={18} className="text-gray-400" />
                        <select 
                            onChange={handleSortChange}
                            className="flex-grow lg:w-56 px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-600 bg-gray-50 dark:bg-gray-700/50 outline-none text-sm text-gray-700 dark:text-gray-200 focus:ring-2 focus:ring-brand-primary/20"
                        >
                            <option value="default">{t('sort_default') || "Default (Newest)"}</option>
                            <option value="playCount-desc">Most Viewed</option>
                            <option value="diggCount-desc">Most Liked</option>
                            <option value="shareCount-desc">Most Shared</option>
                            <option value="collectCount-desc">Most Saved</option>
                        </select>
                    </div>
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
