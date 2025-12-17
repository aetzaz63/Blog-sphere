"use client";
import React, { useState, useEffect, useContext } from "react";
import { X, Trash2 } from "lucide-react";
import { UserContext } from "@/app/context/UserContext";

const BlogModal = ({ mode, post, posts, setPosts, onClose }) => {
  const { user } = useContext(UserContext); // Get current logged-in user
  const isEdit = mode === "edit";
  const isCreate = mode === "create";
  const isDelete = mode === "delete";

  const [formData, setFormData] = useState({
    title: "",
    content: "",
    author: user?.fullName || "",
    category: "Technology",
    image: "",
  });

  useEffect(() => {
    if (post && (isEdit || isDelete)) {
      setFormData(post);
    } else if (isCreate && user) {
      // Pre-fill author name for new posts
      setFormData({
        title: "",
        content: "",
        author: user.fullName || "",
        category: "Technology",
        image: "",
      });
    }
  }, [post, isEdit, isDelete, isCreate, user]);

  // Image Upload Preview
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const imgURL = URL.createObjectURL(file);
      setFormData({ ...formData, image: imgURL });
    }
  };

  // Submit Logic
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!user) {
      alert("You must be logged in to perform this action");
      return;
    }

    if (isCreate) {
      const newPost = {
        id: posts.length + 1,
        ...formData,
        author: user.fullName, 
        authorEmail: user.email, 
        date: new Date().toISOString(),
        ratings: [],
        comments: [],
      };
      setPosts([newPost, ...posts]);
    } else if (isEdit) {
      // Verify user is the owner before editing
      if (post.authorEmail !== user.email) {
        alert("You can only edit your own posts");
        return;
      }
      setPosts(posts.map((p) => (p.id === post.id ? { ...p, ...formData } : p)));
    } else if (isDelete) {
      // Verify user is the owner before deleting
      if (post.authorEmail !== user.email) {
        alert("You can only delete your own posts");
        return;
      }
      setPosts(posts.filter((p) => p.id !== post.id));
    }

    onClose();
  };

  return (
    <div
      className="fixed inset-0 flex items-center justify-center z-50 p-4"
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.3)",
        backdropFilter: "blur(3px)",
      }}
    >
      {/* Scrollable Modal */}
      <div className="bg-white rounded-2xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto border border-gray-200">
        {/* Header */}
        <div className="flex justify-between items-center p-6 border-b bg-gray-50 rounded-t-2xl sticky top-0 z-10">
          <h2 className="text-2xl font-bold text-gray-800">
            {isCreate && "Create New Post"}
            {isEdit && "Edit Post"}
            {isDelete && "Delete Post"}
          </h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700 cursor-pointer">
            <X size={24} />
          </button>
        </div>

        {/* Delete Confirmation */}
        {isDelete ? (
          <div className="p-8 space-y-4 text-center">
            <p className="text-gray-700 text-lg">
              Are you sure you want to delete{" "}
              <span className="font-semibold text-gray-900">{formData.title}</span>?
            </p>
            <div className="flex gap-3 justify-center mt-6">
              <button
                onClick={handleSubmit}
                className="cursor-pointer flex items-center gap-2 bg-red-600 text-white px-6 py-2 rounded-lg hover:bg-red-700 transition"
              >
                <Trash2 size={18} /> Delete
              </button>
              <button
                onClick={onClose}
                className="cursor-pointer bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </div>
        ) : (
          // Create / Edit Form
          <form onSubmit={handleSubmit} className="p-6 space-y-4">
            <input
              type="text"
              placeholder="Title"
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />

            <textarea
              rows={5}
              placeholder="write you blog Content here which engages readers..."
              value={formData.content}
              onChange={(e) => setFormData({ ...formData, content: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />

            {/* Author field - disabled and auto-filled for logged-in users */}
            <input
              type="text"
              placeholder="Author"
              value={formData.author || ""}
              disabled
              className="w-full px-4 py-2 border rounded-lg bg-gray-100 cursor-not-allowed"
            />

            <select
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              className="w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              {["Technology", "Design", "Business", "Lifestyle", "Travel"].map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>

            {/* Image Upload */}
            <div>
              <input type="file" accept="image/*" onChange={handleImageChange} />
              {formData.image && (
                <img
                  src={formData.image}
                  alt="preview"
                  className="w-full h-40 object-cover mt-3 rounded-lg border"
                />
              )}
            </div>

            {/* Buttons */}
            <div className="flex gap-3 mt-6 sticky bottom-0 bg-white pt-4 pb-2">
              <button
                type="submit"
                className={`cursor-pointer flex-1 py-2 rounded-lg text-white transition ${
                  isEdit
                    ? "bg-yellow-500 hover:bg-yellow-600"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {isCreate ? "Create Post" : "Update Post"}
              </button>
              <button
                type="button"
                onClick={onClose}
                className="cursor-pointer flex-1 bg-gray-200 text-gray-800 py-2 rounded-lg hover:bg-gray-300 transition"
              >
                Cancel
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default BlogModal;