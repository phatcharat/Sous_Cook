import React, { useState, useEffect } from 'react';
import '../css/MenuReview.css';  // Import the CSS file
import logo from '../image/Logo1.svg';
import defaultProfile from '../image/profile.jpg';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';

const MenuReview = () => {
    const navigate = useNavigate();
    const { index } = useParams();

    const userIdStr = localStorage.getItem('user_id');
    const userId = parseInt(userIdStr, 10);

    const [userData, setUserData] = useState({
        username: '',
        avatar: '',
        avatar_url: defaultProfile
    });

    const [formReview, setReviewData] = useState({
        recipe_id: '',
        comment: '',
        rating: ''
    });

    const [reviews, setReview] = useState({
        recipe_id: '',
        comment: '',
        rating: '',
        created_at: ''
        // username: '',
        // avatar: '',
        // avatar_url: defaultProfile
    });

    useEffect(() => {
        if (!userId || isNaN(userId)) {
            console.error('Invalid userId:', userIdStr);
            navigate('/login');
            return;
        }
        const fetchUserData = async () => {
            try {
                const response = await axios.get(`http://localhost:5050/api/users/${userId}`);
                const user = response.data.user;        
                setUserData(user);
            } catch (error) {
                console.error('Error fetching user data:', error);
            }
        };
        
        fetchUserData();
    }, [userId, navigate]);

    useEffect(() => {
        const fetchReviewData = async () => {
            try {
                const response = await axios.get(`http://localhost:5050/api/menu-detail/${index}/review`);
                const reviews = response.data.reviews;
                setReview(reviews);
            } catch (error) {
                console.error('Error fetching review data:', error);
            }
        };

        fetchReviewData();
    }, [index, navigate]);

    const handleReview = () => {
        navigate('/home');
    }
    const handleChange = (e) => {
        setReviewData({ ...formReview, [e.target.name]: e.target.value });
    }


    return (
        <div>
            <div className="rating-container">
                <div className="top-blank">
                    {/* <button className="back-to-menu-detail-button" onClick={() => navigate('/menu-detail/:index')}>← Back</button> */}
                </div>
                <div className="pic-logo">
                    <img src={logo} id="logo-review" alt="Sous Cook Logo"/>
                    <div className="caption-review">Review this recipe</div>
                    <div className="star-rating menu-rate">
                        <span className="fa fa-star fa-1x star-base star-check"></span>
                        <span className="fa fa-star fa-1x star-base star-check"></span>
                        <span className="fa fa-star fa-1x star-base star-check"></span>
                        <span className="fa fa-star fa-1x star-base star-check"></span>
                        <span className="fa fa-star fa-1x star-base star-check"></span>
                    </div>
                </div>
            </div>

            <div className="review-container">
                <div className="rw-rt">
                    <div className="rw">16 reviews</div>
                    <div className="rt">27 ratings</div>
                </div>
                <div className="detail-rating">
                    <div className="left-rating">
                        <div className="rating-this-menu">4</div>
                        <div>out of 5</div>
                    </div>
                    <div className="right-rating">
                        {/* <div className="row"> */}
                        <div className="row-rate-right">
                            <div className="right-star">
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                            </div>
                            <div className="all-rate">
                                <div className="progress-bar-rate">
                                </div>
                                
                            </div>
                            <div className="num-rate">
                                <div className="num-review">4</div>
                            </div>
                        </div>
                        <div className="row-rate-right">
                            <div className="right-star">
                                <span className="fa fa-star fa-1x star-base"></span>
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                            </div>
                            <div className="all-rate">
                                <div className="progress-bar-rate">
                                </div>
                                
                            </div>
                            <div className="num-rate">
                                <div className="num-review">4</div>
                            </div>
                        </div>
                        <div className="row-rate-right">
                            <div className="right-star">
                                <span className="fa fa-star fa-1x star-base"></span>
                                <span className="fa fa-star fa-1x star-base"></span>
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                            </div>
                            <div className="all-rate">
                                <div className="progress-bar-rate">
                                </div>
                                
                            </div>
                            <div className="num-rate">
                                <div className="num-review">4</div>
                            </div>
                        </div>
                        <div className="row-rate-right">
                            <div className="right-star">
                                <span className="fa fa-star fa-1x star-base"></span>
                                <span className="fa fa-star fa-1x star-base"></span>
                                <span className="fa fa-star fa-1x star-base"></span>
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                            </div>
                            <div className="all-rate">
                                <div className="progress-bar-rate">
                                </div>
                                
                            </div>
                            <div className="num-rate">
                                <div className="num-review">4</div>
                            </div>
                        </div>
                        <div className="row-rate-right">
                            <div className="right-star">
                                <span className="fa fa-star fa-1x star-base"></span>
                                <span className="fa fa-star fa-1x star-base"></span>
                                <span className="fa fa-star fa-1x star-base"></span>
                                <span className="fa fa-star fa-1x star-base"></span>
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                            </div>
                            <div className="all-rate">
                                <div className="progress-bar-rate">
                                </div>
                                
                            </div>
                            <div className="num-rate">
                                <div className="num-review">4</div>
                            </div>
                        </div>
                    </div>
                </div>

                <hr></hr>

                <div className="review-profile">
                    <div className="review-pro-pic">
                        <img
                            src={userData.avatar
                                ? `data:image/jpeg;base64,${userData.avatar}`
                                : defaultProfile
                            }
                            id="my-review-pro"
                            alt="avatar"
                            />
                    </div>
                    <div className="review-pro-rate">
                        <div className="review-username">{userData.username}</div>
                        <div className="review-rate my-rate">
                            <div className="star-rating all-users-review">
                                <span className="fa fa-star fa-1x star-base"></span>
                                <span className="fa fa-star fa-1x star-base"></span>
                                <span className="fa fa-star fa-1x star-base"></span>
                                <span className="fa fa-star fa-1x star-base"></span>
                                <span className="fa fa-star fa-1x star-base star-check"></span>
                            </div>
                        </div> 
                    </div>
                </div>
                <div className="review-message-box">
                    <div className="review-text">นี่คือข้อความที่ถูกตัดขึ้นบรรทัดใหม่อัตโนมัติเมื่อถึงขอบเขตของกล่องสี่เหลี่ยมนี้</div>
                </div>

                <hr></hr>

            </div>

            <div className="post-review-container">
                <form className="review-form" onSubmit={handleReview}>
                    <div className="review-profile">
                        <div className="review-pro-pic">
                            <img
                                src={userData.avatar
                                    ? `data:image/jpeg;base64,${userData.avatar}`
                                    : defaultProfile
                                }
                                id="my-review-pro"
                                alt="avatar"
                                />
                        </div>
                        <div className="review-pro-rate">
                            <div className="review-username">{userData.username}</div>
                            <div className="review-rate my-rate">
                                <div className="star-rating">
                                    <input type="radio" name="rating" id="star5" value={5} onChange={handleChange}/><label for="star5"></label>
                                    <input type="radio" name="rating" id="star4" value={4} onChange={handleChange}/><label for="star4"></label>
                                    <input type="radio" name="rating" id="star3" value={3} onChange={handleChange}/><label for="star3"></label>
                                    <input type="radio" name="rating" id="star2" value={2} onChange={handleChange}/><label for="star2"></label>
                                    <input type="radio" name="rating" id="star1" value={1} onChange={handleChange}/><label for="star1"></label>
                                </div>
                            </div> 
                        </div>
                    </div>
                    <div className="review-message-box">
                        <textarea name="comment" placeholder="Add a comment..." id="review-message-textarea" value={formReview.comment} onChange={handleChange}></textarea>
                    </div>
                    <div className="review-button-box">
                        <button type="submit" className="post-review-button">Post</button>
                    </div>
                </form>
            </div>
            
        </div>
      
    );
  };
  
  export default MenuReview;