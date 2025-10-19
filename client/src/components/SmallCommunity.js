import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../css/SmallCommunity.css';
import defaultProfile from '../image/profile.jpg';
import LikeIcon from '../image/Favorite.svg';
import CommentIcon from '../image/comment.svg';
import BackIcon from '../image/searchbar/Back.svg';
import Header from '../image/homepage/Header.svg';
import '../css/Navbar.css';
import IconHome from '../image/nav_icon/icon_home.svg';
import IconHeart from '../image/nav_icon/icon_like.svg';
import IconCamera from '../image/nav_icon/icon_camera.svg';
import IconClock from '../image/nav_icon/icon_history.svg';
import IconUser from '../image/nav_icon/icon_people.svg';
import IconCloseComment from '../image/closeiconblack.svg';
import SendIcon from '../image/send-icon.svg';

const SmallCommunity = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const menuId = location.state?.menu_id;
    const currentUserId = parseInt(localStorage.getItem('user_id'), 10) || null;

    const [posts, setPosts] = useState([]);
    const [selected, setSelected] = useState('');
    const [isLoading, setIsLoading] = useState(true);
    const [isCommentsOpen, setIsCommentsOpen] = useState(false);
    const [currentPostId, setCurrentPostId] = useState(null);
    const [newCommentText, setNewCommentText] = useState('');

    // Fetch posts
    useEffect(() => {
        const fetchPosts = async () => {
            try {
                setIsLoading(true);
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
                    liked: false,
                    comments: p.comments || []
                }));
                setPosts(formatted);
            } catch (err) {
                console.error('Error fetching posts:', err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchPosts();
    }, [menuId]);

    // Navigation
    const handleNavigation = (page) => {
        setSelected(page);
        navigate(`/${page}`);
    };

    const handleBackNavigation = () => {
        navigate(-1);
    };

    const handleLike = async (postId) => {
        if (!currentUserId) return;
        try {
            const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/community/${postId}/like`, {
                user_id: currentUserId,
            });
            if (res.data.success) {
                setPosts(prevPosts => prevPosts.map(p =>
                    p.id === postId ? { ...p, likes: res.data.like_count, liked: res.data.liked } : p
                ));
            }
        } catch (err) {
            console.error('Error toggling like:', err);
        }
    };

    const handleOpenComments = (postId) => {
        setCurrentPostId(postId);
        setIsCommentsOpen(true);
    };

    const handleCloseComments = () => {
        setCurrentPostId(null);
        setIsCommentsOpen(false);
    };

    const handleAddComment = async () => {
        if (!newCommentText.trim() || !currentUserId) return;
        try {
            const res = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/community/${currentPostId}/comments`, {
                user_id: currentUserId,
                comment_text: newCommentText.trim(),
            });
            if (res.data.success) {
                setPosts(prevPosts => prevPosts.map(p => {
                    if (p.id === currentPostId) {
                        return {
                            ...p,
                            comments: [{
                                comment_id: res.data.comment_id,
                                user_id: currentUserId,
                                username: res.data.username || 'You',
                                avatar: res.data.avatar_url || defaultProfile,
                                comment_text: newCommentText.trim()
                            }, ...p.comments]
                        };
                    }
                    return p;
                }));
                setNewCommentText('');
            }
        } catch (err) {
            console.error('Error adding comment:', err);
        }
    };

    const handleDeleteComment = async (postId, commentId) => {
        try {
            await axios.delete(`${process.env.REACT_APP_BASE_URL}/api/community/comments/${commentId}`);
            setPosts(prevPosts => prevPosts.map(p => {
                if (p.id === postId) {
                    return { ...p, comments: p.comments.filter(c => c.comment_id !== commentId) };
                }
                return p;
            }));
        } catch (err) {
            console.error('Error deleting comment:', err);
        }
    };

    const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : '';

    const currentPost = posts.find(p => p.id === currentPostId);

    return (
        <>
            {isLoading && <div className="loading-overlay"><div className="spinner"></div></div>}

            <div className="community-container">
                <div className='community-header-container'>
                    <img src={Header} alt="Header" className="community-header-image" />
                    <div className="back-to-menu-detail">
                        <button className="community-back-button" onClick={handleBackNavigation}>
                            <img src={BackIcon} alt="Back" className="back-icon" />
                        </button>
                    </div>
                </div>

                {posts.map(post => (
                    <div key={post.id} className="community-post-card">
                        <div className="community-post-header">
                            <img src={post.avatar} className="user-profile-pic" alt="avatar" onError={e => e.target.src = defaultProfile}/>
                            <p className="community-username">{capitalize(post.username)}</p>
                        </div>

                        {post.caption && <p className="community-caption">{post.caption}</p>}
                        {post.image && <img src={post.image} className="community-post-image" alt="dish" onError={e => e.target.style.display='none'}/>}

                        <div className="community-post-actions">
                            <button className={`community-like-button ${post.liked ? 'liked' : ''}`} onClick={() => handleLike(post.id)}>
                                <img src={LikeIcon} alt="like" /> {post.likes}
                            </button>
                            <button className="community-comment-button" onClick={() => handleOpenComments(post.id)}>
                                <img src={CommentIcon} alt="comment" /> {post.comments.length}
                            </button>

                            <div className="comment-preview">
                                {post.comments.slice(0, 2).map(c => (
                                    <div key={c.comment_id} className="comment-card">
                                        <strong>{c.username}</strong> {c.comment_text}
                                    </div>
                                ))}
                            </div>
                        </div>

                        <p className="community-created-at">
                            {new Date(post.created_at).toLocaleDateString('en-GB')}
                        </p>
                    </div>
                ))}

                {/* Comments drawer */}
                {isCommentsOpen && currentPost && (
                    <div className="comments-overlay">
                        <div className="comments-drawer">
                        <h2>Comments</h2>
                        <img src={IconCloseComment} className="drawer-close-button" alt="Close" onClick={handleCloseComments} />

                        <div className="comments-list-container">
                            {currentPost.comments.length === 0 ? (
                            <p className="no-comments-message">No comments yet. Be the first!</p>
                            ) : (
                            <div className="comments-list">
                                {currentPost.comments.map(c => (
                                <div key={c.comment_id} className="comment-item">
                                    <img src={c.avatar || defaultProfile} className="comment-avatar" alt="avatar" onError={e => e.target.src = defaultProfile}/>
                                    <div className="comment-content">
                                    <p><strong>{c.username}</strong> {c.comment_text}</p>
                                    {c.user_id === currentUserId && (
                                        <button className="delete-comment" onClick={() => handleDeleteComment(currentPostId, c.comment_id)}>Delete</button>
                                    )}
                                    </div>
                                </div>
                                ))}
                            </div>
                            )}
                        </div>

                        <div className="add-comment-container">
                            <input
                            type="text"
                            className="comment-text-input"
                            placeholder="Add a comment..."
                            value={newCommentText}
                            onChange={e => setNewCommentText(e.target.value)}
                            />
                            <button className="send-comment-button" onClick={handleAddComment}>
                            <img src={SendIcon} alt="Send" />
                            </button>
                        </div>
                        </div>
                    </div>
                    )}

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
        </>
    );
};

export default SmallCommunity;
