import { useState } from 'react';
import InstagramCard from './InstagramCard';
import posts from '../data/instagram_posts.json';
import Pagination from './Pagination';
import { useTranslation } from 'react-i18next';

const InstagramPage = () => {
  const [currentPage, setCurrentPage] = useState(1);
  const { t } = useTranslation();
  const POSTS_PER_PAGE = 100;

  const totalPages = Math.ceil(posts.length / POSTS_PER_PAGE);
  const paginatedPosts = posts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  return (
    <div className="container mx-auto p-4">
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
          totalItems={posts.length}
          itemName={t('instagram_posts')}
        />
      </div>
    </div>
  );
};

export default InstagramPage;