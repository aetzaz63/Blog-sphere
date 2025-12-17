'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/app/context/UserContext';
import { Users, Bell, RefreshCw, Filter } from 'lucide-react';
import BlogCard from '@/app/blogs/BlogCard';
import { generateMockPosts } from '@/app/content/data';

const UserFeedPage = () => {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const [feedPosts, setFeedPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [followingList, setFollowingList] = useState([]);
  const [filterMode, setFilterMode] = useState('following'); // 'following' or 'all'

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadFeed();
  }, [user, filterMode]);

  const loadFeed = () => {
    setLoading(true);
    
    // Load all posts
    const savedPosts = localStorage.getItem('blogPosts');
    const posts = savedPosts ? JSON.parse(savedPosts) : generateMockPosts;
    setAllPosts(posts);

    // Load following list
    const followKey = `following_${user.email}`;
    const following = localStorage.getItem(followKey);
    const followingEmails = following ? JSON.parse(following) : [];
    setFollowingList(followingEmails);

    // Filter posts based on mode
    if (filterMode === 'following') {
      const filteredPosts = posts.filter(post => 
        followingEmails.includes(post.authorEmail)
      );
      setFeedPosts(filteredPosts.sort((a, b) => new Date(b.date) - new Date(a.date)));
    } else {
      setFeedPosts(posts.sort((a, b) => new Date(b.date) - new Date(a.date)));
    }

    setLoading(false);
  };

  const handleRefresh = () => {
    loadFeed();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">Your Feed</h1>
              <p className="text-gray-600">
                {filterMode === 'following' 
                  ? `Posts from ${followingList.length} ${followingList.length === 1 ? 'person' : 'people'} you follow`
                  : 'All posts from the community'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/profile/following')}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                <Users size={20} />
                Following ({followingList.length})
              </button>
              <button
                onClick={() => router.push('/profile/notifications')}
                className="flex items-center gap-2 px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition cursor-pointer"
              >
                <Bell size={20} />
                Notifications
              </button>
            </div>
          </div>
        </div>

        {/* Filter and Refresh */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-2">
              <Filter size={20} className="text-gray-600" />
              <span className="text-sm font-medium text-gray-700">Filter:</span>
              <div className="flex gap-2">
                <button
                  onClick={() => setFilterMode('following')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    filterMode === 'following'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  Following Only
                </button>
                <button
                  onClick={() => setFilterMode('all')}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                    filterMode === 'all'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  All Posts
                </button>
              </div>
            </div>
            <button
              onClick={handleRefresh}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer"
            >
              <RefreshCw size={18} />
              Refresh
            </button>
          </div>
        </div>

        {/* Feed Content */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading your feed...</p>
          </div>
        ) : feedPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {feedPosts.map(post => (
              <BlogCard
                key={post.id}
                post={post}
                onEdit={() => {}}
                onDelete={() => {}}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <Users size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Posts Yet</h2>
            <p className="text-gray-600 mb-6">
              {filterMode === 'following'
                ? "You're not following anyone yet, or they haven't posted anything."
                : "There are no posts available."}
            </p>
            {filterMode === 'following' && (
              <button
                onClick={() => router.push('/blogs')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                Discover Bloggers
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default UserFeedPage;