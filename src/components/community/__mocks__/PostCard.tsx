'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { formatRelativeTime, formatShortDate } from '@/lib/utils';
import { CommunityPost } from '@/types';
import { useAuth } from '@/lib/firebase/auth';
import { deletePost } from '@/lib/firebase/firestore';
import { useCommentCount } from '@/hooks/useCommentCount';
import {
  MapPinIcon,
  CalendarIcon,
  TagIcon,
  HeartIcon,
  ChatBubbleLeftIcon,
  ShareIcon,
  PencilIcon,
  TrashIcon,
  EllipsisVerticalIcon,
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartIconSolid } from '@heroicons/react/24/solid';

// For testing purposes
export const __internal = {
  reloadPage: () => {
    window.location.reload();
  },
};

interface PostCardProps {
  post: CommunityPost;
  isCompact?: boolean;
}

export default function PostCard({ post, isCompact = false }: PostCardProps) {
  const { user } = useAuth();
  const router = useRouter();
  const [liked, setLiked] = useState(false);
  const [likeCount, setLikeCount] = useState(0);
  const [showOptions, setShowOptions] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const optionsRef = useRef<HTMLDivElement>(null);
  const { count: commentCount } = useCommentCount(post.id);

  const isOwner = user && user.id === post.authorId;

  // Close options menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (optionsRef.current && !optionsRef.current.contains(event.target as Node)) {
        setShowOptions(false);
      }
    };

    if (showOptions) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showOptions]);

  const handleLike = () => {
    if (liked) {
      setLikeCount(prev => prev - 1);
    } else {
      setLikeCount(prev => prev + 1);
    }
    setLiked(!liked);
  };

  const handleCardClick = () => {
    router.push(`/community/${post.id}`);
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: post.title,
          text: post.description,
          url: `${window.location.origin}/community/${post.id}`,
        });
      } catch (error) {
        console.error('Error sharing post:', error);
      }
    }
  };

  const handleEdit = () => {
    router.push(`/community/edit/${post.id}`);
    setShowOptions(false);
  };

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this post?')) return;

    setIsDeleting(true);
    setShowOptions(false);
    try {
      await deletePost(post.id);
      // Use the testable function instead of directly calling window.location.reload()
      __internal.reloadPage();
    } catch (error) {
      console.error('Error deleting post:', error);
      alert('Failed to delete post. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  // Rest of the component remains the same
  // ...
}
