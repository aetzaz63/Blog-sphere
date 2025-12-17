"use client";

import React, { useState, useEffect, useMemo, useContext } from "react";
import { Plus, Filter, Search } from "lucide-react";
import BlogCard from "./BlogCard";
import BlogModal from "./BlogModal";
import { generateMockPosts } from "../content/data";
import { UserContext } from "@/app/context/UserContext";
import { useRouter } from "next/navigation";

const BlogManagement = () => {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const [posts, setPosts] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [sortBy, setSortBy] = useState("date-desc");
  const [showModal, setShowModal] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [selectedPost, setSelectedPost] = useState(null);

  const [postsPerPage, setPostsPerPage] = useState(9);
  const [currentPage, setCurrentPage] = useState(1);

  const categories = ["All", "Technology", "Design", "Business", "Lifestyle", "Travel"];

  // Load posts from localStorage or use mock data
  useEffect(() => {
    const savedPosts = localStorage.getItem("blogPosts");
    if (savedPosts) {
      setPosts(JSON.parse(savedPosts));
    } else {
      setPosts(generateMockPosts);
      localStorage.setItem("blogPosts", JSON.stringify(generateMockPosts));
    }
  }, []);

  // Save posts to localStorage whenever they change
  useEffect(() => {
    if (posts.length > 0) {
      localStorage.setItem("blogPosts", JSON.stringify(posts));
    }
  }, [posts]);

  // Filter & Sort Logic
  const filteredAndSortedPosts = useMemo(() => {
    let filtered = posts.filter((p) => {
      const matchesSearch =
        p.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        p.content.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCat = selectedCategory === "All" || p.category === selectedCategory;
      return matchesSearch && matchesCat;
    });

    filtered.sort((a, b) => {
      switch (sortBy) {
        case "date-desc":
          return new Date(b.date) - new Date(a.date);
        case "date-asc":
          return new Date(a.date) - new Date(b.date);
        case "rating-desc":
          const avgA = a.ratings?.length ? a.ratings.reduce((s, r) => s + r, 0) / a.ratings.length : 0;
          const avgB = b.ratings?.length ? b.ratings.reduce((s, r) => s + r, 0) / b.ratings.length : 0;
          return avgB - avgA;
        case "title-asc":
          return a.title.localeCompare(b.title);
        default:
          return 0;
      }
    });

    return filtered;
  }, [posts, searchTerm, selectedCategory, sortBy]);

  // Pagination
  const totalPages = Math.ceil(filteredAndSortedPosts.length / postsPerPage);
  const indexOfLast = currentPage * postsPerPage;
  const currentPosts = filteredAndSortedPosts.slice(indexOfLast - postsPerPage, indexOfLast);

  const handlePageChange = (newPage) => {
    if (newPage < 1 || newPage > totalPages) return;
    setCurrentPage(newPage);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Modal Control
  const openModal = (mode, post = null) => {
    if (mode === "create" && !user) {
      alert("Please log in to create a blog post");
      router.push("/auth/login");
      return;
    }
    
    setModalMode(mode);
    setSelectedPost(post);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSelectedPost(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 pt-20">
      {/* Header */}
      <div className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 py-6 flex justify-between items-center flex-wrap gap-3">
          <h1 className="text-3xl font-bold text-gray-900">Blog Management</h1>
          {user ? (
            <button
              onClick={() => openModal("create")}
              className="cursor-pointer flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition"
            >
              <Plus size={20} /> New Post
            </button>
          ) : (
            <button
              onClick={() => router.push("/auth/login")}
              className="cursor-pointer flex items-center gap-2 bg-gray-600 text-white px-4 py-2 rounded-lg hover:bg-gray-700 transition"
            >
              Login to Create Post
            </button>
          )}
        </div>
      </div>

      {/* Filters */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
            {/* Search */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Search className="inline w-4 h-4 mr-1" /> Search
              </label>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => {
                  setSearchTerm(e.target.value);
                  setCurrentPage(1);
                }}
                placeholder="Search posts..."
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                <Filter className="inline w-4 h-4 mr-1" /> Category
              </label>
              <select
                value={selectedCategory}
                onChange={(e) => {
                  setSelectedCategory(e.target.value);
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {categories.map((cat) => (
                  <option key={cat}>{cat}</option>
                ))}
              </select>
            </div>

            {/* Sort */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Sort By</label>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                <option value="date-desc">Newest First</option>
                <option value="date-asc">Oldest First</option>
                <option value="rating-desc">Highest Rated</option>
                <option value="title-asc">Title A–Z</option>
              </select>
            </div>

            {/* Posts per page */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Posts per page</label>
              <select
                value={postsPerPage}
                onChange={(e) => {
                  setPostsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
              >
                {[6, 12, 24].map((num) => (
                  <option key={num} value={num}>
                    {num}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="mt-4 text-sm text-gray-600">
            Showing {indexOfLast - postsPerPage + 1}–
            {Math.min(indexOfLast, filteredAndSortedPosts.length)} of {filteredAndSortedPosts.length} posts
          </div>
        </div>

        {/* Posts Grid */}
        {currentPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
            {currentPosts.map((post) => (
              <BlogCard
                key={post.id}
                post={post}
                onEdit={() => openModal("edit", post)}
                onDelete={() => openModal("delete", post)}
              />
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-500 py-12 text-lg">
            No posts found.
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex justify-center items-center gap-4 flex-wrap">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className={`px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 ${
                currentPage === 1 ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Previous
            </button>

            <span className="text-gray-700 text-sm">
              Page {currentPage} of {totalPages}
            </span>

            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className={`px-4 py-2 rounded-lg border border-gray-300 hover:bg-gray-50 ${
                currentPage === totalPages ? "opacity-50 cursor-not-allowed" : ""
              }`}
            >
              Next
            </button>
          </div>
        )}
      </div>

      {/* Modal for Create / Edit / Delete */}
      {showModal && (
        <BlogModal
          mode={modalMode}
          post={selectedPost}
          posts={posts}
          setPosts={setPosts}
          onClose={closeModal}
        />
      )}
    </div>
  );
};

export default BlogManagement;