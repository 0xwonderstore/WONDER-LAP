import React, { useState, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { Trash2, Download, Upload, FileText, Link as LinkIcon, Plus, Search, CheckCircle, EyeOff, Eye } from 'lucide-react';
import { useBlacklistStore } from '../stores/blacklistStore';
import { useInstagramBlacklistStore } from '../stores/instagramBlacklistStore';
import { Product, InstagramPost } from '../types';
import { motion, AnimatePresence } from 'framer-motion';
import { useToastStore } from '../stores/toastStore';

interface HiddenItemsPageProps {
  products: Product[];
  instagramPosts: InstagramPost[];
}

const HiddenItemsPage: React.FC<HiddenItemsPageProps> = ({ products, instagramPosts }) => {
  const { t } = useTranslation();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [activeTab, setActiveTab] = useState<'products' | 'instagram'>('products');
  const [manualInput, setManualInput] = useState('');
  const [searchUrl, setSearchUrl] = useState('');
  const { showToast } = useToastStore();

  const { 
    hiddenProducts, 
    unhideProduct, 
    clearHiddenProducts, 
    exportBlacklistToCSV, 
    importBlacklist,
    hideProducts 
  } = useBlacklistStore();

  const { 
    blacklistedPosts, 
    removePost, 
    clearBlacklistedPosts, 
    exportInstagramBlacklistToCSV, 
    importInstagramBlacklist,
    addPosts 
  } = useInstagramBlacklistStore();

  const currentList = activeTab === 'products' ? hiddenProducts : Array.from(blacklistedPosts);
  
  // Stats
  const totalHidden = currentList.length;

  // Search Logic
  const searchResult = useMemo(() => {
      if (!searchUrl.trim()) return null;
      const isHidden = currentList.includes(searchUrl.trim());
      return { isHidden, url: searchUrl.trim() };
  }, [searchUrl, currentList]);

  const handleUnhide = (id: string) => {
    if (activeTab === 'products') {
      unhideProduct(id);
    } else {
      removePost(id);
    }
    setSearchUrl(''); // Clear search after action
    showToast('Item unhidden', 'success');
  };

  const handleHide = (id: string) => {
      if (activeTab === 'products') {
          hideProducts([id]);
      } else {
          addPosts([id]);
      }
      showToast('Item archived', 'added');
  };

  const handleClearAll = () => {
    if (window.confirm(t('confirm_remove_favorites') || "Are you sure?")) {
        if (activeTab === 'products') {
            clearHiddenProducts();
        } else {
            clearBlacklistedPosts();
        }
    }
  };

  const handleExport = () => {
    const data = activeTab === 'products' ? exportBlacklistToCSV() : exportInstagramBlacklistToCSV();
    // Add BOM for Excel UTF-8 compatibility
    const blob = new Blob(["\uFEFF"+data], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${activeTab}_hidden_list.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast(t('export_success'), 'success');
  };

  const handleImportFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      if (content) {
        const count = activeTab === 'products' 
            ? importBlacklist(content) 
            : importInstagramBlacklist(content);
        
        if (count > 0) {
            showToast(t('import_success', { count }), 'success');
        } else {
            showToast(t('import_error'), 'error');
        }
      }
    };
    reader.readAsText(file);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const handleManualAdd = () => {
      if (!manualInput.trim()) return;
      
      const urls = manualInput.split('\n').map(l => l.trim()).filter(l => l.length > 0);
      if (urls.length === 0) return;

      if (activeTab === 'products') {
          hideProducts(urls);
      } else {
          addPosts(urls);
      }
      
      showToast(t('import_success', { count: urls.length }), 'success');
      setManualInput('');
  };

  return (
    <div className="animate-fade-in-up max-w-5xl mx-auto pb-12 px-4">
      
      {/* Header & Stats Board */}
      <div className="mb-12">
          <div className="flex flex-col md:flex-row justify-between items-end gap-6 mb-8">
            <div>
                <h1 className="text-4xl font-black text-gray-900 dark:text-white mb-2 flex items-center gap-3">
                    <Trash2 className="text-red-500" size={36} />
                    {t('hidden_items')}
                </h1>
                <p className="text-gray-500 dark:text-gray-400">{t('hidden_items_subtitle')}</p>
            </div>
            
            {/* Elegant Tab Switcher */}
            <div className="bg-white dark:bg-gray-800 p-1.5 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 flex gap-2">
                <button 
                    onClick={() => setActiveTab('products')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'products' ? 'bg-indigo-500 text-white shadow-lg shadow-indigo-200 dark:shadow-none' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    {t('products') || 'Products'}
                </button>
                <button 
                    onClick={() => setActiveTab('instagram')}
                    className={`px-6 py-2.5 rounded-xl text-sm font-bold transition-all duration-300 ${activeTab === 'instagram' ? 'bg-pink-500 text-white shadow-lg shadow-pink-200 dark:shadow-none' : 'text-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700'}`}
                >
                    {t('instagram_feature') || 'Instagram'}
                </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gradient-to-br from-red-500 to-orange-500 rounded-3xl p-6 text-white shadow-xl shadow-red-500/10 relative overflow-hidden">
                  <div className="relative z-10">
                      <p className="text-red-100 font-medium text-sm mb-1">{t('total_archived')}</p>
                      <h3 className="text-4xl font-black tracking-tight">{totalHidden.toLocaleString()}</h3>
                  </div>
                  <Trash2 className="absolute -bottom-4 -right-4 w-32 h-32 text-white opacity-10 rotate-12" />
              </div>

              <div className="md:col-span-2 bg-white dark:bg-gray-800 rounded-3xl p-6 border border-gray-100 dark:border-gray-700 shadow-sm flex flex-col justify-center">
                  <label className="text-sm font-bold text-gray-500 dark:text-gray-400 mb-3 flex items-center gap-2">
                      <Search size={16} />
                      {t('search_archive') || 'Check URL Status'}
                  </label>
                  <div className="relative group">
                      <input 
                          type="text" 
                          value={searchUrl}
                          onChange={(e) => setSearchUrl(e.target.value)}
                          placeholder={t('check_url_placeholder')}
                          className="w-full bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-xl px-5 py-4 pl-12 text-sm font-medium focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 transition-all outline-none"
                      />
                      <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-indigo-500 transition-colors" size={20} />
                  </div>
                  
                  {/* Search Result Display */}
                  <AnimatePresence>
                      {searchResult && (
                          <motion.div 
                              initial={{ opacity: 0, y: -10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              className={`mt-4 p-4 rounded-xl flex items-center justify-between gap-4 ${searchResult.isHidden ? 'bg-red-50 dark:bg-red-900/10 border border-red-100 dark:border-red-900/30' : 'bg-green-50 dark:bg-green-900/10 border border-green-100 dark:border-green-900/30'}`}
                          >
                              <div className="flex items-center gap-3 overflow-hidden">
                                  <div className={`p-2 rounded-full ${searchResult.isHidden ? 'bg-red-100 text-red-600' : 'bg-green-100 text-green-600'}`}>
                                      {searchResult.isHidden ? <EyeOff size={18} /> : <CheckCircle size={18} />}
                                  </div>
                                  <div className="min-w-0">
                                      <p className={`text-sm font-bold ${searchResult.isHidden ? 'text-red-700 dark:text-red-400' : 'text-green-700 dark:text-green-400'}`}>
                                          {searchResult.isHidden ? t('url_is_hidden') : t('url_is_not_hidden')}
                                      </p>
                                      <p className="text-xs text-gray-500 dark:text-gray-400 truncate opacity-70">{searchResult.url}</p>
                                  </div>
                              </div>
                              
                              {searchResult.isHidden ? (
                                  <button onClick={() => handleUnhide(searchResult.url)} className="px-4 py-2 bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 text-xs font-bold rounded-lg shadow-sm hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors shrink-0">
                                      {t('unhide')}
                                  </button>
                              ) : (
                                  <button onClick={() => handleHide(searchResult.url)} className="px-4 py-2 bg-red-600 text-white text-xs font-bold rounded-lg shadow-sm hover:bg-red-700 transition-colors shrink-0">
                                      {t('add_to_archive')}
                                  </button>
                              )}
                          </motion.div>
                      )}
                  </AnimatePresence>
              </div>
          </div>
      </div>

      {/* Advanced Tools Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          
          {/* Manual Input */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col h-full">
              <div className="flex items-center gap-3 mb-6 text-gray-800 dark:text-white">
                  <div className="p-2.5 bg-indigo-50 dark:bg-indigo-900/20 rounded-xl text-indigo-500">
                      <LinkIcon size={24} />
                  </div>
                  <h3 className="text-lg font-bold">Bulk Add</h3>
              </div>
              
              <div className="flex-grow flex flex-col gap-4">
                  <textarea 
                    value={manualInput}
                    onChange={(e) => setManualInput(e.target.value)}
                    placeholder="Paste URLs here (one per line)..."
                    className="w-full flex-grow bg-gray-50 dark:bg-gray-900 border border-gray-200 dark:border-gray-700 rounded-2xl p-4 text-sm focus:ring-4 focus:ring-indigo-500/10 focus:border-indigo-500 outline-none resize-none min-h-[150px]"
                  />
                  <button 
                    onClick={handleManualAdd}
                    disabled={!manualInput.trim()}
                    className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white py-3.5 rounded-xl font-bold transition-all shadow-lg shadow-indigo-500/20 active:scale-95 flex justify-center items-center gap-2"
                  >
                      <Plus size={18} />
                      Add to Archive
                  </button>
              </div>
          </div>

          {/* Data Management */}
          <div className="bg-white dark:bg-gray-800 rounded-3xl p-8 shadow-sm border border-gray-100 dark:border-gray-700 flex flex-col">
              <div className="flex items-center gap-3 mb-6 text-gray-800 dark:text-white">
                  <div className="p-2.5 bg-teal-50 dark:bg-teal-900/20 rounded-xl text-teal-500">
                      <FileText size={24} />
                  </div>
                  <h3 className="text-lg font-bold">Data Management</h3>
              </div>

              <div className="space-y-4">
                  <button onClick={handleExport} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 transition-all group">
                      <div className="flex items-center gap-3">
                          <Download className="text-gray-400 group-hover:text-indigo-500 transition-colors" size={20} />
                          <div className="text-left">
                              <p className="font-bold text-gray-700 dark:text-gray-200 text-sm">Export CSV</p>
                              <p className="text-xs text-gray-400">Download list as CSV file</p>
                          </div>
                      </div>
                  </button>

                  <button onClick={() => fileInputRef.current?.click()} className="w-full flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/30 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-2xl border border-gray-200 dark:border-gray-600 transition-all group relative overflow-hidden">
                      <input type="file" ref={fileInputRef} onChange={handleImportFile} accept=".json,.txt,.csv" className="absolute inset-0 opacity-0 cursor-pointer" />
                      <div className="flex items-center gap-3">
                          <Upload className="text-gray-400 group-hover:text-teal-500 transition-colors" size={20} />
                          <div className="text-left">
                              <p className="font-bold text-gray-700 dark:text-gray-200 text-sm">Import List</p>
                              <p className="text-xs text-gray-400">Merge JSON, Text, or CSV files</p>
                          </div>
                      </div>
                  </button>

                  <div className="h-px bg-gray-100 dark:bg-gray-700 my-2"></div>

                  <button onClick={handleClearAll} className="w-full flex items-center justify-center gap-2 p-3 text-red-500 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-900/10 rounded-xl transition-colors font-bold text-sm">
                      <Trash2 size={16} />
                      {t('unhide_all')}
                  </button>
              </div>
          </div>
      </div>

    </div>
  );
};

export default HiddenItemsPage;
