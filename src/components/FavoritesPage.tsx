import React, { useMemo, useState } from 'react';
import { useFavoritesStore } from '../stores/favoritesStore';
import ProductCard from './ProductCard';
import InstagramCard from './InstagramCard';
import { EmptyState } from './EmptyState';
import { useLanguageStore } from '../stores/languageStore';
import { translations } from '../translations';
import Pagination from './Pagination';
import SegmentedControl from './SegmentedControl';
import { Package, Instagram } from 'lucide-react';
import { useInstagramBlacklistStore } from '../stores/instagramBlacklistStore';

type ActiveView = 'products' | 'instagram';

const FavoritesPage: React.FC<{onNavigateWithFilter: (f: any) => void}> = ({ onNavigateWithFilter }) => {
  const { language } = useLanguage-store();
  const t = translations[language];
  const { favoriteItems } = useFavoritesStore();
  const { blacklistedUsers, addUser, removeUser } = useInstagramBlacklistStore();
  const [currentPage, setCurrentPage] = useState(1);
  const [activeView, setActiveView] = useState<ActiveView>('products');
  const itemsPerPage = 24;

  const { paginatedItems, totalPages, totalItems } = useMemo(() => {
    const items = Array.from(favoriteItems.values()).filter(item => item.type === activeView);
    
    const total = items.length;
    const pages = Math.ceil(total / itemsPerPage);
    const paginated = items.slice((currentPage - 1) * itemsPerPage, currentPage * itemsPerPage);

    return { paginatedItems: paginated, totalPages: pages, totalItems: total };
  }, [favoriteItems, currentPage, activeView]);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };
  
  const handleBlacklistToggle = (username: string) => {
    if (blacklistedUsers.has(username)) {
      removeUser(username);
    } else {
      addUser(username);
    }
  };

  const tabs = [
    { id: 'products', label: t.product, icon: <Package size={16} /> },
    { id: 'instagram', label: t.instagram, icon: <Instagram size={16} /> },
  ];

  return (
    <div className="animate-fade-in-up">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-3xl font-bold text-light-text-primary dark:text-dark-text-primary">
          {t.favorites_title.replace('{count}', favoriteItems.size.toString())}
        </h1>
        <SegmentedControl tabs={tabs} activeTab={activeView} onTabChange={(id) => { setActiveView(id as ActiveView); setCurrentPage(1); }} />
      </div>

      {totalItems > 0 ? (
        <>
          <div className={`grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6`}>
            {paginatedItems.map(item =>
              item.type === 'product' ? (
                <ProductCard key={item.url} product={item} t={t} onNavigateWithFilter={onNavigateWithFilter}/>
              ) : (
                <InstagramCard key={item.permalink} post={item} onBlacklistToggle={handleBlacklistToggle} isBlacklisted={blacklistedUsers.has(item.username)}/>
              )
            )}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={totalItems}
            itemsPerPage={itemsPerPage}
            t={t}
          />
        </>
      ) : (
        <EmptyState title={t.no_favorites_title} hint={t.no_favorites_hint} />
      )}
    </div>
  );
};

export default FavoritesPage;
