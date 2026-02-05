import React, { useState } from 'react';
import { X, PlusCircle, Type, Store, Trash2, Instagram, UserX } from 'lucide-react';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import { useBlacklistStore } from '../stores/blacklistStore';
import { useInstagramBlacklistStore } from '../stores/instagramBlacklistStore';
import { EmptyState } from './EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

const BlacklistPage: React.FC = () => {
  const { language } = useLanguageStore();
  const t = translations[language] as any;
  
  // State for inputs
  const [newKeyword, setNewKeyword] = useState('');
  const [newStore, setNewStore] = useState('');
  const [newUser, setNewUser] = useState('');

  // Stores
  const { keywords, addKeyword, removeKeyword, blockedStores, addStore, removeStore } = useBlacklistStore();
  const { blacklistedUsers, addUser, removeUser } = useInstagramBlacklistStore();

  const handleAddKeyword = () => {
    if (newKeyword.trim()) {
      addKeyword(newKeyword.trim());
      setNewKeyword('');
    }
  };

  const handleAddStore = () => {
    if (newStore.trim()) {
      addStore(newStore.trim());
      setNewStore('');
    }
  };

  const handleAddUser = () => {
      if (newUser.trim()) {
          addUser(newUser.trim());
          setNewUser('');
      }
  };

  const SectionHeader = ({ icon: Icon, title, desc, colorClass }: any) => (
    <div className="flex items-center gap-4 mb-8">
        <div className={`p-4 ${colorClass} rounded-2xl shadow-sm`}>
            <Icon size={28} />
        </div>
        <div>
            <h2 className="text-xl font-bold text-gray-800 dark:text-white leading-tight">{title}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{desc}</p>
        </div>
    </div>
  );

  return (
    <div className="animate-fade-in-up max-w-7xl mx-auto pb-16 px-4">
      <header className="text-center mb-16">
        <motion.h1 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-black bg-gradient-to-r from-gray-900 via-gray-700 to-gray-900 dark:from-white dark:via-gray-300 dark:to-white bg-clip-text text-transparent tracking-tight"
        >
            {t.blacklist_title}
        </motion.h1>
        <p className="mt-4 text-gray-500 dark:text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">{t.dashboard_settings_description}</p>
      </header>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* 1. Keywords Section */}
        <section className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl shadow-blue-500/5 border border-gray-100 dark:border-gray-700 flex flex-col h-full hover:shadow-blue-500/10 transition-shadow duration-500">
          <SectionHeader 
            icon={Type} 
            title={t.keywords_section_title} 
            desc={t.keywords_section_description} 
            colorClass="bg-blue-50 dark:bg-blue-900/20 text-blue-500" 
          />
          
          <div className="flex gap-2 mb-8">
            <input
              type="text"
              value={newKeyword}
              onChange={(e) => setNewKeyword(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddKeyword()}
              placeholder={t.keyword_placeholder}
              className="flex-grow pl-5 pr-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 transition outline-none text-sm font-medium"
            />
            <button
              onClick={handleAddKeyword}
              className="p-4 bg-blue-600 text-white rounded-2xl hover:bg-blue-700 transition-all active:scale-95 shadow-lg shadow-blue-600/20"
            >
              <PlusCircle size={24} />
            </button>
          </div>
          
          <div className="flex-grow bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl p-4 min-h-[300px] border border-dashed border-gray-200 dark:border-gray-700">
            <AnimatePresence>
                {keywords.length > 0 ? (
                <div className="flex flex-wrap gap-2 content-start">
                    {keywords.map(keyword => (
                    <motion.div 
                        key={keyword}
                        initial={{ scale: 0.8, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.8, opacity: 0 }}
                        className="group flex items-center gap-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-2 pl-4 pr-2 rounded-xl text-sm font-bold shadow-sm hover:border-blue-500/50 transition-all"
                    >
                        <span className="text-gray-700 dark:text-gray-200">{keyword}</span>
                        <button onClick={() => removeKeyword(keyword)} className="p-1.5 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors">
                        <X size={14} />
                        </button>
                    </motion.div>
                    ))}
                </div>
                ) : (
                <div className="h-full flex flex-col items-center justify-center opacity-40">
                    <Type size={48} className="text-gray-300 dark:text-gray-600 mb-2" />
                    <p className="text-xs font-bold uppercase tracking-widest">{t.no_keywords_yet}</p>
                </div>
                )}
            </AnimatePresence>SectionHeader
          </div>
        </section>

        {/* 2. Blocked Stores Section */}
        <section className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl shadow-purple-500/5 border border-gray-100 dark:border-gray-700 flex flex-col h-full hover:shadow-purple-500/10 transition-shadow duration-500">
          <SectionHeader 
            icon={Store} 
            title={t.stores_section_title} 
            desc={t.stores_section_description} 
            colorClass="bg-purple-50 dark:bg-purple-900/20 text-purple-500" 
          />
          
          <div className="flex gap-2 mb-8">
            <input
              type="text"
              value={newStore}
              onChange={(e) => setNewStore(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddStore()}
              placeholder={t.store_placeholder}
              className="flex-grow pl-5 pr-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-purple-500/10 focus:border-purple-500 transition outline-none text-sm font-medium"
            />
            <button
              onClick={handleAddStore}
              className="p-4 bg-purple-600 text-white rounded-2xl hover:bg-purple-700 transition-all active:scale-95 shadow-lg shadow-purple-600/20"
            >
              <PlusCircle size={24} />
            </button>
          </div>
          
          <div className="flex-grow bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl p-4 min-h-[300px] border border-dashed border-gray-200 dark:border-gray-700">
             <AnimatePresence>
                {blockedStores.length > 0 ? (
                <div className="space-y-2">
                    {blockedStores.map(url => (
                    <motion.div 
                        key={url}
                        initial={{ x: -10, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 10, opacity: 0 }}
                        className="flex items-center justify-between gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-2xl text-sm font-bold shadow-sm group hover:border-purple-500/50 transition-all"
                    >
                        <div className="flex items-center gap-3 truncate">
                            <div className="w-2 h-2 rounded-full bg-purple-500 shadow-lg shadow-purple-500/50"></div>
                            <span className="truncate text-gray-700 dark:text-gray-200">{url}</span>
                        </div>
                        <button onClick={() => removeStore(url)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                        <Trash2 size={16} />
                        </button>
                    </motion.div>
                    ))}
                </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                        <Store size={48} className="text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">{t.no_stores_yet}</p>
                    </div>
                )}
            </AnimatePresence>
          </div>
        </section>

        {/* 3. Instagram Blacklist Section */}
        <section className="bg-white dark:bg-gray-800 p-8 rounded-[2.5rem] shadow-xl shadow-pink-500/5 border border-gray-100 dark:border-gray-700 flex flex-col h-full hover:shadow-pink-500/10 transition-shadow duration-500">
          <SectionHeader 
            icon={Instagram} 
            title={t.instagram_blacklist_title} 
            desc={t.instagram_blacklist_desc} 
            colorClass="bg-pink-50 dark:bg-pink-900/20 text-pink-500" 
          />
          
          <div className="flex gap-2 mb-8">
            <input
              type="text"
              value={newUser}
              onChange={(e) => setNewUser(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddUser()}
              placeholder={t.instagram_user_placeholder}
              className="flex-grow pl-5 pr-4 py-4 border border-gray-200 dark:border-gray-600 rounded-2xl bg-gray-50 dark:bg-gray-700/50 focus:ring-4 focus:ring-pink-500/10 focus:border-pink-500 transition outline-none text-sm font-medium"
            />
            <button
              onClick={handleAddUser}
              className="p-4 bg-pink-600 text-white rounded-2xl hover:bg-pink-700 transition-all active:scale-95 shadow-lg shadow-pink-600/20"
            >
              <PlusCircle size={24} />
            </button>
          </div>
          
          <div className="flex-grow bg-gray-50/50 dark:bg-gray-900/50 rounded-3xl p-4 min-h-[300px] border border-dashed border-gray-200 dark:border-gray-700">
             <AnimatePresence>
                {blacklistedUsers.size > 0 ? (
                <div className="space-y-2">
                    {Array.from(blacklistedUsers).map(username => (
                    <motion.div 
                        key={username}
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0.9, opacity: 0 }}
                        className="flex items-center justify-between gap-3 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 py-3 px-4 rounded-2xl text-sm font-bold shadow-sm group hover:border-pink-500/50 transition-all"
                    >
                        <div className="flex items-center gap-3 truncate">
                            <div className="w-8 h-8 rounded-full bg-pink-100 dark:bg-pink-900/20 flex items-center justify-center text-pink-600">
                                <UserX size={16} />
                            </div>
                            <span className="truncate text-gray-700 dark:text-gray-200">@{username}</span>
                        </div>
                        <button onClick={() => removeUser(username)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-xl transition-all">
                        <Trash2 size={16} />
                        </button>
                    </motion.div>
                    ))}
                </div>
                ) : (
                    <div className="h-full flex flex-col items-center justify-center opacity-40">
                        <Instagram size={48} className="text-gray-300 dark:text-gray-600 mb-2" />
                        <p className="text-xs font-bold uppercase tracking-widest">{t.no_instagram_users_yet}</p>
                    </div>
                )}
            </AnimatePresence>
          </div>
        </section>

      </div>
    </div>
  );
};

export default BlacklistPage;
