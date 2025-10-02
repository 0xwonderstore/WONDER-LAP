import React, { useState, useMemo } from 'react';
import InstagramPostCard from './InstagramPostCard';
import { EmptyState } from './EmptyState';
import { InstagramPost } from '../types';
import postsData from '../data/instagram_posts.json';
import Pagination from './Pagination';

const InstagramFeedPage: React.FC = () => {
  // Ensure posts is always an array
  const [posts] = useState<InstagramPost[]>(Array.isArray(postsData) ? postsData : []);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 100;

  const processedPosts = useMemo(() => {
    return [...posts];
  }, [posts]);
  
  const totalPages = Math.ceil(processedPosts.length / postsPerPage);
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = processedPosts.slice(indexOfFirstPost, indexOfLastPost)

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="container mx-auto p-4">
      {currentPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {currentPosts.map(post => (
              <InstagramPostCard key={post.id} post={post} />
            ))}
          </div>
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            onPageChange={handlePageChange}
            totalItems={processedPosts.length}
            itemsPerPage={postsPerPage}
          />
        </>
      ) : (
        <EmptyState title="No Posts Found" hint="No posts available." />
      )}
    </div>
  );
};

export default InstagramFeedPage;
