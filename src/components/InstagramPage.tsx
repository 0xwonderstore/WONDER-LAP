import { useState, useMemo, useCallback } from 'react';
import InstagramCard from './InstagramCard';
import allPosts from '../data/instagram_posts.json';
import Pagination from './Pagination';
import { useTranslation } from 'react-i18next';
import InstagramFilterComponent from './InstagramFilterComponent';
import { DateRange } from 'react-day-picker';

const InstagramPage = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    username: '',
    minLikes: null,
    maxLikes: null,
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sort, setSort] = useState<'asc' | 'desc' | null>(null);

  const POSTS_PER_PAGE = 100;

  const uniqueUsernames = useMemo(() => {
    return [...new Set(allPosts.map(p => p.username).filter(Boolean))];
  }, []);

  const filteredAndSortedPosts = useMemo(() => {
    let posts = [...allPosts];

    // Apply filters
    if (filters.username) {
      posts = posts.filter(p => p.username === filters.username);
    }
    if (filters.minLikes !== null) {
      posts = posts.filter(p => p.likesCount >= filters.minLikes!);
    }
    if (filters.maxLikes !== null) {
        posts = posts.filter(p => p.likesCount <= filters.maxLikes!);
    }
    if (dateRange?.from) {
        posts = posts.filter(p => new Date(p.postedAt) >= dateRange.from!);
    }
    if (dateRange?.to) {
        posts = posts.filter(p => new Date(p.postedAt) <= dateRange.to!);
    }

    // Apply sorting
    if (sort) {
      posts.sort((a, b) => {
        if (sort === 'asc') {
          return a.likesCount - b.likesCount;
        } else {
          return b.likesCount - a.likesCount;
        }
      });
    }

    return posts;
  }, [filters, dateRange, sort]);

  const totalPages = Math.ceil(filteredAndSortedPosts.length / POSTS_PER_PAGE);
  const paginatedPosts = filteredAndSortedPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );
  
  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters(prev => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const handleDateChange = useCallback((newDateRange: DateRange | undefined) => {
    setDateRange(newDateRange);
    setCurrentPage(1);
  }, []);

  const handleSortChange = useCallback((newSort: 'asc' | 'desc' | null) => {
    setSort(newSort);
    setCurrentPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setFilters({
      username: '',
      minLikes: null,
      maxLikes: null,
    });
    setDateRange(undefined);
    setSort(null);
    setCurrentPage(1);
    // You might need to manually reset the input fields in the filter component
  }, []);


  return (
    <div className="container mx-auto p-4">
      <InstagramFilterComponent
        usernames={uniqueUsernames}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onDateChange={handleDateChange}
        onReset={handleReset}
        currentSort={sort}
        date={dateRange}
        setDate={setDateRange}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paginatedPosts.map(post => (
          <InstagramCard key={post.id} post={post} />
        ))}
      </div>
      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={POSTS_PER_PAGE}
          totalItems={filteredAndSortedPosts.length}
          itemName={t('instagram_posts')}
        />
      </div>
    </div>
  );
};

export default InstagramPage;