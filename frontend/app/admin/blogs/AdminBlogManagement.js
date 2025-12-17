'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/app/context/UserContext';
import { Shield, Search, Filter, RefreshCw, Eye, EyeOff, Star, Calendar, User, MessageSquare } from 'lucide-react';

const AdminBlogManagement = () => {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const [blogs, setBlogs] = useState([]);
  const [filteredBlogs, setFilteredBlogs] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all'); // 'all', 'enabled', 'disabled'
  const [stats, setStats] = useState({ total: 0, enabled: 0, disabled: 0 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push('/admin/login');
      return;
    }
    loadBlogs();
  }, [user, router]);

  const loadBlogs = () => {
    const allBlogs = JSON.parse(localStorage.getItem('blogPosts')) || [];
    setBlogs(allBlogs);
    applyFilters(allBlogs, searchTerm, filterStatus);
    calculateStats(allBlogs);
  };

  const calculateStats = (blogList) => {
    const total = blogList.length;
    const disabled = blogList.filter(b => b.disabled).length;
    const enabled = total - disabled;
    setStats({ total, enabled, disabled });
  };

  const applyFilters = (blogList, search, status) => {
    let filtered = [...blogList];

    if (search) {
      filtered = filtered.filter(b =>
        b.title.toLowerCase().includes(search.toLowerCase()) ||
        b.author.toLowerCase().includes(search.toLowerCase()) ||
        b.category.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status === 'enabled') {
      filtered = filtered.filter(b => !b.disabled);
    } else if (status === 'disabled') {
      filtered = filtered.filter(b => b.disabled);
    }

    setFilteredBlogs(filtered);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    applyFilters(blogs, value, filterStatus);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    applyFilters(blogs, searchTerm, status);
  };

  const toggleBlogStatus = (blogId) => {
    const allBlogs = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const updatedBlogs = allBlogs.map(b => {
      if (b.id === blogId) {
        return { ...b, disabled: !b.disabled };
      }
      return b;
    });

    localStorage.setItem('blogPosts', JSON.stringify(updatedBlogs));
    
    const targetBlog = updatedBlogs.find(b => b.id === blogId);
    setMessage(`Blog "${targetBlog.title}" has been ${targetBlog.disabled ? 'disabled' : 'enabled'} successfully.`);
    setTimeout(() => setMessage(''), 3000);
    
    loadBlogs();
  };

  const getAverageRating = (ratings) => {
    if (!ratings || ratings.length === 0) return 0;
    const sum = ratings.reduce((acc, rating) => acc + rating, 0);
    return (sum / ratings.length).toFixed(1);
  };

  const handleViewBlog = (blogId) => {
    router.push(`/blogs/${blogId}`);
  };

  if (!user || !user.isAdmin) return null;

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="flex items-center justify-between flex-wrap gap-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-purple-600 rounded-full flex items-center justify-center">
                <Shield className="text-white" size={24} />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
                <p className="text-gray-600">Manage all blog posts</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/dashboard')}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition cursor-pointer"
              >
                User Management
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
              >
                Go to Site
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Total Blogs</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{stats.total}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
                <MessageSquare className="text-blue-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Enabled Blogs</p>
                <p className="text-3xl font-bold text-green-600 mt-2">{stats.enabled}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
                <Eye className="text-green-600" size={24} />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-600 text-sm font-medium">Disabled Blogs</p>
                <p className="text-3xl font-bold text-red-600 mt-2">{stats.disabled}</p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
                <EyeOff className="text-red-600" size={24} />
              </div>
            </div>
          </div>
        </div>

        {/* Message */}
        {message && (
          <div className="bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg mb-6">
            {message}
          </div>
        )}

        {/* Filters */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline w-4 h-4 mr-1" /> Search Blogs
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by title, author, or category..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" /> Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Blogs</option>
                <option value="enabled">Enabled Only</option>
                <option value="disabled">Disabled Only</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredBlogs.length} of {stats.total} blogs
            </p>
            <button
              onClick={loadBlogs}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Blogs Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Title
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Author
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Creation Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Rating
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredBlogs.length > 0 ? (
                  filteredBlogs.map((blog) => (
                    <tr key={blog.id} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            <img
                              src={blog.image}
                              alt={blog.title}
                              className="h-12 w-12 rounded-lg object-cover"
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900 line-clamp-1">
                              {blog.title}
                            </div>
                            <div className="text-sm text-gray-500">
                              {blog.category}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-900">
                          <User size={14} />
                          {blog.author}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Calendar size={14} />
                          {new Date(blog.date).toLocaleDateString()}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1">
                          <Star size={14} className="text-yellow-400 fill-yellow-400" />
                          <span className="text-sm font-medium">
                            {getAverageRating(blog.ratings)}
                          </span>
                          <span className="text-xs text-gray-500">
                            ({blog.ratings?.length || 0})
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            blog.disabled
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {blog.disabled ? (
                            <>
                              <EyeOff size={12} />
                              Disabled
                            </>
                          ) : (
                            <>
                              <Eye size={12} />
                              Enabled
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleViewBlog(blog.id)}
                            className="px-3 py-1 bg-blue-100 text-blue-700 rounded-lg text-sm font-medium hover:bg-blue-200 transition cursor-pointer"
                          >
                            View
                          </button>
                          <button
                            onClick={() => toggleBlogStatus(blog.id)}
                            className={`px-3 py-1 rounded-lg text-sm font-medium transition cursor-pointer ${
                              blog.disabled
                                ? 'bg-green-100 text-green-700 hover:bg-green-200'
                                : 'bg-red-100 text-red-700 hover:bg-red-200'
                            }`}
                          >
                            {blog.disabled ? 'Enable' : 'Disable'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-12 text-center">
                      <MessageSquare className="mx-auto text-gray-400 mb-3" size={48} />
                      <p className="text-gray-500 text-lg">No blogs found</p>
                      <p className="text-gray-400 text-sm mt-1">
                        Try adjusting your search or filter criteria
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminBlogManagement;