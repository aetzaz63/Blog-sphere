'use client';
import React, { useState, useRef, useContext, useEffect } from 'react';
import { Menu, X, ChevronDown } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { UserContext } from '../context/UserContext';

const Navbar = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef(null);

  const { user, logout } = useContext(UserContext);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <nav className="bg-white shadow-md fixed z-50 w-full">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <div className="flex-shrink-0">
            <Link
              href="/"
              className="text-2xl font-bold text-blue-600 hover:text-blue-700 transition"
            >
              BlogSphere
            </Link>
          </div>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              href="/blogs"
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Create Blog
            </Link>
            <Link
              href="/blogs"
              className="text-gray-700 hover:text-blue-600 transition font-medium"
            >
              Blogs
            </Link>

            {!user ? (
              // Not logged in
              <div className="flex items-center space-x-4">
                <Link
                  href="/auth/login"
                  className="text-gray-700 hover:text-blue-600 transition font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/auth/register"
                  className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition"
                >
                  Sign Up
                </Link>
              </div>
            ) : (
              // Logged in - show profile dropdown
              <div className="relative" ref={dropdownRef}>
                <button
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                  className="flex items-center space-x-2 focus:outline-none"
                >
                  <Image
                    src={user.profileImage || '/default-avatar.png'}
                    alt="User Avatar"
                    width={36}
                    height={36}
                    className="rounded-full border border-gray-300"
                  />
                  <ChevronDown
                    className={`text-gray-600 transition-transform ${
                      isDropdownOpen ? 'rotate-180' : ''
                    }`}
                    size={18}
                  />
                </button>

                {isDropdownOpen && (
                  <div className="absolute right-0 mt-2 w-40 bg-white shadow-lg rounded-lg py-2 border">
                    <Link
                      href="/profile"
                      className="block px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                    >
                      Profile
                    </Link>
                    <button
                      onClick={logout}
                      className="w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100 transition"
                    >
                      Logout
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none"
            >
              {isMenuOpen ? <X size={28} /> : <Menu size={28} />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden pb-4">
            <div className="flex flex-col space-y-3">
              <Link
                href="/create"
                className="text-gray-700 hover:text-blue-600 transition font-medium py-2"
              >
                Create Blog
              </Link>
              <Link
                href="/blogs"
                className="text-gray-700 hover:text-blue-600 transition font-medium py-2"
              >
                Blogs
              </Link>

              {!user ? (
                <>
                  <Link
                    href="/auth/login"
                    className="text-gray-700 hover:text-blue-600 transition font-medium py-2"
                  >
                    Login
                  </Link>
                  <Link
                    href="/auth/register"
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition text-center"
                  >
                    Sign Up
                  </Link>
                </>
              ) : (
                <div className="flex flex-col space-y-2">
                  <Link
                    href="/profile"
                    className="text-gray-700 hover:text-blue-600 transition font-medium py-2"
                  >
                    Profile
                  </Link>
                  <button
                    onClick={logout}
                    className="text-gray-700 hover:text-blue-600 transition font-medium py-2 text-left"
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};

export default Navbar;
