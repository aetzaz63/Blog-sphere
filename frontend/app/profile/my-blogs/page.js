// app/profile/my-blogs/page.js
'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const MyBlogsPage = dynamic(() => import('./MyBlogsPage'), { ssr: false });

export default function Page() {
  return <MyBlogsPage />;
}



