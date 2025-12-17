// app/profile/user/[email]/page.js
'use client';
import React from 'react';
import dynamic from 'next/dynamic';

const UserProfileViewPage = dynamic(() => import('./UserProfileViewPage'), { ssr: false });

export default function Page({ params }) {
  return <UserProfileViewPage params={params} />;
}