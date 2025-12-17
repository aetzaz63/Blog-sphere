"use client";

import React, { useContext, useState, useEffect } from "react";
import { Calendar, User, Edit2, Trash2, MessageSquare, EyeOff } from "lucide-react";
import RatingStars from "./RatingStars";
import CommentSection from "./CommentSection";
import { UserContext } from "@/app/context/UserContext";
import Link from "next/link";
import { useRouter } from "next/navigation";

const BlogCard = ({ post, onEdit, onDelete }) => {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments?.length || 0);

  const isOwner = user && post.authorEmail === user.email;
  const isAdmin = user && user.isAdmin;

  const handleCommentChange = (newCount) => setCommentCount(newCount);

  const updatePostInStorage = (updatedPost) => {
    const savedPosts = localStorage.getItem("blogPosts");
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      const updatedPosts = posts.map(p => p.id === updatedPost.id ? updatedPost : p);
      localStorage.setItem("blogPosts", JSON.stringify(updatedPosts));
    }
  };

  const handleAuthorClick = (e) => {
    e.preventDefault();
    if (user && post.authorEmail === user.email) {
      router.push('/profile/my-blogs');
    } else if (post.authorEmail) {
      router.push(`/profile/user/${encodeURIComponent(post.authorEmail)}`);
    }
  };

  if (post.disabled && !isOwner && !isAdmin) {
    return null;
  }

  return (
    <div className="bg-white rounded-lg shadow-sm hover:shadow-md transition">
      {post.disabled && (
        <div className="bg-red-100 border-b border-red-200 px-4 py-2 flex items-center gap-2 text-red-700 text-sm font-medium">
          <EyeOff size={16} />
          <span>This blog is currently disabled</span>
        </div>
      )}
      <img
        src={post.image}
        alt={post.title}
        className="w-full h-48 object-cover rounded-t-lg hover:scale-105 transition-transform"
      />
      <div className="p-6">
        <div className="flex justify-between items-start mb-3">
          <span className="px-3 py-1 bg-blue-100 text-blue-700 text-xs font-semibold rounded-full">
            {post.category}
          </span>
          {isOwner && (
            <div className="flex gap-2">
              <button
                onClick={() => onEdit(post)}
                className="cursor-pointer text-gray-600 hover:text-blue-600"
              >
                <Edit2 size={16} />
              </button>
              <button
                onClick={() => onDelete(post.id)}
                className="cursor-pointer text-gray-600 hover:text-red-600"
              >
                <Trash2 size={16} />
              </button>
            </div>
          )}
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">{post.title}</h3>
        <p className="text-gray-600 text-sm line-clamp-1">{post.content}</p>
        <Link
          href={`/blogs/${post.id}`}
          className="text-blue-600 text-sm hover:underline"
        >
          Show More
        </Link>

        <div className="flex items-center gap-4 text-sm text-gray-500 mb-4 mt-3">
          <div className="flex items-center gap-1">
            <User size={14} /> 
            <span 
              onClick={handleAuthorClick}
              className="hover:text-blue-600 cursor-pointer hover:underline"
            >
              {post.author}
            </span>
          </div>
          <div className="flex items-center gap-1">
            <Calendar size={14} />{" "}
            <span>{new Date(post.date).toLocaleDateString()}</span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex items-center justify-between mb-3">
            <RatingStars 
              postId={post.id}
              initialRatings={post.ratings || []} 
              onRatingUpdate={updatePostInStorage}
            />

            <button
              onClick={() => setShowComments((prev) => !prev)}
              className="flex items-center gap-1 text-gray-600 hover:text-blue-600 transition cursor-pointer"
            >
              <MessageSquare size={16} />
              <span className="text-sm">
                {commentCount > 0
                  ? `${commentCount} Comment${commentCount > 1 ? "s" : ""}`
                  : "Comments"}
              </span>
            </button>
          </div>

          {showComments && (
            <CommentSection
              postId={post.id}
              user={user}
              postAuthorEmail={post.authorEmail}
              initialComments={post.comments || []}
              onCommentChange={handleCommentChange}
              onCommentsUpdate={updatePostInStorage}
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default BlogCard;