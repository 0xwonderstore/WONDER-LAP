import React, { useState, useMemo } from 'react';
import InstagramPostCard from './InstagramPostCard';
import InstagramFilterComponent from './InstagramFilterComponent';
import { EmptyState } from './EmptyState';
import { InstagramPost } from '../types';
import postsData from '../data/instagram_posts.json';
import { DateRange } from 'react-day-picker';

type SortOrder = 'default' | 'asc' | 'desc';

const InstagramFeedPage: React.FC = () => {
  // Ensure posts is always an array
  const [posts] = useState<InstagramPost[]>(Array.isArray(postsData) ? postsData : [postsData]);
  const [selectedUsername, setSelectedUsername] = useState<string | null>(null);
  const [date, setDate] = useState<DateRange | undefined>(undefined);
  const [minLikes, setMinLikes] = useState<number | null>(null);
  const [maxLikes, setMaxLikes] = useState<number | null>(null);
  const [sortOrder, setSortOrder] = useState<SortOrder>('default');
  const [selectedLanguage, setSelectedLanguage] = useState<string | null>(null);

  const usernames = useMemo(() => [...new Set(posts.map(p => p.ownerUsername))], [posts]);
  const languages = useMemo(() => [...new Set(posts.map(p => p.language))], [posts]);

  const filteredPosts = useMemo(() => {
    let filtered = posts.filter(post => {
      if (selectedUsername && post.ownerUsername !== selectedUsername) {
        return false;
      }
      if (selectedLanguage && post.language !== selectedLanguage) {
        return false;
      }
      const postDate = new Date(post.timestamp);
      if (date?.from && postDate < date.from) {
        return false;
      }
      if (date?.to && postDate > date.to) {
        return false;
      }
      if (minLikes !== null && post.likesCount < minLikes) {
        return false;
      }
      if (maxLikes !== null && post.likesCount > maxLikes) {
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
  }, [posts, selectedUsername, date, minLikes, maxLikes, sortOrder, selectedLanguage]);

  return (
    <div className="container mx-auto p-4">
      <InstagramFilterComponent
        usernames={usernames}
        selectedUsername={selectedUsername}
        onUsernameChange={setSelectedUsername}
        date={date}
        onDateChange={setDate}
        minLikes={minLikes}
        maxLikes={maxLikes}
        onLikesChange={(min, max) => {
          setMinLikes(min);
          setMaxLikes(max);
        }}
        sortOrder={sortOrder}
        onSortOrderChange={setSortOrder}
        languages={languages}
        selectedLanguage={selectedLanguage}
        onLanguageChange={setSelectedLanguage}
      />
      {filteredPosts.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {filteredPosts.map(post => (
            <InstagramPostCard key={post.id} post={post} />
          ))}
        </div>
      ) : (
        <EmptyState title="No Posts Found" hint="No posts match the current filters." />
      )}
    </div>
  );
};

export default InstagramFeedPage;
