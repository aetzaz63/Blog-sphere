'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/app/context/UserContext';
import { Shield, Users, Lock, Unlock, Search, Filter, RefreshCw, Mail, AlertCircle, MessageSquare } from 'lucide-react';

const AdminDashboard = () => {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const [users, setUsers] = useState([]);
  const [filteredUsers, setFilteredUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [stats, setStats] = useState({ total: 0, active: 0, disabled: 0 });
  const [blogStats, setBlogStats] = useState({ total: 0, enabled: 0, disabled: 0 });
  const [message, setMessage] = useState('');

  useEffect(() => {
    if (!user || !user.isAdmin) {
      router.push('/admin/login');
      return;
    }
    loadUsers();
    loadBlogStats();
  }, [user, router]);

  const loadUsers = () => {
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    setUsers(allUsers);
    applyFilters(allUsers, searchTerm, filterStatus);
    calculateStats(allUsers);
  };

  const loadBlogStats = () => {
    const allBlogs = JSON.parse(localStorage.getItem('blogPosts')) || [];
    const total = allBlogs.length;
    const disabled = allBlogs.filter(b => b.disabled).length;
    const enabled = total - disabled;
    setBlogStats({ total, enabled, disabled });
  };

  const calculateStats = (userList) => {
    const total = userList.length;
    const disabled = userList.filter(u => u.disabled).length;
    const active = total - disabled;
    setStats({ total, active, disabled });
  };

  const applyFilters = (userList, search, status) => {
    let filtered = [...userList];

    if (search) {
      filtered = filtered.filter(u =>
        u.fullName.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (status === 'active') {
      filtered = filtered.filter(u => !u.disabled);
    } else if (status === 'disabled') {
      filtered = filtered.filter(u => u.disabled);
    }

    setFilteredUsers(filtered);
  };

  const handleSearch = (value) => {
    setSearchTerm(value);
    applyFilters(users, value, filterStatus);
  };

  const handleFilterChange = (status) => {
    setFilterStatus(status);
    applyFilters(users, searchTerm, status);
  };

  const toggleUserStatus = (userEmail) => {
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const updatedUsers = allUsers.map(u => {
      if (u.email === userEmail) {
        return { ...u, disabled: !u.disabled };
      }
      return u;
    });

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    
    const targetUser = updatedUsers.find(u => u.email === userEmail);
    setMessage(`User ${targetUser.fullName} has been ${targetUser.disabled ? 'disabled' : 'enabled'} successfully.`);
    setTimeout(() => setMessage(''), 3000);
    
    loadUsers();
  };

  const handleLogout = () => {
    localStorage.removeItem('currentUser');
    router.push('/admin/login');
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
                <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
                <p className="text-gray-600">Welcome, {user.fullName}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => router.push('/admin/blogs')}
                className="px-6 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition cursor-pointer"
              >
                Manage Blogs
              </button>
              <button
                onClick={() => router.push('/')}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition cursor-pointer"
              >
                Go to Site
              </button>
              <button
                onClick={handleLogout}
                className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition cursor-pointer"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* User Stats */}
          <div className="bg-gradient-to-r from-blue-500 to-blue-600 rounded-lg shadow-md p-6 text-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <Users size={24} />
              User Statistics
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-blue-100 text-sm">Total Users</p>
                <p className="text-3xl font-bold mt-1">{stats.total}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Active</p>
                <p className="text-3xl font-bold mt-1">{stats.active}</p>
              </div>
              <div>
                <p className="text-blue-100 text-sm">Disabled</p>
                <p className="text-3xl font-bold mt-1">{stats.disabled}</p>
              </div>
            </div>
          </div>

          {/* Blog Stats */}
          <div className="bg-gradient-to-r from-purple-500 to-purple-600 rounded-lg shadow-md p-6 text-white">
            <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
              <MessageSquare size={24} />
              Blog Statistics
            </h2>
            <div className="grid grid-cols-3 gap-4">
              <div>
                <p className="text-purple-100 text-sm">Total Blogs</p>
                <p className="text-3xl font-bold mt-1">{blogStats.total}</p>
              </div>
              <div>
                <p className="text-purple-100 text-sm">Enabled</p>
                <p className="text-3xl font-bold mt-1">{blogStats.enabled}</p>
              </div>
              <div>
                <p className="text-purple-100 text-sm">Disabled</p>
                <p className="text-3xl font-bold mt-1">{blogStats.disabled}</p>
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
            {/* Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline w-4 h-4 mr-1" /> Search Users
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                placeholder="Search by name or email..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              />
            </div>

            {/* Status Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" /> Filter by Status
              </label>
              <select
                value={filterStatus}
                onChange={(e) => handleFilterChange(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500"
              >
                <option value="all">All Users</option>
                <option value="active">Active Only</option>
                <option value="disabled">Disabled Only</option>
              </select>
            </div>
          </div>

          <div className="mt-4 flex items-center justify-between">
            <p className="text-sm text-gray-600">
              Showing {filteredUsers.length} of {stats.total} users
            </p>
            <button
              onClick={loadUsers}
              className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition cursor-pointer"
            >
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-white rounded-lg shadow-md overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    User
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Email
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
                {filteredUsers.length > 0 ? (
                  filteredUsers.map((user, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                            {user.fullName.charAt(0).toUpperCase()}
                          </div>
                          <div className="ml-3">
                            <div className="text-sm font-medium text-gray-900">
                              {user.fullName}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center gap-1 text-sm text-gray-600">
                          <Mail size={14} />
                          {user.email}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span
                          className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold ${
                            user.disabled
                              ? 'bg-red-100 text-red-800'
                              : 'bg-green-100 text-green-800'
                          }`}
                        >
                          {user.disabled ? (
                            <>
                              <Lock size={12} />
                              Disabled
                            </>
                          ) : (
                            <>
                              <Unlock size={12} />
                              Active
                            </>
                          )}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleUserStatus(user.email)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition cursor-pointer ${
                            user.disabled
                              ? 'bg-green-100 text-green-700 hover:bg-green-200'
                              : 'bg-red-100 text-red-700 hover:bg-red-200'
                          }`}
                        >
                          {user.disabled ? 'Enable User' : 'Disable User'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="px-6 py-12 text-center">
                      <AlertCircle className="mx-auto text-gray-400 mb-3" size={48} />
                      <p className="text-gray-500 text-lg">No users found</p>
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

export default AdminDashboard;