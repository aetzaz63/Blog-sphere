'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/app/context/UserContext';
import { UserMinus, Mail, Calendar, BookOpen, ArrowLeft } from 'lucide-react';
import { generateMockPosts } from '@/app/content/data';

const FollowingPage = () => {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const [followingList, setFollowingList] = useState([]);
  const [authorsData, setAuthorsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadFollowing();
  }, [user]);

  const loadFollowing = () => {
    setLoading(true);

    // Load following list
    const followKey = `following_${user.email}`;
    const following = localStorage.getItem(followKey);
    const followingEmails = following ? JSON.parse(following) : [];
    setFollowingList(followingEmails);

    // Load all posts to get author info
    const savedPosts = localStorage.getItem('blogPosts');
    const posts = savedPosts ? JSON.parse(savedPosts) : generateMockPosts;

    // Create author data with post counts and latest post date
    const authorsMap = {};
    posts.forEach(post => {
      if (followingEmails.includes(post.authorEmail)) {
        if (!authorsMap[post.authorEmail]) {
          authorsMap[post.authorEmail] = {
            email: post.authorEmail,
            name: post.author,
            postCount: 0,
            latestPostDate: null,
          };
        }
        authorsMap[post.authorEmail].postCount++;
        const postDate = new Date(post.date);
        if (!authorsMap[post.authorEmail].latestPostDate || 
            postDate > authorsMap[post.authorEmail].latestPostDate) {
          authorsMap[post.authorEmail].latestPostDate = postDate;
        }
      }
    });

    setAuthorsData(Object.values(authorsMap));
    setLoading(false);
  };

  const handleUnfollow = (authorEmail) => {
    if (!confirm('Are you sure you want to unfollow this user?')) return;

    const followKey = `following_${user.email}`;
    const updatedList = followingList.filter(email => email !== authorEmail);
    localStorage.setItem(followKey, JSON.stringify(updatedList));
    
    loadFollowing();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        {/* Header */}
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 cursor-pointer transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Following</h1>
          <p className="text-gray-600">
            You're following {followingList.length} {followingList.length === 1 ? 'person' : 'people'}
          </p>
        </div>

        {/* Following List */}
        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : authorsData.length > 0 ? (
          <div className="space-y-4">
            {authorsData.map(author => (
              <div
                key={author.email}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg">
                        {author.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="text-lg font-bold text-gray-900">{author.name}</h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail size={14} />
                          <span>{author.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen size={16} className="text-blue-600" />
                        <span className="text-gray-700">
                          <strong>{author.postCount}</strong> {author.postCount === 1 ? 'post' : 'posts'}
                        </span>
                      </div>
                      {author.latestPostDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={16} className="text-green-600" />
                          <span className="text-gray-700">
                            Last post: {new Date(author.latestPostDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <button
                    onClick={() => handleUnfollow(author.email)}
                    className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition cursor-pointer ml-4"
                  >
                    <UserMinus size={18} />
                    Unfollow
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <BookOpen size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">Not Following Anyone</h2>
            <p className="text-gray-600 mb-6">
              Start following bloggers to see their posts in your feed
            </p>
            <button
              onClick={() => router.push('/blogs')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Discover Bloggers
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowingPage;