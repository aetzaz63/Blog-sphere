"use client";

import React, { useState, useEffect, useContext, use } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft, Calendar, UserPlus, UserCheck } from "lucide-react";
import RatingStars from "../RatingStars";
import CommentSection from "../CommentSection";
import { UserContext } from "@/app/context/UserContext";
import { generateMockPosts } from "@/app/content/data";

const BlogDetailPage = ({ params }) => {
  const router = useRouter();
  const { user } = useContext(UserContext);

  const unwrappedParams = React.use(params);
  const postId = parseInt(unwrappedParams.id);

  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);

  useEffect(() => {
    const loadPost = () => {
      const savedPosts = localStorage.getItem("blogPosts");
      const posts = savedPosts ? JSON.parse(savedPosts) : generateMockPosts;

      const foundPost = posts.find((p) => p.id === postId);

      if (foundPost) {
        setPost(foundPost);

        if (user) {
          const following = localStorage.getItem(`following_${user.email}`);
          if (following) {
            const followingList = JSON.parse(following);
            setIsFollowing(followingList.includes(foundPost.authorEmail));
          }
        }
      }

      setLoading(false);
    };

    loadPost();
  }, [postId, user]);

  const handleFollowToggle = () => {
    if (!user) {
      alert("Please log in to follow authors");
      router.push("/auth/login");
      return;
    }

    const followKey = `following_${user.email}`;
    const following = localStorage.getItem(followKey);
    let followingList = following ? JSON.parse(following) : [];

    if (isFollowing) {
      followingList = followingList.filter((email) => email !== post.authorEmail);
      setIsFollowing(false);
    } else {
      if (!followingList.includes(post.authorEmail)) {
        followingList.push(post.authorEmail);
      }
      setIsFollowing(true);

      // Create notification for the author
      const notifKey = `notifications_${post.authorEmail}`;
      const existingNotifs = localStorage.getItem(notifKey);
      const notifs = existingNotifs ? JSON.parse(existingNotifs) : [];
      
      notifs.push({
        id: Date.now(),
        type: 'follow',
        from: user.fullName,
        fromEmail: user.email,
        message: `${user.fullName} started following you`,
        date: new Date().toISOString(),
        read: false,
      });
      
      localStorage.setItem(notifKey, JSON.stringify(notifs));
    }

    localStorage.setItem(followKey, JSON.stringify(followingList));
  };

  const handlePostUpdate = () => {
    const savedPosts = localStorage.getItem("blogPosts");
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      const updatedPost = posts.find((p) => p.id === postId);
      if (updatedPost) {
        setPost(updatedPost);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-xl text-gray-600">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">Post Not Found</h1>
        <button
          onClick={() => router.push("/blogs")}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          <ArrowLeft size={20} />
          Back to Blogs
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => router.push("/blogs")}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 cursor-pointer transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back to Blogs</span>
        </button>

        <div className="bg-white rounded-2xl shadow-lg overflow-hidden">
          <div className="px-8 pt-8">
            <span className="inline-block px-4 py-1.5 bg-blue-100 text-blue-700 text-sm font-semibold rounded-full">
              {post.category}
            </span>
          </div>

          <div className="px-8 pt-4 pb-6 border-b border-gray-100">
            <div className="flex items-center justify-between flex-wrap gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                  {post.author.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 text-lg">{post.author}</h3>
                  <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                    <div className="flex items-center gap-1">
                      <Calendar size={14} />
                      <span>
                        {new Date(post.date).toLocaleDateString("en-US", {
                          year: "numeric",
                          month: "long",
                          day: "numeric",
                        })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {user && user.email !== post.authorEmail && (
                <button
                  onClick={handleFollowToggle}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition cursor-pointer ${
                    isFollowing
                      ? "bg-gray-200 text-gray-700 hover:bg-gray-300"
                      : "bg-blue-600 text-white hover:bg-blue-700"
                  }`}
                >
                  {isFollowing ? (
                    <>
                      <UserCheck size={18} />
                      Following
                    </>
                  ) : (
                    <>
                      <UserPlus size={18} />
                      Follow
                    </>
                  )}
                </button>
              )}
            </div>
          </div>

          <div className="px-8 pt-6">
            <h1 className="text-4xl font-bold text-gray-900 leading-tight">
              {post.title}
            </h1>
          </div>

          <div className="px-8 py-6">
            <img
              src={post.image}
              alt={post.title}
              className="w-full h-96 object-cover rounded-xl shadow-md"
            />
          </div>

          <div className="px-8 py-6">
            <div className="prose prose-lg max-w-none">
              <p className="text-gray-700 leading-relaxed whitespace-pre-line text-lg">
                {post.content}
              </p>
            </div>
          </div>

          <div className="px-8 py-6 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Rate this post</h2>
            <RatingStars
              postId={post.id}
              initialRatings={post.ratings || []}
              onRatingUpdate={handlePostUpdate}
            />
          </div>

          <div className="px-8 py-6 border-t border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-4">Comments</h2>
            <CommentSection
              postId={post.id}
              user={user}
              postAuthorEmail={post.authorEmail}
              initialComments={post.comments || []}
              onCommentChange={() => {}}
              onCommentsUpdate={handlePostUpdate}
            />
          </div>
        </div>

        <div className="mt-8 text-center">
          <button
            onClick={() => router.push("/blogs")}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mx-auto cursor-pointer transition font-medium"
          >
            <ArrowLeft size={20} />
            Back to Blogs
          </button>
        </div>
      </div>
    </div>
  );
};

export default BlogDetailPage;