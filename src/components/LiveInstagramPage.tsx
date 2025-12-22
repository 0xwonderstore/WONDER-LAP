import React, { useState, useMemo, useEffect } from 'react';
import { useLiveInstagramStore } from '../stores/liveInstagramStore';
import { Plus, Trash2, RefreshCw, Users, ArrowUp, ArrowDown, Heart, MessageCircle, Calendar, Loader2 } from 'lucide-react';
import InstagramCard from './InstagramCard';
import { useTranslation } from 'react-i18next';
import { motion, AnimatePresence } from 'framer-motion';
import LoadingSpinner from './LoadingSpinner';
import { EmptyState } from './EmptyState';
import { useInstagramBlacklistStore } from '../stores/instagramBlacklistStore';

const LiveInstagramPage: React.FC = () => {
    const { t } = useTranslation();
    const { 
        trackedUsers, 
        posts, 
        isLoading, 
        isLoadingMore,
        hasMore,
        addUser, 
        removeUser, 
        fetchPosts, 
        clearAll,
        sortOption,
        setSortOption 
    } = useLiveInstagramStore();
    
    const { blacklistedUsers, addUser: addToBlacklist, removeUser: removeFromBlacklist } = useInstagramBlacklistStore();

    const [newUser, setNewUser] = useState('');

    const handleAddUser = (e: React.FormEvent) => {
        e.preventDefault();
        if (newUser.trim()) {
            const cleanUser = newUser.trim().replace('@', '');
            addUser(cleanUser);
            setNewUser('');
        }
    };

    const handleBlacklistToggle = (username: string) => {
        if (blacklistedUsers.has(username)) removeFromBlacklist(username);
        else addToBlacklist(username);
    };

    const sortedPosts = useMemo(() => {
        const sorted = [...posts];
        switch (sortOption) {
            case 'likes-desc': return sorted.sort((a, b) => b.likes - a.likes);
            case 'likes-asc': return sorted.sort((a, b) => a.likes - b.likes);
            case 'comments-desc': return sorted.sort((a, b) => b.comments - a.comments);
            case 'comments-asc': return sorted.sort((a, b) => a.comments - b.comments);
            case 'date-desc': return sorted.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
            case 'date-asc': return sorted.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
            default: return sorted;
        }
    }, [posts, sortOption]);

    const toggleSort = (baseType: string) => {
        const isDesc = sortOption.startsWith(baseType) && sortOption.endsWith('desc');
        if (sortOption.startsWith(baseType)) {
             setSortOption(`${baseType}-${isDesc ? 'asc' : 'desc'}` as any);
        } else {
             setSortOption(`${baseType}-desc` as any);
        }
    };

    // Initial fetch if users exist but no posts (e.g. persisted state)
    useEffect(() => {
        if (trackedUsers.length > 0 && posts.length === 0 && !isLoading) {
            fetchPosts(false);
        }
    }, []);

    return (
        <div className="container mx-auto px-4 py-8 max-w-7xl animate-fade-in-up">
            
            {/* Header Area */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-6">
                <div>
                    <h1 className="text-3xl font-black bg-gradient-to-r from-pink-500 to-purple-600 bg-clip-text text-transparent mb-2">
                        {t('live_instagram') || "Live Monitor"}
                    </h1>
                    <p className="text-gray-500 dark:text-gray-400">
                        {t('monitor_description') || "Track specific accounts in real-time."}
                    </p>
                </div>
                
                {trackedUsers.length > 0 && (
                    <div className="flex gap-3">
                        <button 
                            onClick={() => fetchPosts(false)} 
                            disabled={isLoading}
                            className="flex items-center gap-2 px-4 py-2 bg-brand-primary text-white rounded-xl shadow-lg shadow-brand-primary/20 hover:bg-brand-secondary transition-all active:scale-95 disabled:opacity-70"
                        >
                            <RefreshCw size={18} className={isLoading ? "animate-spin" : ""} />
                            <span>{t('refresh') || "Refresh"}</span>
                        </button>
                         <button 
                            onClick={clearAll}
                            className="flex items-center gap-2 px-4 py-2 bg-gray-100 dark:bg-gray-800 text-red-500 rounded-xl hover:bg-red-50 dark:hover:bg-red-900/20 transition-all active:scale-95"
                        >
                            <Trash2 size={18} />
                            <span>{t('clear') || "Clear"}</span>
                        </button>
                    </div>
                )}
            </div>

            {/* Input & Users List Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
                
                {/* Add User Card */}
                <div className="bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                    <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Plus className="w-5 h-5 text-brand-primary" />
                        {t('add_account') || "Add Account"}
                    </h3>
                    <form onSubmit={handleAddUser} className="flex gap-2">
                        <div className="relative flex-grow">
                             <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 font-bold">@</div>
                             <input 
                                type="text" 
                                value={newUser}
                                onChange={(e) => setNewUser(e.target.value)}
                                placeholder="username"
                                className="w-full pl-8 pr-4 py-3 bg-gray-50 dark:bg-gray-700/50 rounded-xl border border-gray-200 dark:border-gray-600 focus:ring-2 focus:ring-brand-primary/50 outline-none transition-all"
                            />
                        </div>
                        <button 
                            type="submit"
                            disabled={!newUser.trim()}
                            className="bg-brand-primary text-white px-4 rounded-xl hover:bg-brand-secondary transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Plus size={24} />
                        </button>
                    </form>
                </div>

                {/* Tracked Users List */}
                <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-6 shadow-lg border border-gray-100 dark:border-gray-700">
                     <h3 className="font-bold text-gray-800 dark:text-gray-100 mb-4 flex items-center gap-2">
                        <Users className="w-5 h-5 text-purple-500" />
                        {t('tracked_accounts') || "Tracked Accounts"} 
                        <span className="bg-purple-100 dark:bg-purple-900/30 text-purple-600 dark:text-purple-400 px-2 py-0.5 rounded-full text-xs">
                            {trackedUsers.length}
                        </span>
                    </h3>
                    
                    {trackedUsers.length > 0 ? (
                        <div className="flex flex-wrap gap-2 max-h-[120px] overflow-y-auto custom-scrollbar pr-2">
                            {trackedUsers.map(user => (
                                <motion.div 
                                    layout
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    exit={{ scale: 0.8, opacity: 0 }}
                                    key={user} 
                                    className="flex items-center gap-2 bg-gray-50 dark:bg-gray-700/50 border border-gray-100 dark:border-gray-600 pl-3 pr-1 py-1.5 rounded-full"
                                >
                                    <span className="font-medium text-sm text-gray-700 dark:text-gray-200">@{user}</span>
                                    <button 
                                        onClick={() => removeUser(user)}
                                        className="p-1 hover:bg-red-100 dark:hover:bg-red-900/30 text-gray-400 hover:text-red-500 rounded-full transition-colors"
                                    >
                                        <X size={14} className="stroke-[3]" />
                                    </button>
                                </motion.div>
                            ))}
                        </div>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-24 text-gray-400 italic text-sm border-2 border-dashed border-gray-100 dark:border-gray-700 rounded-xl bg-gray-50/50 dark:bg-gray-800/50">
                            {t('no_accounts_added') || "No accounts added yet."}
                        </div>
                    )}
                </div>
            </div>

            {/* Results Section */}
            {trackedUsers.length > 0 && (
                <div className="space-y-8">
                    {/* Filter Bar */}
                    <div className="flex flex-wrap gap-4 items-center justify-between bg-white dark:bg-gray-800 p-4 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700">
                         <span className="font-bold text-gray-700 dark:text-gray-200 text-sm uppercase tracking-wider">{t('sort_posts') || "Sort Posts"}:</span>
                         <div className="flex gap-2">
                             {['date', 'likes', 'comments'].map((type) => {
                                 const isActive = sortOption.startsWith(type);
                                 const isDesc = sortOption.endsWith('desc');
                                 
                                 let icon = <Calendar size={16} />;
                                 let label = t('date') || "Date";
                                 if (type === 'likes') { icon = <Heart size={16} />; label = t('likes') || "Likes"; }
                                 if (type === 'comments') { icon = <MessageCircle size={16} />; label = t('comments') || "Comments"; }

                                 return (
                                     <button
                                        key={type}
                                        onClick={() => toggleSort(type)}
                                        className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold transition-all
                                            ${isActive 
                                                ? 'bg-brand-primary text-white shadow-md shadow-brand-primary/20' 
                                                : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-600'
                                            }`}
                                     >
                                         {icon}
                                         <span>{label}</span>
                                         {isActive && (
                                             isDesc ? <ArrowDown size={14} strokeWidth={3} /> : <ArrowUp size={14} strokeWidth={3} />
                                         )}
                                     </button>
                                 )
                             })}
                         </div>
                    </div>

                    {/* Posts Grid */}
                    {sortedPosts.length > 0 ? (
                        <>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                                <AnimatePresence mode='popLayout'>
                                    {sortedPosts.map((post) => (
                                        <motion.div
                                            layout
                                            initial={{ opacity: 0, scale: 0.9 }}
                                            animate={{ opacity: 1, scale: 1 }}
                                            exit={{ opacity: 0, scale: 0.9 }}
                                            transition={{ duration: 0.3 }}
                                            key={post.permalink}
                                        >
                                            <InstagramCard 
                                                post={post} 
                                                onBlacklistToggle={handleBlacklistToggle}
                                                isBlacklisted={blacklistedUsers.has(post.username)}
                                            />
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>
                            
                            {/* Load More Button */}
                            {hasMore && (
                                <div className="flex justify-center mt-12 pb-12">
                                    <button 
                                        onClick={() => fetchPosts(true)}
                                        disabled={isLoadingMore}
                                        className="flex items-center gap-3 px-8 py-3 bg-white dark:bg-gray-800 text-brand-primary border border-gray-200 dark:border-gray-700 rounded-full shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all disabled:opacity-70 disabled:hover:translate-y-0"
                                    >
                                        {isLoadingMore ? (
                                            <>
                                                <Loader2 className="animate-spin" size={20} />
                                                <span>{t('loading_more') || "Loading more..."}</span>
                                            </>
                                        ) : (
                                            <>
                                                <ArrowDown size={20} />
                                                <span className="font-bold">{t('load_more') || "Load More Posts"}</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            )}
                        </>
                    ) : isLoading ? (
                         <div className="py-20">
                            <LoadingSpinner message={t('fetching_live_data') || "Fetching live data..."} />
                        </div>
                    ) : (
                        <div className="bg-white dark:bg-gray-800 rounded-3xl p-12 text-center border border-gray-100 dark:border-gray-700">
                             <EmptyState 
                                title={t('no_posts_found') || "No posts found"} 
                                hint={t('add_more_users_hint') || "Add users to see their live activity here."} 
                             />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

// Helper for the X icon
const X = ({ size, className }: {size?: number, className?: string}) => (
    <svg 
        xmlns="http://www.w3.org/2000/svg" 
        width={size || 24} 
        height={size || 24} 
        viewBox="0 0 24 24" 
        fill="none" 
        stroke="currentColor" 
        strokeWidth="2" 
        strokeLinecap="round" 
        strokeLinejoin="round" 
        className={className}
    >
        <path d="M18 6 6 18"/><path d="m6 6 18 18"/>
    </svg>
);

export default LiveInstagramPage;
