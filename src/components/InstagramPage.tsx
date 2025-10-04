import { useState, useMemo, useCallback } from "react";
import InstagramCard from "./InstagramCard";
import posts1 from "../data/instagram_posts_1.json";
import posts2 from "../data/instagram_posts_2.json";
import posts3 from "../data/instagram_posts_3.json";
import posts4 from "../data/instagram_posts_4.json";
import posts5 from "../data/instagram_posts_5.json";
import posts6 from "../data/instagram_posts_6.json";
import posts7 from "../data/instagram_posts_7.json";
import posts8 from "../data/instagram_posts_8.json";
import posts9 from "../data/instagram_posts_9.json";
import posts10 from "../data/instagram_posts_10.json";
import Pagination from "./Pagination";
import { useTranslation } from "react-i18next";
import InstagramFilterComponent from "./InstagramFilterComponent";
import { DateRange } from "react-day-picker";

const allPosts = [
  ...posts1,
  ...posts2,
  ...posts3,
  ...posts4,
  ...posts5,
  ...posts6,
  ...posts7,
  ...posts8,
  ...posts9,
  ...posts10,
];

const InstagramPage = () => {
  const { t } = useTranslation();
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({
    username: "",
    minLikes: null,
    maxLikes: null,
  });
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
  const [sort, setSort] = useState<"asc" | "desc" | null>(null);

  const POSTS_PER_PAGE = 100;

  const uniqueUsernames = useMemo(() => {
    return [...new Set(allPosts.map((p) => p.username).filter(Boolean))];
  }, []);

  const filteredAndSortedPosts = useMemo(() => {
    let posts = [...allPosts];

    const seen = new Set();
    posts = posts.filter(post => {
      const duplicate = seen.has(post.permalink);
      seen.add(post.permalink);
      return !duplicate;
    });

    // Apply filters
    if (filters.username) {
      posts = posts.filter((p) => p.username === filters.username);
    }
    if (filters.minLikes !== null) {
      posts = posts.filter((p) => p.likes >= filters.minLikes!);
    }
    if (filters.maxLikes !== null) {
      posts = posts.filter((p) => p.likes <= filters.maxLikes!);
    }
    if (dateRange?.from) {
      posts = posts.filter((p) => new Date(p.timestamp) >= dateRange.from!);
    }
    if (dateRange?.to) {
      posts = posts.filter((p) => new Date(p.timestamp) <= dateRange.to!);
    }

    // Apply sorting by likes
    if (sort) {
      posts.sort((a, b) => {
        if (sort === "asc") {
          return a.likes - b.likes;
        } else {
          return b.likes - a.likes;
        }
      });
    } else {
      // Default sort by timestamp, descending
      posts.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
    }

    return posts;
  }, [filters, dateRange, sort]);

  const totalPages = Math.ceil(
    filteredAndSortedPosts.length / POSTS_PER_PAGE
  );
  const paginatedPosts = filteredAndSortedPosts.slice(
    (currentPage - 1) * POSTS_PER_PAGE,
    currentPage * POSTS_PER_PAGE
  );

  const handleFilterChange = useCallback((newFilters: any) => {
    setFilters((prev) => ({ ...prev, ...newFilters }));
    setCurrentPage(1);
  }, []);

  const handleDateChange = useCallback(
    (newDateRange: DateRange | undefined) => {
      setDateRange(newDateRange);
      setCurrentPage(1);
    },
    []
  );

  const handleSortChange = useCallback((newSort: "asc" | "desc" | null) => {
    setSort(newSort);
    setCurrentPage(1);
  }, []);

  const handleReset = useCallback(() => {
    setFilters({
      username: "",
      minLikes: null,
      maxLikes: null,
    });
    setDateRange(undefined);
    setSort(null);
    setCurrentPage(1);
  }, []);

  return (
    <div className="container mx-auto p-4">
      <InstagramFilterComponent
        usernames={uniqueUsernames}
        filters={filters}
        onFilterChange={handleFilterChange}
        onSortChange={handleSortChange}
        onDateChange={handleDateChange}
        onReset={handleReset}
        currentSort={sort}
        date={dateRange}
        setDate={setDateRange}
      />
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {paginatedPosts.map((post) => (
          <InstagramCard
            key={post.permalink}
            post={post}
          />
        ))}
      </div>
      <div className="mt-8">
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
          itemsPerPage={POSTS_PER_PAGE}
          totalItems={filteredAndSortedPosts.length}
          t={t}
        />
      </div>
    </div>
  );
};

export default InstagramPage;
