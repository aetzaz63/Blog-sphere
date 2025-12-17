'use client';
import React, { useState, useEffect, useContext } from 'react';
import { useForm } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as Yup from 'yup';
import { Camera, Mail, User, Lock, Trash2, Edit2, Save, X, Eye, EyeOff, Users, Bell, Rss, BookOpen, UserCheck } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { UserContext } from '../context/UserContext';

const profileSchema = Yup.object().shape({
  fullName: Yup.string().required('Full name is required'),
  email: Yup.string().email('Invalid email').required('Email is required'),
  password: Yup.string().min(6, 'Password must be at least 6 characters').nullable(),
});

const ProfilePage = () => {
  const { user, login, logout, loading } = useContext(UserContext);
  const router = useRouter();

  const [preview, setPreview] = useState('/file.svg');
  const [isEditing, setIsEditing] = useState(false);
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [stats, setStats] = useState({ 
    following: 0, 
    followers: 0,
    notifications: 0,
    myPosts: 0 
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/auth/login');
    } else if (user) {
      loadStats();
    }
  }, [user, loading, router]);

  const loadStats = () => {
    if (!user) return;
    
    // Load following count
    const followKey = `following_${user.email}`;
    const following = localStorage.getItem(followKey);
    const followingCount = following ? JSON.parse(following).length : 0;
    
    // Load followers count
    const allUsers = JSON.parse(localStorage.getItem('users')) || [];
    let followersCount = 0;
    allUsers.forEach(otherUser => {
      if (otherUser.email !== user.email) {
        const theirFollowKey = `following_${otherUser.email}`;
        const theirFollowing = localStorage.getItem(theirFollowKey);
        if (theirFollowing) {
          const theirFollowingList = JSON.parse(theirFollowing);
          if (theirFollowingList.includes(user.email)) {
            followersCount++;
          }
        }
      }
    });
    
    // Load unread notifications count
    const notifKey = `notifications_${user.email}`;
    const notifs = localStorage.getItem(notifKey);
    const unreadCount = notifs 
      ? JSON.parse(notifs).filter(n => !n.read).length 
      : 0;

    // Load user's posts count
    const savedPosts = localStorage.getItem('blogPosts');
    const posts = savedPosts ? JSON.parse(savedPosts) : [];
    const myPostsCount = posts.filter(post => post.authorEmail === user.email).length;
    
    setStats({ 
      following: followingCount, 
      followers: followersCount,
      notifications: unreadCount,
      myPosts: myPostsCount 
    });
  };

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors },
  } = useForm({
    resolver: yupResolver(profileSchema),
    defaultValues: {
      fullName: user?.fullName || '',
      email: user?.email || '',
      password: user?.password || '',
    },
  });

  useEffect(() => {
    if (user) {
      reset({
        fullName: user.fullName,
        email: user.email,
        password: user.password || '',
      });
      setPreview(user.profileImage || '/file.svg');
    }
  }, [user, reset]);

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) setPreview(URL.createObjectURL(file));
  };

  const onSubmit = (data) => {
    let allUsers = JSON.parse(localStorage.getItem('users')) || [];

    const updatedUser = {
      ...user,
      fullName: data.fullName,
      email: data.email,
      profileImage: preview,
      password: data.password || user.password,
    };

    const updatedUsers = allUsers.map((u) =>
      u.email === user.email ? updatedUser : u
    );

    localStorage.setItem('users', JSON.stringify(updatedUsers));
    login(updatedUser);
    setMessage('✅ Profile updated successfully!');
    setIsEditing(false);
    setTimeout(() => setMessage(''), 3000);
  };

  const confirmDelete = () => {
    let allUsers = JSON.parse(localStorage.getItem('users')) || [];
    const filtered = allUsers.filter((u) => u.email !== user.email);
    localStorage.setItem('users', JSON.stringify(filtered));
    logout();
    router.push('/');
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center py-16 px-6 relative">
      <div className="max-w-6xl w-full bg-white rounded-2xl shadow-2xl p-10">
        {/* Quick Access Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => router.push('/profile/feed')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-xl hover:from-blue-600 hover:to-blue-700 transition cursor-pointer shadow-lg"
          >
            <Rss size={24} />
            <div className="text-left">
              <div className="font-semibold">Your Feed</div>
              <div className="text-xs opacity-90">Latest posts</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/profile/my-blogs')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-green-500 to-green-600 text-white rounded-xl hover:from-green-600 hover:to-green-700 transition cursor-pointer shadow-lg"
          >
            <BookOpen size={24} />
            <div className="text-left">
              <div className="font-semibold">My Blogs ({stats.myPosts})</div>
              <div className="text-xs opacity-90">Manage posts</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/profile/followers')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-orange-500 to-orange-600 text-white rounded-xl hover:from-orange-600 hover:to-orange-700 transition cursor-pointer shadow-lg"
          >
            <UserCheck size={24} />
            <div className="text-left">
              <div className="font-semibold">Followers ({stats.followers})</div>
              <div className="text-xs opacity-90">Who follows you</div>
            </div>
          </button>

          <button
            onClick={() => router.push('/profile/following')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-purple-500 to-purple-600 text-white rounded-xl hover:from-purple-600 hover:to-purple-700 transition cursor-pointer shadow-lg"
          >
            <Users size={24} />
            <div className="text-left">
              <div className="font-semibold">Following ({stats.following})</div>
              <div className="text-xs opacity-90">Your connections</div>
            </div>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <button
            onClick={() => router.push('/profile/notifications')}
            className="flex items-center gap-3 p-4 bg-gradient-to-r from-pink-500 to-pink-600 text-white rounded-xl hover:from-pink-600 hover:to-pink-700 transition cursor-pointer shadow-lg relative"
          >
            <Bell size={24} />
            <div className="text-left">
              <div className="font-semibold">Notifications</div>
              <div className="text-xs opacity-90">{stats.notifications} unread</div>
            </div>
            {stats.notifications > 0 && (
              <span className="absolute -top-1 -right-1 w-6 h-6 bg-red-500 text-white text-xs rounded-full flex items-center justify-center font-bold">
                {stats.notifications}
              </span>
            )}
          </button>
        </div>

        <div className="grid md:grid-cols-2 gap-10 items-center">
          {/* Left — Avatar */}
          <div className="flex flex-col items-center">
            <div className="relative w-40 h-40">
              <Image
                src={preview}
                alt="Profile"
                width={160}
                height={160}
                className="rounded-full object-cover border-4 border-blue-300 shadow-lg"
              />
              {isEditing && (
                <label className="absolute bottom-2 right-2 bg-blue-600 p-2 rounded-full cursor-pointer hover:bg-blue-700 transition">
                  <Camera className="text-white" size={20} />
                  <input type="file" accept="image/*" className="hidden" onChange={handleImageUpload} />
                </label>
              )}
            </div>
            <p className="text-gray-600 mt-3 text-center text-sm">
              {isEditing ? 'Click camera to upload new photo' : 'Profile picture'}
            </p>

            <button
              onClick={() => setShowConfirm(true)}
              className="mt-6 flex items-center gap-2 text-red-600 hover:text-red-700 font-medium cursor-pointer"
            >
              <Trash2 size={18} /> Delete Account
            </button>
          </div>

          {/* Right — Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Account Information</h2>
            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Full Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="text"
                    {...register('fullName')}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none ${
                      isEditing
                        ? 'border-blue-400 focus:ring-2 focus:ring-blue-500'
                        : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                    }`}
                  />
                </div>
                {errors.fullName && <p className="text-red-500 text-sm mt-1">{errors.fullName.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type="email"
                    {...register('email')}
                    disabled={!isEditing}
                    className={`w-full pl-10 pr-4 py-3 border rounded-lg outline-none ${
                      isEditing
                        ? 'border-blue-400 focus:ring-2 focus:ring-blue-500'
                        : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                    }`}
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email.message}</p>}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    {...register('password')}
                    disabled={!isEditing}
                    placeholder="Enter password"
                    className={`w-full pl-10 pr-10 py-3 border rounded-lg outline-none ${
                      isEditing
                        ? 'border-blue-400 focus:ring-2 focus:ring-blue-500'
                        : 'border-gray-300 bg-gray-100 cursor-not-allowed'
                    }`}
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setShowPassword((p) => !p)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500"
                    >
                      {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                    </button>
                  )}
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password.message}</p>}
              </div>

              <div className="flex items-center justify-between mt-6">
                {!isEditing ? (
                  <button
                    type="button"
                    onClick={() => setIsEditing(true)}
                    className="flex items-center gap-2 bg-blue-600 text-white px-5 py-2 rounded-lg hover:bg-blue-700 transition cursor-pointer"
                  >
                    <Edit2 size={18} /> Edit Profile
                  </button>
                ) : (
                  <div className="flex items-center gap-4">
                    <button
                      type="submit"
                      className="flex items-center gap-2 bg-green-600 text-white px-5 py-2 rounded-lg hover:bg-green-700 transition cursor-pointer"
                    >
                      <Save size={18} /> Save
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setIsEditing(false);
                        reset({
                          fullName: user.fullName,
                          email: user.email,
                          password: user.password || '',
                        });
                        setPreview(user.profileImage || '/file.svg');
                      }}
                      className="flex items-center gap-2 bg-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-400 transition cursor-pointer"
                    >
                      <X size={18} /> Cancel
                    </button>
                  </div>
                )}
              </div>

              {message && <p className="mt-4 text-green-600 text-center font-medium">{message}</p>}
            </form>
          </div>
        </div>
      </div>

      {showConfirm && (
        <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 text-center max-w-sm w-full">
            <h2 className="text-xl font-semibold mb-4">Confirm Delete</h2>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete your account? This action cannot be undone.
            </p>
            <div className="flex justify-center gap-4">
              <button
                onClick={confirmDelete}
                className="bg-red-600 text-white px-5 py-2 rounded-lg hover:bg-red-700 transition cursor-pointer"
              >
                Yes, Delete
              </button>
              <button
                onClick={() => setShowConfirm(false)}
                className="bg-gray-300 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-400 transition cursor-pointer"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ProfilePage;