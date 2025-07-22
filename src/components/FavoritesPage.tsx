import React, { useState, useMemo, useRef } from 'react';
import { Product, Locale, FavoritesData } from '../types';
import ProductCard from './ProductCard';
import { Upload, Download, Edit2, Trash2, Check, X } from 'lucide-react';
import Papa from 'papaparse';

const translations = {
  ar: {
    myFavorites: 'مفضلتي',
    favorites: 'المفضلة',
    importList: 'استيراد قائمة',
    exportSelected: 'تصدير المحدد',
    deleteList: 'حذف القائمة',
    renameList: 'إعادة تسمية',
    confirmDelete: 'هل أنت متأكد من حذف هذه القائمة؟',
    noProducts: 'لا توجد منتجات في هذه القائمة.',
    selectAll: 'تحديد الكل',
  },
  en: {
    myFavorites: 'My Favorites',
    favorites: 'Favorites',
    importList: 'Import List',
    exportSelected: 'Export Selected',
    deleteList: 'Delete List',
    renameList: 'Rename',
    confirmDelete: 'Are you sure you want to delete this list?',
    noProducts: 'No products in this list.',
    selectAll: 'Select All',
  }
};

interface FavoritesPageProps {
  allProducts: Product[];
  favoritesData: FavoritesData;
  onToggleFavorite: (productUrl: string) => void;
  onManageLists: {
    addList: (id: string, name: string, products: string[]) => void;
    removeList: (listId: string) => void;
    renameList: (listId: string, newName: string) => void;
  };
  locale: Locale;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ allProducts, favoritesData, onToggleFavorite, onManageLists, locale }) => {
  const t = translations[locale];
  const [activeListId, setActiveListId] = useState<string>('my_main_favorites');
  const [selectedProducts, setSelectedProducts] = useState<string[]>([]);
  const [editingListId, setEditingListId] = useState<string | null>(null);
  const [newName, setNewName] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeList = useMemo(() => favoritesData[activeListId] || { name: t.myFavorites, products: [] }, [favoritesData, activeListId, t.myFavorites]);

  const productsInList = useMemo(() => {
    return allProducts.filter(p => activeList.products.includes(p.url))
      .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  }, [allProducts, activeList]);
  
  // Persist activeListId when favoritesData changes
  React.useEffect(() => {
    if (!favoritesData[activeListId]) {
      setActiveListId('my_main_favorites');
    }
  }, [favoritesData, activeListId]);


  const handleToggleSelection = (url: string) => {
    setSelectedProducts(prev => prev.includes(url) ? prev.filter(u => u !== url) : [...prev, url]);
  };
  
  const handleSelectAll = () => {
    if (selectedProducts.length === productsInList.length) {
      setSelectedProducts([]);
    } else {
      setSelectedProducts(productsInList.map(p => p.url));
    }
  };

  const handleExport = () => {
    const dataToExport = productsInList
      .filter(p => selectedProducts.includes(p.url))
      .map(p => ({
        name: p.name,
        product_url: p.url,
        image_url: p.images?.[0]?.src || '',
        added_date: new Date().toISOString(),
      }));
    
    if(dataToExport.length === 0) return;

    const csv = Papa.unparse(dataToExport);
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.setAttribute('download', `${activeList.name}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    Papa.parse(file, {
      header: true,
      complete: (results) => {
        const productUrls = results.data
          .map((row: any) => row.product_url)
          .filter(Boolean as any);
        
        const listId = `imported_${Date.now()}`;
        const listName = `${file.name.replace('.csv', '')} (${new Date().toLocaleDateString()})`;
        onManageLists.addList(listId, listName, productUrls);
        setActiveListId(listId);
      }
    });
  };

  const startRename = (listId: string) => {
    setEditingListId(listId);
    setNewName(favoritesData[listId].name);
  };

  const submitRename = (listId: string) => {
    if(newName.trim()) {
      onManageLists.renameList(listId, newName.trim());
    }
    setEditingListId(null);
  };

  return (
    <div className="flex flex-col md:flex-row gap-8 animate-fade-in-up">
      {/* Sidebar */}
      <aside className="w-full md:w-1/4 lg:w-1/5">
        <h2 className="text-xl font-bold mb-4">{t.favorites}</h2>
        <div className="space-y-2">
          {Object.entries(favoritesData).map(([id, list]) => (
            <div key={id} className={`group p-3 rounded-lg cursor-pointer transition-colors ${activeListId === id ? 'bg-brand-primary/10 text-brand-primary' : 'hover:bg-light-background dark:hover:bg-dark-background'}`} onClick={() => setActiveListId(id)}>
              {editingListId === id ? (
                <div className="flex gap-1 items-center">
                  <input type="text" value={newName} onChange={(e) => setNewName(e.target.value)} className="w-full bg-transparent border-b border-brand-primary outline-none" autoFocus onBlur={() => submitRename(id)} onKeyDown={(e) => e.key === 'Enter' && submitRename(id)} />
                  <button onClick={() => submitRename(id)}><Check className="w-4 h-4 text-green-500"/></button>
                  <button onClick={() => setEditingListId(null)}><X className="w-4 h-4 text-red-500"/></button>
                </div>
              ) : (
                <div className="flex justify-between items-center">
                  <span className="font-semibold">{list.name}</span>
                  <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button onClick={(e) => { e.stopPropagation(); startRename(id); }} aria-label={t.renameList}><Edit2 className="w-4 h-4" /></button>
                    {id !== 'my_main_favorites' && <button onClick={(e) => { e.stopPropagation(); if(window.confirm(t.confirmDelete)) onManageLists.removeList(id); }} aria-label={t.deleteList}><Trash2 className="w-4 h-4 text-red-500"/></button>}
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
        <button onClick={() => fileInputRef.current?.click()} className="w-full mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-green-500 text-white rounded-xl hover:bg-green-600 transition-colors">
          <Upload className="w-5 h-5"/>
          <span>{t.importList}</span>
        </button>
        <input type="file" ref={fileInputRef} className="hidden" accept=".csv" onChange={handleImport}/>
      </aside>

      {/* Main Content */}
      <main className="flex-1">
        <div className="flex justify-between items-center mb-6">
          <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-light-background dark:hover:bg-dark-background">
            <input type="checkbox" onChange={handleSelectAll} checked={selectedProducts.length === productsInList.length && productsInList.length > 0} className="w-4 h-4 rounded" />
            <span>{t.selectAll}</span>
          </label>
          <button onClick={handleExport} disabled={selectedProducts.length === 0} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl hover:bg-blue-600 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed">
            <Download className="w-5 h-5"/>
            <span>{t.exportSelected} ({selectedProducts.length})</span>
          </button>
        </div>

        {productsInList.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {productsInList.map(p => (
              <div key={p.url} className="relative">
                <input type="checkbox" checked={selectedProducts.includes(p.url)} onChange={() => handleToggleSelection(p.url)} className="absolute top-4 left-4 z-10 w-5 h-5 rounded-md"/>
                <ProductCard 
                  product={p} 
                  isFavorite={(favoritesData.my_main_favorites?.products || []).includes(p.url)}
                  onToggleFavorite={onToggleFavorite}
                  onNavigateWithFilter={() => {}}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-20"><p className="text-lg text-light-text-secondary dark:text-dark-text-secondary">{t.noProducts}</p></div>
        )}
      </main>
    </div>
  );
};

export default FavoritesPage;
