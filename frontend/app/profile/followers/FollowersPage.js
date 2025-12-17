'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useRouter } from 'next/navigation';
import { UserContext } from '@/app/context/UserContext';
import { UserPlus, Mail, Calendar, BookOpen, ArrowLeft, UserCheck } from 'lucide-react';
import { generateMockPosts } from '@/app/content/data';

const FollowersPage = () => {
  const { user } = useContext(UserContext);
  const router = useRouter();
  const [followers, setFollowers] = useState([]);
  const [followingList, setFollowingList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      router.push('/auth/login');
      return;
    }
    loadFollowers();
  }, [user]);

  const loadFollowers = () => {
    setLoading(true);

    // Load who I'm following
    const followKey = `following_${user.email}`;
    const following = localStorage.getItem(followKey);
    const followingEmails = following ? JSON.parse(following) : [];
    setFollowingList(followingEmails);

    // Find all users who follow me by checking their following lists
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const myFollowers = [];

    allUsers.forEach(otherUser => {
      if (otherUser.email !== user.email) {
        const theirFollowKey = `following_${otherUser.email}`;
        const theirFollowing = localStorage.getItem(theirFollowKey);
        if (theirFollowing) {
          const theirFollowingList = JSON.parse(theirFollowing);
          if (theirFollowingList.includes(user.email)) {
            // This user follows me
            myFollowers.push({
              email: otherUser.email,
              name: otherUser.fullName,
              isFollowingBack: followingEmails.includes(otherUser.email)
            });
          }
        }
      }
    });

    // Get post counts for followers
    const savedPosts = localStorage.getItem('blogPosts');
    const posts = savedPosts ? JSON.parse(savedPosts) : generateMockPosts;

    const followersWithStats = myFollowers.map(follower => {
      const userPosts = posts.filter(p => p.authorEmail === follower.email);
      const latestPost = userPosts.length > 0 
        ? userPosts.sort((a, b) => new Date(b.date) - new Date(a.date))[0]
        : null;

      return {
        ...follower,
        postCount: userPosts.length,
        latestPostDate: latestPost ? latestPost.date : null
      };
    });

    setFollowers(followersWithStats);
    setLoading(false);
  };

  const handleFollowBack = (followerEmail) => {
    const followKey = `following_${user.email}`;
    const following = localStorage.getItem(followKey);
    let followingList = following ? JSON.parse(following) : [];

    if (!followingList.includes(followerEmail)) {
      followingList.push(followerEmail);
      localStorage.setItem(followKey, JSON.stringify(followingList));

      // Create notification for the user
      const notifKey = `notifications_${followerEmail}`;
      const existingNotifs = localStorage.getItem(notifKey);
      const notifs = existingNotifs ? JSON.parse(existingNotifs) : [];
      
      notifs.push({
        id: Date.now(),
        type: 'follow',
        from: user.fullName,
        fromEmail: user.email,
        message: `${user.fullName} followed you back`,
        date: new Date().toISOString(),
        read: false,
      });
      
      localStorage.setItem(notifKey, JSON.stringify(notifs));
    }

    loadFollowers();
  };

  const handleUnfollow = (followerEmail) => {
    const followKey = `following_${user.email}`;
    const following = localStorage.getItem(followKey);
    let followingList = following ? JSON.parse(following) : [];

    followingList = followingList.filter(email => email !== followerEmail);
    localStorage.setItem(followKey, JSON.stringify(followingList));

    loadFollowers();
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 pt-20 pb-12">
      <div className="max-w-4xl mx-auto px-4">
        <button
          onClick={() => router.back()}
          className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6 cursor-pointer transition"
        >
          <ArrowLeft size={20} />
          <span className="font-medium">Back</span>
        </button>

        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Followers</h1>
          <p className="text-gray-600">
            {followers.length} {followers.length === 1 ? 'person follows' : 'people follow'} you
          </p>
        </div>

        {loading ? (
          <div className="text-center py-12">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
            <p className="mt-4 text-gray-600">Loading...</p>
          </div>
        ) : followers.length > 0 ? (
          <div className="space-y-4">
            {followers.map(follower => (
              <div
                key={follower.email}
                className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold text-lg cursor-pointer"
                        onClick={() => router.push(`/profile/user/${follower.email}`)}>
                        {follower.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 
                          className="text-lg font-bold text-gray-900 hover:text-blue-600 cursor-pointer"
                          onClick={() => router.push(`/profile/user/${follower.email}`)}
                        >
                          {follower.name}
                        </h3>
                        <div className="flex items-center gap-1 text-sm text-gray-500">
                          <Mail size={14} />
                          <span>{follower.email}</span>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="flex items-center gap-2 text-sm">
                        <BookOpen size={16} className="text-blue-600" />
                        <span className="text-gray-700">
                          <strong>{follower.postCount}</strong> {follower.postCount === 1 ? 'post' : 'posts'}
                        </span>
                      </div>
                      {follower.latestPostDate && (
                        <div className="flex items-center gap-2 text-sm">
                          <Calendar size={16} className="text-green-600" />
                          <span className="text-gray-700">
                            Last post: {new Date(follower.latestPostDate).toLocaleDateString()}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="ml-4">
                    {follower.isFollowingBack ? (
                      <button
                        onClick={() => handleUnfollow(follower.email)}
                        className="flex items-center gap-2 px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition cursor-pointer"
                      >
                        <UserCheck size={18} />
                        Following
                      </button>
                    ) : (
                      <button
                        onClick={() => handleFollowBack(follower.email)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
                      >
                        <UserPlus size={18} />
                        Follow Back
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm p-12 text-center">
            <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-gray-100 flex items-center justify-center">
              <BookOpen size={32} className="text-gray-400" />
            </div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">No Followers Yet</h2>
            <p className="text-gray-600 mb-6">
              Share your content to get followers
            </p>
            <button
              onClick={() => router.push('/blogs')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition cursor-pointer"
            >
              Create a Blog Post
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default FollowersPage;