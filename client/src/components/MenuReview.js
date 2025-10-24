import React, { useState, useEffect } from 'react';
import '../css/MenuReview.css';  // Import the CSS file
import logo from '../image/Logo1.svg';
import backicon from '../image/searchbar/Back.svg';
import defaultProfile from '../image/profile.jpg';
import deleteicon from '../Icon/Button/Delete_btn.png';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const MenuReview = () => {
    const navigate = useNavigate();
    // const { index } = useParams();
    const location = useLocation();
    const menuIdStr = location.state?.menu_id;
    const menuId = parseInt(menuIdStr, 10);

    const userIdStr = localStorage.getItem('user_id');
    const userId = parseInt(userIdStr, 10);

    const [userData, setUserData] = useState({
        username: '',
        avatar: '',
        avatar_url: defaultProfile
    });

    const [formReview, setReviewData] = useState({
        user_id: '',
        menu_id: '',
        comment: '',
        rating: ''
    });

    const [reviews, setReview] = useState([{
        menu_id: '',
        comment: '',
        rating: '',
        created_at: '',
        updated_at: '',
        username: '',
        avatar: '',
        avatar_url: defaultProfile
    }]);

    const [ratings, setRating] = useState({
        sum_rating: 0,
        avg_rating: 0,
        rate_5: 0,
        rate_4: 0,
        rate_3: 0,
        rate_2: 0,
        rate_1: 0,
        percent_rate_5: 0,
        percent_rate_4: 0,
        percent_rate_3: 0,
        percent_rate_2: 0,
        percent_rate_1: 0
    });

    const [hasReviewed, setHasReview] = useState(false);

    const [errors, setErrors] = useState({});

    const [showUpdatePopup, setShowUpdatePopup] = useState(false);

    const [showDeletePopup, setShowDeletePopup] = useState(false);

    useEffect(() => {
        if (!userId || isNaN(userId)) {
            console.error('Invalid userId:', userIdStr);
            navigate('/login');
            return;
        }
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/users/${userId}`);
                const user = response.data.user;        
                setUserData(user);
                if (user.avatar_url) {
                    setUserData(prevData => ({
                        ...prevData,
                        avatar_url: `${user.avatar_url}?t=${Date.now()}` // แล้วอัปเดตเฉพาะ avatar_url
                    }));
                }
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        
        fetchUserData();
    }, [userId, navigate]);

    const fetchReviewData = async () => {
        try {
            const response = await axios.get(`${process.env.REACT_APP_BASE_URL}/api/menu-detail/${menuId}/reviews`);
            const { reviews, menu_id, sum_rating, avg_rating, rate_5, rate_4, rate_3, rate_2, rate_1 } = response.data;
            if (!menu_id) { 
                console.error("Backend did not return a valid menu_id.");
                return; 
            }
            setReview(reviews || []);
            setRating({
                sum_rating: sum_rating || 0,
                avg_rating: avg_rating || 0,
                rate_5: rate_5 || 0,
                rate_4: rate_4 || 0,
                rate_3: rate_3 || 0,
                rate_2: rate_2 || 0,
                rate_1: rate_1 || 0,
                percent_rate_5: (reviews.length > 0 ? (rate_5 / reviews.length) * 100 : 0),
                percent_rate_4: (reviews.length > 0 ? (rate_4 / reviews.length) * 100 : 0),
                percent_rate_3: (reviews.length > 0 ? (rate_3 / reviews.length) * 100 : 0),
                percent_rate_2: (reviews.length > 0 ? (rate_2 / reviews.length) * 100 : 0),
                percent_rate_1: (reviews.length > 0 ? (rate_1 / reviews.length) * 100 : 0)
            });
            setReviewData(prevData => ({
                ...prevData,
                menu_id: menuId,
                user_id: userIdStr
            }));
            
            const foundReview = reviews && Array.isArray(reviews) ? 
            reviews.some(review => review.user_id === userId) : false; 
            setHasReview(foundReview);
            console.log('check has review in fetch', foundReview, userId)

        } catch (error) {
            console.error('Error fetching review data:', error);
        }
    };


    useEffect(() => {
        fetchReviewData();
    }, [menuId]);



    const renderStars = (rate) => {
        const numericRating = parseFloat(rate) || 0;
        const finalRating = Math.round(numericRating); 
        
        const STAR_VALUES = [5, 4, 3, 2, 1];
        
        return STAR_VALUES.map((starValue) => (
            <span 
                key={starValue} 
                className={`fa fa-star fa-1x star-base ${
                    starValue <= finalRating
                        ? 'star-check' 
                        : '' 
                }`}
            >
            </span>
        ));
    };

    const validateForm = (formData) => {
        const newErrors = {};

        if (!formData.rating) {
            newErrors.rating = 'Please give a star rating.';
        }

        return newErrors;
    };

    const showProfile = (review) => {
        // ใช้ defaultProfile เป็น fallback
        let avatarUrl = review?.avatar
            ? `${process.env.REACT_APP_BASE_URL}/uploads/avatars/${review.avatar}?t=${Date.now()}`
            : defaultProfile;
    
        return (
            <img
                src={avatarUrl}
                className="my-review-pro"
                alt="avatar"
                onError={(e) => {
                    // fallback ไป defaultProfile ถ้าโหลด avatar ไม่ได้
                    e.target.onerror = null; // ป้องกัน loop
                    e.target.src = defaultProfile;
                }}
            />
        );
    };

    const showDate = (review) => {
        if (review.updated_at) {
            review.updated_at = review.updated_at.split('T')[0];
            return (<div className="show-date-review">{review.updated_at}</div>);
        } else {
            review.created_at = review.created_at.split('T')[0];
            return (<div className="show-date-review">{review.created_at}</div>);
        }
    };

    const showDeleteReview = (review) => {
        if (review.user_id === userId) {
            return (<button className="del-rew-bttn" onClick={() => setShowDeletePopup(true)}><img src={deleteicon}/></button>)
        }
    };

    const handleChange = (e) => {
        const { name, value } = e.target;
        
        setReviewData(prevForm => ({ ...prevForm, [name]: value }));

        if (errors[name] && value) {
            setErrors(prevErrors => {
                const updatedErrors = { ...prevErrors };
                delete updatedErrors[name]; 
                return updatedErrors;
            });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newErrors = validateForm(formReview);
        setErrors(newErrors); // แสดงข้อผิดพลาดทั้งหมด
        const isValid = Object.keys(newErrors).length === 0;
        
        if (!isValid) {
            return; 
        }

        const rating_int = parseInt(formReview.rating, 10);

        if (hasReviewed) {
            setShowUpdatePopup(true); 
        } else {
            if (rating_int < 1 || rating_int > 5) {
            console.error("rate should be in 1 - 5")
            return;
        }
        if (!menuId) {
            console.error("Cannot submit review: menu_id is missing.");
            // setError("Menu ID not set. Please refresh."); // ถ้าคุณมี setError
            return; 
        }
        try {
            const response = await axios.post(`${process.env.REACT_APP_BASE_URL}/api/menu-detail/${menuId}/reviews`, formReview);
            setReviewData({
                comment: '',
                rating: ''
            });
            fetchReviewData(); 
        } catch (error) {
            console.error('Error for post review:', error);
        }
        }
        
    };

    const handleUpdateReview = async (e) => {
        e.preventDefault();
            try {
                const response = await axios.put(`${process.env.REACT_APP_BASE_URL}/api/reviews`, formReview);
                setShowUpdatePopup(false);
                setReviewData({
                    comment: '',
                    rating: ''
                });
                fetchReviewData(); 
            } catch (error) {
                console.error('Error for put review:', error);
            }
    };

    const handleDeleteReview = async (e) => {
        try {
            const response = await axios.delete(`${process.env.REACT_APP_BASE_URL}/api/${menuId}/${userId}/reviews`);
            setShowDeletePopup(false);
            fetchReviewData();
        } catch (error) {
            console.error('Error for delete review:', error);
        }
    };

    return (
        <div className="review-page">
            <div className="rating-container">
                <div className="top-blank">
                    <img
                        src={backicon}
                        alt="back"
                        className="back-icon"
                        onClick={() => navigate(-1)}
                        style={{ cursor: "pointer" }}
                    />
                </div>
                <div className="pic-logo">
                    <img src={logo} id="logo-review" alt="Sous Cook Logo"/>
                    <div className="caption-review">Review this recipe</div>
                    <div className="star-rating menu-rate">
                        {renderStars(ratings.avg_rating)}
                    </div>
                </div>
            </div>

            <div className="review-container">
                <div className="rw-rt">
                    <div className="rw">{reviews.length} reviews</div>
                    <div className="rt">{ratings.sum_rating} ratings</div>
                </div>
                <div className="detail-rating">
                    <div className="left-rating">
                        <div className="rating-this-menu">{ratings.avg_rating}</div>
                        <div>out of 5</div>
                    </div>
                    <div className="right-rating">
                        {/* <div className="row"> */}
                        <div className="row-rate-right">
                            <div className="right-star">
                                {renderStars(5)}
                            </div>
                            <div className="all-rate">
                                <div className="progress-bar-rate">
                                    <div className="percent-progress-bar" style={{ width: `${ratings.percent_rate_5}%`}}></div>
                                </div>
                                
                            </div>
                            <div className="num-rate">
                                <div className="num-review">{ratings.rate_5}</div>
                            </div>
                        </div>
                        <div className="row-rate-right">
                            <div className="right-star">
                                {renderStars(4)}
                            </div>
                            <div className="all-rate">
                                <div className="progress-bar-rate">
                                    <div className="percent-progress-bar" style={{ width: `${ratings.percent_rate_4}%`}}></div>
                                </div>
                                
                            </div>
                            <div className="num-rate">
                                <div className="num-review">{ratings.rate_4}</div>
                            </div>
                        </div>
                        <div className="row-rate-right">
                            <div className="right-star">
                                {renderStars(3)}
                            </div>
                            <div className="all-rate">
                                <div className="progress-bar-rate">
                                    <div className="percent-progress-bar" style={{ width: `${ratings.percent_rate_3}%`}}></div>
                                </div>
                                
                            </div>
                            <div className="num-rate">
                                <div className="num-review">{ratings.rate_3}</div>
                            </div>
                        </div>
                        <div className="row-rate-right">
                            <div className="right-star">
                                {renderStars(2)}
                            </div>
                            <div className="all-rate">
                                <div className="progress-bar-rate">
                                    <div className="percent-progress-bar" style={{ width: `${ratings.percent_rate_2}%`}}></div>
                                </div>
                                
                            </div>
                            <div className="num-rate">
                                <div className="num-review">{ratings.rate_2}</div>
                            </div>
                        </div>
                        <div className="row-rate-right">
                            <div className="right-star">
                                {renderStars(1)}
                            </div>
                            <div className="all-rate">
                                <div className="progress-bar-rate">
                                    <div className="percent-progress-bar" style={{ width: `${ratings.percent_rate_1}%`}}></div>
                                </div>
                                
                            </div>
                            <div className="num-rate">
                                <div className="num-review">{ratings.rate_1}</div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr></hr>
                
                {reviews.length === 0 ? (
                    <p className="no-review-text">Be the first to leave a review!</p>
                    ) : (
                    reviews.map((review, index_review) => (
                        <div key={index_review}>
                            <div className="review-profile">
                                <div className="review-pro-pic">
                                    {showProfile(review)}
                                </div>
                                <div className="review-pro-rate">
                                    <div className="review-username">{review.username}</div>
                                    <div className="review-rate my-rate">
                                        <div className="star-rating all-users-review">
                                            {renderStars(review.rating)}
                                        </div>
                                    </div> 
                                </div>
                                {showDeleteReview(review)}

                            </div>
                            <div className="comment-box">
                                <div className="review-text">{review.comment}</div>
                                {showDate(review)}
                            </div>

                            <hr></hr>
                        </div>
                    ))
                )}

                

            </div>

            <div className="post-review-container">
                <form className="review-form" onSubmit={handleSubmit}>
                    <div className="review-profile">
                        <div className="review-pro-pic">
                            {showProfile(userData)}
                        </div>
                        <div className="review-pro-rate">
                            <div className="review-username">{userData.username}</div>
                            <div className="review-rate my-rate">
                                <div className="star-rating">
                                    <input type="radio" name="rating" id="star5" value={'5'} checked={formReview.rating === '5'} onChange={handleChange}/><label for="star5"></label>
                                    <input type="radio" name="rating" id="star4" value={'4'} checked={formReview.rating === '4'} onChange={handleChange}/><label for="star4"></label>
                                    <input type="radio" name="rating" id="star3" value={'3'} checked={formReview.rating === '3'} onChange={handleChange}/><label for="star3"></label>
                                    <input type="radio" name="rating" id="star2" value={'2'} checked={formReview.rating === '2'} onChange={handleChange}/><label for="star2"></label>
                                    <input type="radio" name="rating" id="star1" value={'1'} checked={formReview.rating === '1'} onChange={handleChange}/><label for="star1"></label>
                                </div>
                            </div> 
                        </div>
                    </div>
                    <div className="review-message-box">
                        <textarea name="comment" placeholder="Add a comment..." id="review-message-textarea" value={formReview.comment} onChange={handleChange}></textarea>
                    </div>
                    <div className="message-error-box">
                        {errors.rating &&
                        <div className="rating-error">{errors.rating}</div>}
                    </div>
                    <div className="review-button-box">
                        <button type="submit" className="post-review-button">Post</button>
                    </div>
                </form>
            </div>
            {showUpdatePopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Update Reiview</h2>
                        <p>Are you sure you want to update your review?</p>
                        <div className="popup-buttons">
                            <button
                                className="cancel-button-review"
                                onClick={() => setShowUpdatePopup(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirm-button-review"
                                onClick={handleUpdateReview}
                            >
                                Update
                            </button>
                        </div>
                    </div>
                </div>
              )}  
              {showDeletePopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h2>Delete Reiview</h2>
                        <p>Are you sure you want to delete your review?</p>
                        <div className="popup-buttons">
                            <button
                                className="cancel-button-review"
                                onClick={() => setShowDeletePopup(false)}
                            >
                                Cancel
                            </button>
                            <button
                                className="confirm-button-review"
                                onClick={handleDeleteReview}
                            >
                                Delete
                            </button>
                        </div>
                    </div>
                </div>
              )}  
            
        </div>
    );
  };
  
  export default MenuReview;