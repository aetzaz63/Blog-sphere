'use client';
import React from 'react';
import Link from 'next/link';

// Footer Component
const Footer = () => {
  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <h3 className="text-2xl font-bold text-blue-400 mb-4">BlogSphere</h3>
            <p className="text-gray-400">
              Empowering writers and readers to share knowledge and stories
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Quick Links</h4>
            <ul className="space-y-2">
              <li><Link href="/" className="text-gray-400 hover:text-white transition">Home</Link></li>
              <li><Link href="/blogs" className="text-gray-400 hover:text-white transition">Blogs</Link></li>
              <li><Link href="/about" className="text-gray-400 hover:text-white transition">About</Link></li>
              <li><Link href="/contact" className="text-gray-400 hover:text-white transition">Contact</Link></li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Resources</h4>
            <ul className="space-y-2">
              <li><Link href="/write" className="text-gray-400 hover:text-white transition">Write a Blog</Link></li>
              <li><Link href="/categories" className="text-gray-400 hover:text-white transition">Categories</Link></li>
              <li><Link href="/privacy" className="text-gray-400 hover:text-white transition">Privacy Policy</Link></li>
              <li><Link href="/terms" className="text-gray-400 hover:text-white transition">Terms of Service</Link></li>
            </ul>
          </div>

          {/* Connect */}
          <div>
            <h4 className="text-lg font-semibold mb-4">Connect</h4>
            <ul className="space-y-2">
              <li><Link href="#" className="text-gray-400 hover:text-white transition">Twitter</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition">LinkedIn</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition">GitHub</Link></li>
              <li><Link href="#" className="text-gray-400 hover:text-white transition">Facebook</Link></li>
            </ul>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>&copy; 2025 BlogSphere. All rights reserved.</p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;