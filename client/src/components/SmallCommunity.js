import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/SmallCommunity.css';
import defaultProfile from '../image/profile.jpg';
import LikeIcon from '../image/Favorite.svg';
import Header from '../image/homepage/Header.svg';
import '../css/Navbar.css';
import IconHome from '../image/nav_icon/icon_home.svg';
import IconHeart from '../image/nav_icon/icon_like.svg';
import IconCamera from '../image/nav_icon/icon_camera.svg';
import IconClock from '../image/nav_icon/icon_history.svg';
import IconUser from '../image/nav_icon/icon_people.svg';

const SmallCommunity = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const menuId = location.state?.menu_id;
    const currentUserId = localStorage.getItem('user_id');

    const [posts, setPosts] = useState([]);
    const [selected, setSelected] = useState('small-community');

  // Fetch posts from backend
    useEffect(() => {
        const fetchPosts = async () => {
        try {
            const res = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/community`, {
            params: menuId ? { menu_id: menuId } : {}
            });

            const data = res.data.posts || [];
            const formatted = data.map(p => ({
            id: p.post_id,
            username: p.username,
            avatar: p.avatar_url || defaultProfile,
            image: p.image_url || '',
            caption: p.caption || '',
            created_at: p.created_at,
            likes: p.like_count || 0,
            liked: false
            }));
            setPosts(formatted);
        } catch (err) {
            console.error('Error fetching posts:', err);
        }
        };
        fetchPosts();
    }, [menuId]);

    // Toggle like/unlike
    const handleLike = async (postId) => {
        try {
        const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/community/${postId}/like`, {
            user_id: currentUserId,
        });

        if (res.data.success) {
            setPosts(posts.map(p =>
            p.id === postId
                ? { ...p, likes: res.data.like_count, liked: res.data.liked }
                : p
            ));
        }
        } catch (err) {
        console.error('Error toggling like:', err);
        }
    };

    // Navigation
    const handleNavigation = (page) => {
        setSelected(page);
        navigate(`/${page}`);
    };

    const handleBackNavigation = () => {
        navigate(-1);
    };

  // Function to capitalize first letter
    const capitalize = (str) => {
    if (!str) return '';
    return str.charAt(0).toUpperCase() + str.slice(1);
    };

  return (
    <div className="community-container">
      {/* Header */}
      <div className='community-header-container'>
        <img src={Header} alt="Header" className="community-header-image" />
        <div className="back-to-menu-detail">
        <button className="back-button" onClick={handleBackNavigation}></button>
        </div>
      </div>

      {posts.length === 0 && <p className="community-no-posts">No posts yet</p>}

      {posts.map(post => (
        <div key={post.id} className="community-post-card">
          {/* Post header */}
          <div className="community-post-header">
            <img 
              src={post.avatar} 
              className="user-profile-pic" 
              alt="avatar"
              onError={(e) => e.target.src = defaultProfile}
            />
            <p className="community-username">{capitalize(post.username)}</p>
          </div>

          {/* Post image */}
          {post.image && (
            <img 
              src={post.image} 
              className="community-post-image" 
              alt="dish"
              onError={(e) => e.target.style.display = 'none'}
            />
          )}

          {/* Like button */}
          <div className="community-post-actions">
            <button 
              className={`community-like-button ${post.liked ? 'liked' : ''}`}
              onClick={() => handleLike(post.id)}
            >
              <img src={LikeIcon} alt="like" /> 
              <span className="community-like-count">{post.likes}</span>
            </button>
          </div>
          {/* Caption and date */}
          {post.caption && (
            <p className="community-caption">
            <strong className="community-username-caption">{capitalize(post.username)}</strong>
            {post.caption}
            </p>
            )}
          <p className="community-created-at">
            {new Date(post.created_at).toLocaleDateString('en-GB', {
              day: '2-digit',
              month: '2-digit',
              year: 'numeric'
            })}
          </p>
        </div>
      ))}

      {/* Navigation Bar */}
      <div className="navbar">
        <a className={`home nav-item ${selected === 'home' ? 'selected' : ''}`} onClick={() => handleNavigation('home')}>
          <img src={IconHome} alt="home" />
        </a>
        <a className={`heart nav-item ${selected === 'favorites' ? 'selected' : ''}`} onClick={() => handleNavigation('favorites')}>
          <img src={IconHeart} alt="favorites" />
        </a>
        <a className={`camera nav-item ${selected === 'camera' ? 'selected' : ''}`} onClick={() => handleNavigation('camera')}>
          <img src={IconCamera} alt="camera" />
        </a>
        <a className={`history nav-item ${selected === 'history' ? 'selected' : ''}`} onClick={() => handleNavigation('history')}>
          <img src={IconClock} alt="history" />
        </a>
        <a className={`account nav-item ${selected === 'account' ? 'selected' : ''}`} onClick={() => handleNavigation('account')}>
          <img src={IconUser} alt="account" />
        </a>
      </div>
    </div>
  );
};

export default SmallCommunity;
