'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/app/context/UserContext';
import { ArrowLeft, Filter, Search } from 'lucide-react';
import BlogCard from '@/app/blogs/BlogCard';
import BlogModal from '@/app/blogs/BlogModal';
import { generateMockPosts } from '@/app/content/data';

const MyBlogsPage = () => {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const [myPosts, setMyPosts] = useState([]);
  const [allPosts, setAllPosts] = useState([]);
  const [filteredPosts, setFilteredPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState('create');
  const [selectedPost, setSelectedPost] = useState(null);

  const categories = ['All', 'Technology', 'Design', 'Business', 'Lifestyle', 'Travel'];

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadMyBlogs();
  }, [user]);

  useEffect(() => {
    applyFilters();
  }, [myPosts, searchTerm, selectedCategory]);

  const loadMyBlogs = () => {
    setLoading(true);
    const savedPosts = localStorage.getItem('blogPosts');
    const posts = savedPosts ? JSON.parse(savedPosts) : generateMockPosts;
    setAllPosts(posts);
    
    const userPosts = posts.filter(post => post.authorEmail === user.email);
    setMyPosts(userPosts.sort((a, b) => new Date(b.date) - new Date(a.date)));
    setLoading(false);
  };

  const applyFilters = () => {
    let filtered = [...myPosts];

    if (searchTerm) {
      filtered = filtered.filter(p =>
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.content.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory !== 'All') {
      filtered = filtered.filter(p => p.category === selectedCategory);
    }

    setFilteredPosts(filtered);
  };

  const openModal = (mode, post = null) => {
    setModalMode(mode);
    setSelectedPost(post);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPost(null);
    loadMyBlogs();
  };

  const getStats = () => {
    const totalRatings = myPosts.reduce((sum, post) => sum + (post.ratings?.length || 0), 0);
    const totalComments = myPosts.reduce((sum, post) => sum + (post.comments?.length || 0), 0);
    const avgRating = myPosts.length > 0
      ? myPosts.reduce((sum, post) => {
          const postAvg = post.ratings?.length 
            ? post.ratings.reduce((a, b) => a + b, 0) / post.ratings.length 
            : 0;
          return sum + postAvg;
        }, 0) / myPosts.length
      : 0;

    return { totalRatings, totalComments, avgRating: avgRating.toFixed(1) };
  };

  const stats = getStats();

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => router.push('/profile')}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 cursor-pointer transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Profile</span>
        </button>

        {/* Header with Stats */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4 mb-6">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 mb-2">My Blogs</h1>
              <p className="text-gray-600">
                {myPosts.length} {myPosts.length === 1 ? 'post' : 'posts'} created
              </p>
            </div>
            <button
              onClick={() => router.push('/blogs')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer font-semibold"
            >
              Create New Post
            </button>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-4 rounded-lg">
              <p className="text-sm text-blue-700 font-medium">Total Posts</p>
              <p className="text-3xl font-bold text-blue-900 mt-1">{myPosts.length}</p>
            </div>
            <div className="bg-gradient-to-br from-yellow-50 to-yellow-100 p-4 rounded-lg">
              <p className="text-sm text-yellow-700 font-medium">Total Ratings</p>
              <p className="text-3xl font-bold text-yellow-900 mt-1">{stats.totalRatings}</p>
            </div>
            <div className="bg-gradient-to-br from-green-50 to-green-100 p-4 rounded-lg">
              <p className="text-sm text-green-700 font-medium">Avg Rating</p>
              <p className="text-3xl font-bold text-green-900 mt-1">{stats.avgRating}</p>
            </div>
            <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-4 rounded-lg">
              <p className="text-sm text-purple-700 font-medium">Comments</p>
              <p className="text-3xl font-bold text-purple-900 mt-1">{stats.totalComments}</p>
            </div>
          </div>
        </div>

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline w-4 h-4 mr-1" /> Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search your posts..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" /> Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {filteredPosts.length} of {myPosts.length} posts
          </div>
        </div>

        {/* Posts Grid */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading your blogs...</p>
          </div>
        ) : filteredPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredPosts.map(post => (
              <BlogCard
                key={post.id}
                post={post}
                onEdit={() => openModal('edit', post)}
                onDelete={() => openModal('delete', post)}
              />
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <h2 className="text-2xl font-bold text-gray-900 mb-2">
              {searchTerm || selectedCategory !== 'All' ? 'No Posts Found' : 'No Blogs Yet'}
            </h2>
            <p className="text-gray-600 mb-6">
              {searchTerm || selectedCategory !== 'All'
                ? 'Try adjusting your filters'
                : 'Start creating content to share with the world'}
            </p>
            <button
              onClick={() => router.push('/blogs')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Create Your First Post
            </button>
          </div>
        )}
      </div>

      {/* Modal */}
      {showModal && (
        <BlogModal
          mode={modalMode}
          post={selectedPost}
          posts={allPosts}
          setPosts={(updatedPosts) => {
            setAllPosts(updatedPosts);
            localStorage.setItem('blogPosts', JSON.stringify(updatedPosts));
          }}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default MyBlogsPage;