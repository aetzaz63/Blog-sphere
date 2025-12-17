// app/profile/followers/page.js
'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const FollowersPage = dynamic(() => import('./FollowersPage'), { ssr: false });

export default function Page() {
  return <FollowersPage />;
}

