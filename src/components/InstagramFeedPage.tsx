
import React, { useState, useMemo } from 'react';
import InstagramPostCard from './InstagramPostCard';
import { EmptyState } from './EmptyState';
import { InstagramPost } from '../types';
import postsData from '../data/instagram_posts.json';
import Pagination from './Pagination';
import { InstagramFilterComponent } from './InstagramFilterComponent';

const InstagramFeedPage: React.FC = () => {
  // Ensure posts is always an array
  const [posts] = useState<InstagramPost[]>(Array.isArray(postsData) ? postsData : []);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 100;

  const [sortOrder, setSortOrder] = useState('default');
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);
  const [selectedLanguage, setSelectedLanguage] = useState('all');
  const [minLikes, setMinLikes] = useState(0);

  const processedPosts = useMemo(() => {
    let filteredPosts = posts.filter(post => 
      post && 
      typeof post.id === 'string' && 
      typeof post.postedAt === 'string' &&
      !isNaN(new Date(post.postedAt).getTime()) &&
      typeof post.likesCount === 'number' &&
      typeof post.displayUrl === 'string' &&
      post.displayUrl.trim() !== '' &&
      typeof post.commentsCount === 'number' &&
      typeof post.language === 'string'
    );

    // Filter by date range
    if (startDate && endDate) {
      filteredPosts = filteredPosts.filter(post => {
        const postDate = new Date(post.postedAt);
        return postDate >= startDate && postDate <= endDate;
      });
    }

    // Filter by language
    if (selectedLanguage !== 'all') {
      filteredPosts = filteredPosts.filter(post => post.language === selectedLanguage);
    }

    // Filter by minimum likes
    if (minLikes > 0) {
      filteredPosts = filteredPosts.filter(post => post.likesCount >= minLikes);
    }

    // Sort by likes
    if (sortOrder === 'asc') {
      filteredPosts.sort((a, b) => a.likesCount - b.likesCount);
    } else if (sortOrder === 'desc') {
      filteredPosts.sort((a, b) => b.likesCount - a.likesCount);
    }

    return filteredPosts;
  }, [posts, sortOrder, startDate, endDate, selectedLanguage, minLikes]);
  
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
      <InstagramFilterComponent
        sortOrder={sortOrder}
        setSortOrder={setSortOrder}
        startDate={startDate}
        setStartDate={setStartDate}
        endDate={endDate}
        setEndDate={setEndDate}
        selectedLanguage={selectedLanguage}
        setSelectedLanguage={setSelectedLanguage}
        minLikes={minLikes}
        setMinLikes={setMinLikes}
      />
      {currentPosts.length > 0 ? (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 mt-4">
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
        <EmptyState title="No Posts Found" hint="Try adjusting your filters." />
      )}
    </div>
  );
};

export default InstagramFeedPage;
