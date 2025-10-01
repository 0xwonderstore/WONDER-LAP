import React, { useState, useMemo } from 'react';
import InstagramPostCard from './InstagramPostCard';
import InstagramFilterComponent from './InstagramFilterComponent';
import { EmptyState } from './EmptyState';
import { InstagramPost } from '../types';
import postsData from '../data/instagram_posts.json';
import Pagination from './Pagination'; // Import the Pagination component

type SortOrder = 'default' | 'asc' | 'desc';

const InstagramFeedPage: React.FC = () => {
  // Ensure posts is always an array
  const [posts] = useState<InstagramPost[]>(Array.isArray(postsData) ? postsData : [postsData]);
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 100; // Changed to 100

  const languages = useMemo(() => [...new Set(posts.map(p => p.language))], [posts]);

  const filteredPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      if (selectedLanguage && post.language !== selectedLanguage) {
        return false;
      }
      return true;
    });

    if (sortOrder === 'asc') {
      filtered.sort((a, b) => a.likesCount - b.likesCount);
    } else if (sortOrder === 'desc') {
      filtered.sort((a, b) => b.likesCount - a.likesCount);
    }

    return filtered;
  }, [posts, sortOrder, selectedLanguage]);

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto p-4">
      <InstagramFilterComponent
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        languages={languages}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />
      {currentPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {currentPosts.map(post => (
              <InstagramPostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={filteredPosts.length}
            itemsPerPage={postsPerPage}
          />
        </>
      ) : (
        <EmptyState title="No Posts Found" hint="No posts match the current filters." />
      )}
    </div>
  );
};

export default InstagramFeedPage;
