import React, { useState, useMemo } from 'react';
import { Product, Locale } from '../types';
import ProductGrid from './ProductGrid';
import { Trash2 } from 'lucide-react';

const translations = {
  ar: { favorites: 'المفضلة', noFavorites: 'لم تقم بإضافة أي منتجات إلى المفضلة بعد.', backToHome: 'العودة إلى الصفحة الرئيسية', clearAll: 'مسح الكل', confirmClear: 'هل أنت متأكد أنك تريد مسح جميع المنتجات من المفضلة؟', confirm: 'تأكيد', cancel: 'إلغاء' },
  en: { favorites: 'Favorites', noFavorites: 'You have not added any products to your favorites yet.', backToHome: 'Back to Home', clearAll: 'Clear All', confirmClear: 'Are you sure you want to clear all products from your favorites?', confirm: 'Confirm', cancel: 'Cancel' }
};

interface FavoritesPageProps {
  allProducts: Product[];
  favorites: string[];
  onToggleFavorite: (productUrl: string) => void;
  onClearFavorites: () => void;
  locale: Locale;
  onShowHome: () => void;
}

const FavoritesPage: React.FC<FavoritesPageProps> = ({ allProducts, favorites, onToggleFavorite, onClearFavorites, locale, onShowHome }) => {
  const t = translations[locale];
  const [showConfirm, setShowConfirm] = useState(false);
  
  const sortedFavoriteProducts = useMemo(() => {
    const filtered = allProducts.filter(p => favorites.includes(p.url));
    return filtered.sort((a, b) => {
      const dateA = a.created_at ? new Date(a.created_at).getTime() : 0;
      const dateB = b.created_at ? new Date(b.created_at).getTime() : 0;
      return dateB - dateA;
    });
  }, [allProducts, favorites]);

  const handleClear = () => { onClearFavorites(); setShowConfirm(false); };

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">{t.favorites}</h2>
        {sortedFavoriteProducts.length > 0 && (
          <button onClick={() => setShowConfirm(true)} className="flex items-center gap-2 px-4 py-2 bg-red-500 text-white rounded-xl hover:bg-red-600 transition-colors">
            <Trash2 className="w-5 h-5" />
            <span>{t.clearAll}</span>
          </button>
        )}
      </div>

      {showConfirm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex justify-center items-center z-50 animate-fade-in-up" style={{animationDuration: '0.2s'}}>
          <div className="bg-light-surface dark:bg-dark-surface p-6 rounded-2xl shadow-xl text-center">
            <p className="mb-4">{t.confirmClear}</p>
            <div className="flex justify-center gap-4">
              <button onClick={() => setShowConfirm(false)} className="px-6 py-2 rounded-xl bg-gray-300 dark:bg-gray-600 hover:bg-gray-400">{t.cancel}</button>
              <button onClick={handleClear} className="px-6 py-2 rounded-xl bg-red-500 text-white hover:bg-red-600">{t.confirm}</button>
            </div>
          </div>
        </div>
      )}

      {sortedFavoriteProducts.length > 0 ? (
        <ProductGrid products={sortedFavoriteProducts} favorites={favorites} onToggleFavorite={onToggleFavorite} />
      ) : (
        <div className="text-center py-20">
          <p className="mb-4 text-lg text-light-text-secondary dark:text-dark-text-secondary">{t.noFavorites}</p>
          <button onClick={onShowHome} className="px-6 py-2 bg-brand-primary text-white rounded-xl hover:bg-brand-primary-dark transition-colors">{t.backToHome}</button>
        </div>
      )}
    </div>
  );
};

export default FavoritesPage;
