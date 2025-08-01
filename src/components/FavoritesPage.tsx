import React, { useState, useMemo, useCallback } from 'react';
import { Product, Locale } from '../types';
import { useFavoritesStore, FavoritesData } from '../stores/favoritesStore';
import ProductCard from './ProductCard';
import { EmptyState } from './EmptyState';
import { translations } from '../translations';
import { normalizeUrl } from '../utils/urlUtils';
import { useDropzone } from 'react-dropzone';
import Modal from './Modal';
import { Upload, Download, Edit, Trash2, Check, X, PlusCircle, Heart } from 'lucide-react';

// --- Sidebar Item ---
const SidebarListItem: React.FC<{ listId: string; name: string; isActive: boolean; isMain?: boolean; onSelect: () => void; onRename: () => void;}> = 
({ listId, name, isActive, isMain, onSelect, onRename }) => {
    const { removeList } = useFavoritesStore(s => s.actions);
    const t = translations['en'];

    const handleDelete = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (window.confirm(t.deleteConfirmation)) removeList(listId);
    };

    return (
        <div className={`group flex justify-between items-center w-full text-left p-2 rounded-lg cursor-pointer ${isActive ? 'bg-brand-primary/10 text-brand-primary font-bold' : 'hover:bg-light-hover dark:hover:bg-dark-hover'}`} onClick={onSelect}>
            <span className="flex items-center gap-2 text-sm truncate">
                {isMain && <Heart size={14} className="text-red-500 flex-shrink-0"/>}
                <span>{name}</span>
            </span>
            {!isMain && (
                <div className="hidden group-hover:flex items-center flex-shrink-0">
                    <button onClick={(e)=>{e.stopPropagation(); onRename();}} className="p-1 hover:text-blue-600"><Edit size={14} /></button>
                    <button onClick={handleDelete} className="p-1 hover:text-red-600"><Trash2 size={14} /></button>
                </div>
            )}
        </div>
    );
};

// --- Main Page ---
const FavoritesPage: React.FC<{ allProducts: Product[]; locale: Locale; onNavigateWithFilter: (f: any) => void; }> = ({ allProducts, locale, onNavigateWithFilter }) => {
    const { favorites } = useFavoritesStore();
    const { addList, renameList, importLists } = useFavoritesStore(s => s.actions);
    const t = translations[locale];
    
    const [selectedListId, setSelectedListId] = useState('my_main_favorites');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState<'add' | 'rename'>('add');
    const [listNameInput, setListNameInput] = useState('');
    const [listToRename, setListToRename] = useState<string | null>(null);

    const onDrop = useCallback((acceptedFiles: File[]) => {
        const file = acceptedFiles[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async () => {
            try {
                const data = JSON.parse(reader.result as string);
                // Add validation here if needed
                importLists(data);
                alert('Favorites imported successfully!');
            } catch (e) {
                alert('Failed to import favorites. Please make sure the file is valid.');
            }
        };
        reader.readAsText(file);
    }, [importLists]);

    const { getRootProps, getInputProps, isDragActive } = useDropzone({ onDrop, accept: { 'application/json': ['.json'] }, noClick: true, noKeyboard: true });

    const productsInSelectedList = useMemo(() => {
        const list = favorites[selectedListId];
        if (!list) {
            setSelectedListId('my_main_favorites');
            return [];
        }
        const urlSet = new Set(list.products.map(normalizeUrl));
        return allProducts.filter(p => urlSet.has(normalizeUrl(p.url)));
    }, [selectedListId, favorites, allProducts]);

    const handleModalSubmit = () => {
        if (!listNameInput.trim()) return;
        if (modalMode === 'add') addList(listNameInput);
        if (modalMode === 'rename' && listToRename) renameList(listToRename, listNameInput);
        setIsModalOpen(false);
        setListNameInput('');
        setListToRename(null);
    };

    const openModal = (mode: 'add' | 'rename', listId?: string, currentName?: string) => {
        setModalMode(mode);
        if (mode === 'rename' && listId && currentName) {
            setListToRename(listId);
            setListNameInput(currentName);
        } else {
            setListNameInput('');
        }
        setIsModalOpen(true);
    };

    return (
        <div {...getRootProps({ className: `flex flex-col md:flex-row gap-6 transition-all ${isDragActive ? 'bg-blue-500/10' : ''}` })}>
            <input {...getInputProps()} />
            
            {/* --- Dropzone Overlay --- */}
            {isDragActive && (
                <div className="absolute inset-0 bg-blue-500/30 flex items-center justify-center z-20 pointer-events-none">
                    <div className="text-center p-8 bg-white rounded-lg shadow-2xl">
                        <Upload size={48} className="mx-auto text-blue-600" />
                        <p className="mt-4 text-xl font-bold">Drop to import favorites</p>
                    </div>
                </div>
            )}

            {/* --- Sidebar --- */}
            <aside className="w-full md:w-1/4 md:max-w-xs p-4 bg-light-surface dark:bg-dark-surface rounded-2xl shadow-md flex flex-col self-start">
                <div className="flex-grow">
                    <h2 className="text-lg font-bold border-b pb-2 mb-2">{t.favorites}</h2>
                    <div className="flex flex-col gap-1">
                        {Object.entries(favorites).map(([id, list]) => (
                            <SidebarListItem key={id} listId={id} name={list.name} isActive={selectedListId === id} isMain={id === 'my_main_favorites'} onSelect={() => setSelectedListId(id)} onRename={() => openModal('rename', id, list.name)} />
                        ))}
                    </div>
                </div>
                <div className="mt-4 pt-4 border-t flex flex-col gap-2">
                    <button onClick={() => openModal('add')} className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-indigo-500 text-white rounded-lg hover:bg-indigo-600 text-sm"><PlusCircle size={16} /><span>{t.addNewList}</span></button>
                    <label htmlFor="import-button" className="flex items-center justify-center gap-2 w-full px-3 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 text-sm cursor-pointer"><Upload size={16} /><span>{t.importFavorites}</span></label>
                </div>
            </aside>

            {/* --- Content --- */}
            <main className="flex-grow">
                {productsInSelectedList.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6 animate-fade-in-up">
                        {productsInSelectedList.map(p => <ProductCard key={`${selectedListId}-${p.url}`} product={p} onNavigateWithFilter={onNavigateWithFilter}/>)}
                    </div>
                ) : <EmptyState />}
            </main>

            {/* --- Modal --- */}
            <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={modalMode === 'add' ? t.addNewList : t.renameList}>
                <div className="flex flex-col gap-4">
                    <input type="text" value={listNameInput} onChange={e => setListNameInput(e.target.value)} className="p-2 border rounded-md bg-light-background dark:bg-dark-background" placeholder="List name" autoFocus onKeyDown={e => e.key === 'Enter' && handleModalSubmit()} />
                    <div className="flex justify-end gap-2">
                        <button onClick={() => setIsModalOpen(false)} className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg">{t.cancel}</button>
                        <button onClick={handleModalSubmit} className="px-4 py-2 bg-brand-primary text-white rounded-lg">{t.save}</button>
                    </div>
                </div>
            </Modal>
        </div>
    );
};

export default FavoritesPage;
