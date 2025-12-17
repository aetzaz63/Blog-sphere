'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/app/context/UserContext';
import { ArrowLeft, UserPlus, UserCheck, Mail, BookOpen, Star } from 'lucide-react';
import BlogCard from '@/app/blogs/BlogCard';
import { generateMockPosts } from '@/app/content/data';

const UserProfileViewPage = ({ params }) => {
  const { user } = useContext(UserContext);
  const router = useRouter();
  
  // Unwrap params using React.use()
  const unwrappedParams = React.use(params);
  const userEmail = decodeURIComponent(unwrappedParams.email);

  const [profileUser, setProfileUser] = useState(null);
  const [userPosts, setUserPosts] = useState([]);
  const [isFollowing, setIsFollowing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ posts: 0, avgRating: 0, totalRatings: 0 });

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadUserProfile();
  }, [userEmail, user]);

  const loadUserProfile = () => {
    setLoading(true);

    // Get user data
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const foundUser = allUsers.find(u => u.email === userEmail);
    
    if (!foundUser) {
      setLoading(false);
      return;
    }

    setProfileUser(foundUser);

    // Get user's posts
    const savedPosts = localStorage.getItem('blogPosts');
    const posts = savedPosts ? JSON.parse(savedPosts) : generateMockPosts;
    const userBlogs = posts.filter(post => post.authorEmail === userEmail);
    setUserPosts(userBlogs.sort((a, b) => new Date(b.date) - new Date(a.date)));

    // Calculate stats
    const totalRatings = userBlogs.reduce((sum, post) => sum + (post.ratings?.length || 0), 0);
    const avgRating = userBlogs.length > 0
      ? userBlogs.reduce((sum, post) => {
          const postAvg = post.ratings?.length 
            ? post.ratings.reduce((a, b) => a + b, 0) / post.ratings.length 
            : 0;
          return sum + postAvg;
        }, 0) / userBlogs.length
      : 0;

    setStats({
      posts: userBlogs.length,
      avgRating: avgRating.toFixed(1),
      totalRatings
    });

    // Check if following
    const followKey = `following_${user.email}`;
    const following = localStorage.getItem(followKey);
    if (following) {
      const followingList = JSON.parse(following);
      setIsFollowing(followingList.includes(userEmail));
    }

    setLoading(false);
  };

  const handleFollowToggle = () => {
    const followKey = `following_${user.email}`;
    const following = localStorage.getItem(followKey);
    let followingList = following ? JSON.parse(following) : [];

    if (isFollowing) {
      followingList = followingList.filter(email => email !== userEmail);
      setIsFollowing(false);
    } else {
      if (!followingList.includes(userEmail)) {
        followingList.push(userEmail);
      }
      setIsFollowing(true);

      // Create notification
      const notifKey = `notifications_${userEmail}`;
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

  if (!user) return null;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
          <p className="mt-4 text-gray-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (!profileUser) {
    return (
      <div className="min-h-screen bg-gray-50 pt-20 flex flex-col items-center justify-center">
        <h1 className="text-2xl font-bold text-gray-900 mb-4">User Not Found</h1>
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-blue-600 hover:text-blue-700 cursor-pointer"
        >
          <ArrowLeft size={20} />
          Go Back
        </button>
      </div>
    );
  }

  // Redirect if viewing own profile
  if (userEmail === user.email) {
    router.push('/profile/my-blogs');
    return null;
  }

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-7xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 cursor-pointer transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        {/* Profile Header */}
        <div className="bg-white rounded-lg shadow-sm p-8 mb-6">
          <div className="flex items-start justify-between flex-wrap gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-3xl">
                {profileUser.fullName.charAt(0).toUpperCase()}
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900 mb-2">
                  {profileUser.fullName}
                </h1>
                <div className="flex items-center gap-2 text-gray-600 mb-4">
                  <Mail size={18} />
                  <span>{profileUser.email}</span>
                </div>
                <div className="flex items-center gap-6 text-sm">
                  <div className="flex items-center gap-2">
                    <BookOpen size={16} className="text-blue-600" />
                    <span className="font-semibold">{stats.posts}</span> posts
                  </div>
                  <div className="flex items-center gap-2">
                    <Star size={16} className="text-yellow-400 fill-yellow-400" />
                    <span className="font-semibold">{stats.avgRating}</span> avg rating
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={handleFollowToggle}
              className={`flex items-center gap-2 px-6 py-3 rounded-lg font-medium transition cursor-pointer ${
                isFollowing
                  ? 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  : 'bg-blue-600 text-white hover:bg-blue-700'
              }`}
            >
              {isFollowing ? (
                <>
                  <UserCheck size={20} />
                  Following
                </>
              ) : (
                <>
                  <UserPlus size={20} />
                  Follow
                </>
              )}
            </button>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 mt-8 pt-6 border-t">
            <div className="text-center">
              <p className="text-3xl font-bold text-blue-600">{stats.posts}</p>
              <p className="text-sm text-gray-600 mt-1">Total Posts</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-yellow-600">{stats.avgRating}</p>
              <p className="text-sm text-gray-600 mt-1">Average Rating</p>
            </div>
            <div className="text-center">
              <p className="text-3xl font-bold text-green-600">{stats.totalRatings}</p>
              <p className="text-sm text-gray-600 mt-1">Total Ratings</p>
            </div>
          </div>
        </div>

        {/* User's Posts */}
        <div className="mb-4">
          <h2 className="text-2xl font-bold text-gray-900">
            Posts by {profileUser.fullName}
          </h2>
          <p className="text-gray-600 mt-1">
            {userPosts.length} {userPosts.length === 1 ? 'post' : 'posts'} published
          </p>
        </div>

        {userPosts.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {userPosts.map(post => (
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
            <BookOpen size={64} className="mx-auto text-gray-300 mb-4" />
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Posts Yet</h2>
            <p className="text-gray-600">
              {profileUser.fullName} hasn't published any posts yet
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserProfileViewPage;