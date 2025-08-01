import React, { useRef, useState, useMemo } from 'react';
import { Product, Locale } from '../types';
import { useFavoritesStore, FavoritesData } from '../stores/favoritesStore';
import ProductCard from './ProductCard';
import EmptyState from './EmptyState';
import { translations } from '../translations';
import { normalizeUrl } from '../utils/urlUtils';
import { Upload, Download, Edit, Trash2, Check, X, PlusCircle } from 'lucide-react';

interface FavoritesPageProps {
  allProducts: Product[];
  locale: Locale;
  onNavigateWithFilter: (filter: { store?: string; name?: string }) => void;
}

const FavoriteListSection: React.FC<{
    listId: string;
    listName: string;
    productUrls: string[];
    allProducts: Product[];
    isMainList?: boolean;
    onNavigateWithFilter: (filter: { store?: string; name?: string }) => void;
}> = ({ listId, listName, productUrls, allProducts, isMainList = false, onNavigateWithFilter }) => {
    
    const { renameList, removeList } = useFavoritesStore();
    const [isEditing, setIsEditing] = useState(false);
    const [editedName, setEditedName] = useState(listName);
    const t = translations['en']; // Assuming locale is available or defaulting

    const products = useMemo(() => {
        const urlSet = new Set(productUrls.map(normalizeUrl));
        return allProducts.filter(p => urlSet.has(normalizeUrl(p.url)));
    }, [productUrls, allProducts]);

    const handleRename = () => {
        if (editedName.trim() && editedName !== listName) {
            renameList(listId, editedName.trim());
        }
        setIsEditing(false);
    };

    const handleDelete = () => {
        if (window.confirm(t.deleteConfirmation)) {
            removeList(listId);
        }
    };

    return (
        <div className="mb-12">
            <div className="flex justify-between items-center mb-4 pb-2 border-b-2 border-light-border dark:border-dark-border">
                {isEditing ? (
                    <div className="flex gap-2">
                        <input type="text" value={editedName} onChange={e => setEditedName(e.target.value)} className="p-2 border rounded-md bg-light-background dark:bg-dark-background" autoFocus />
                        <button onClick={handleRename} className="p-2 bg-green-500 text-white rounded-md"><Check size={18} /></button>
                        <button onClick={() => setIsEditing(false)} className="p-2 bg-gray-500 text-white rounded-md"><X size={18} /></button>
                    </div>
                ) : (
                    <h2 className="text-2xl font-bold">{listName}</h2>
                )}
                {!isMainList && !isEditing && (
                    <div className="flex gap-2">
                        <button onClick={() => setIsEditing(true)} title={t.renameList} className="p-2 hover:bg-light-hover dark:hover:bg-dark-hover rounded-full"><Edit size={18} /></button>
                        <button onClick={handleDelete} title={t.deleteList} className="p-2 hover:bg-light-hover dark:hover:bg-dark-hover rounded-full text-red-500"><Trash2 size={18} /></button>
                    </div>
                )}
            </div>
            {products.length > 0 ? (
                 <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {products.map(p => (
                        <ProductCard key={`${listId}-${p.url}`} product={p} onNavigateWithFilter={onNavigateWithFilter} />
                    ))}
                </div>
            ) : (
                <div className="text-center py-8 text-gray-500">{ isMainList ? <EmptyState /> : 'This list is empty.' }</div>
            )}
        </div>
    );
};


const FavoritesPage: React.FC<FavoritesPageProps> = ({ allProducts, locale, onNavigateWithFilter }) => {
  const { favorites, importLists, exportLists, addList } = useFavoritesStore();
  const t = translations[locale];
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleExport = () => {
    const data = exportLists();
    const jsonString = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(data, null, 2))}`;
    const link = document.createElement('a');
    link.href = jsonString;
    link.download = 'favorites.json';
    link.click();
  };

  const handleImportClick = () => {
    fileInputRef.current?.click();
  };
  
  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const text = e.target?.result;
          if (typeof text === 'string') {
            const data: FavoritesData = JSON.parse(text);
            importLists(data);
          }
        } catch (error) {
          console.error("Error parsing JSON file:", error);
          alert("Error: Could not parse the favorites file.");
        }
      };
      reader.readAsText(file);
    }
    event.target.value = '';
  };
  
  const handleAddNewList = () => {
    const newListName = prompt("Enter the name for the new list:");
    if (newListName?.trim()) {
        addList(newListName.trim());
    }
  };
  
  const mainList = favorites.my_main_favorites;
  const otherLists = Object.entries(favorites).filter(([id]) => id !== 'my_main_favorites');

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">{t.favorites}</h1>
        <div className="flex gap-2">
            <button onClick={handleAddNewList} className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 transition-colors">
                <PlusCircle size={18} />
                <span>{t.addNewList}</span>
            </button>
            <button onClick={handleImportClick} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors">
                <Upload size={18} />
                <span>{t.importFavorites}</span>
            </button>
            <input type="file" ref={fileInputRef} onChange={handleFileChange} accept=".json" style={{ display: 'none' }} />
            <button onClick={handleExport} className="flex items-center gap-2 px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition-colors">
                <Download size={18} />
                <span>{t.exportFavorites}</span>
            </button>
        </div>
      </div>

      <FavoriteListSection
          listId="my_main_favorites"
          listName={mainList.name}
          productUrls={mainList.products}
          allProducts={allProducts}
          isMainList={true}
          onNavigateWithFilter={onNavigateWithFilter}
      />

      {otherLists.map(([id, list]) => (
          <FavoriteListSection
              key={id}
              listId={id}
              listName={list.name}
              productUrls={list.products}
              allProducts={allProducts}
              onNavigateWithFilter={onNavigateWithFilter}
          />
      ))}
    </div>
  );
};

export default FavoritesPage;
