"use client";

import React, { useState, useEffect } from "react";
import { Star } from "lucide-react";

const RatingStars = ({ postId, initialRatings, onRatingUpdate }) => {
  const [ratings, setRatings] = useState(initialRatings);
  const avg = ratings.length
    ? (ratings.reduce((a, b) => a + b, 0) / ratings.length).toFixed(1)
    : 0;

  const handleAddRating = (rating) => {
    const newRatings = [...ratings, rating];
    setRatings(newRatings);

    // Update localStorage
    const savedPosts = localStorage.getItem("blogPosts");
    if (savedPosts) {
      const posts = JSON.parse(savedPosts);
      const updatedPosts = posts.map(p => 
        p.id === postId ? { ...p, ratings: newRatings } : p
      );
      localStorage.setItem("blogPosts", JSON.stringify(updatedPosts));
      
      // Notify parent component if callback exists
      if (onRatingUpdate) {
        const updatedPost = updatedPosts.find(p => p.id === postId);
        onRatingUpdate(updatedPost);
      }
    }
  };

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center">
        {[1, 2, 3, 4, 5].map((star) => (
          <Star
            key={star}
            size={16}
            className={`cursor-pointer transition-colors ${
              star <= Math.round(avg)
                ? "fill-yellow-400 text-yellow-400"
                : "text-gray-300"
            } hover:text-yellow-500`}
            onClick={() => handleAddRating(star)}
          />
        ))}
      </div>
      <span className="text-sm font-semibold">
        {avg} ({ratings.length})
      </span>
    </div>
  );
};

export default RatingStars;