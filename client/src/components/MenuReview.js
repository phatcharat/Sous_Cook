import React, { useState, useEffect } from 'react';
import '../css/MenuReview.css';  // Import the CSS file
import logo from '../image/Logo1.svg';
import defaultProfile from '../image/profile.jpg';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const MenuReview = () => {
    const navigate = useNavigate();

    const userIdStr = localStorage.getItem('user_id');
    const userId = parseInt(userIdStr, 10);

    const [userData, setUserData] = useState({
            username: '',
            avatar: '',
            avatar_url: defaultProfile
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


        // const handleReview = async () => {
        //         try {
                    // const formData = new FormData();
                    // formData.append('username', userData.username);
                    // formData.append('email', userData.email);
                    // formData.append('phone_number', userData.phone_number || '');
                    // formData.append('birth_date', userData.birth_date || '');
                    // formData.append('country', userData.country || '');
        
                    // const response = await axios.put(
                    //     `http://localhost:5050/api/users/${userId}`,
                    //     formData,
                    //     { headers: { 'Content-Type': 'multipart/form-data' } }
                    // );
        
                    // const updatedUser = response.data.user;
                    // setUserData(updatedUser);
        
                    // alert("Comment successfully");
                    // navigate("/menu-detail/:index");
        
            //     } catch (error) {
            //         console.error('Error comment this recipe', error);
            //         alert("Failed to comment this recipe.");
            //     }
            // };


    return (
        <div>
            <div className="rating-container">
                <div className="top-blank"></div>
                <div className="pic-logo">
                    <img src={logo} id="logo-review" alt="Sous Cook Logo"/>
                    <div className="caption-review">Review this recipe</div>
                    <div className="star-rating menu-rate">
                        <input type="radio"  name="star"/><label></label>
                        <input type="radio"  name="star"/><label></label>
                        <input type="radio"  name="star"/><label></label>
                        <input type="radio"  name="star"/><label></label>
                        <input type="radio"  name="star"/><label></label>
                    </div>
                </div>
            </div>

            <div className="review-container">
                <div class="rw-rt">
                    <div className="rw">16 reviews</div>
                    <div className="rt">27 ratings</div>
                </div>
                <div className="detail-rating">
                    <div className="left-rating">
                        <div className="rating-this-menu">4</div>
                        <div>out of 5</div>
                    </div>
                    <div className="right-rating">
                        <div className="row">
                            <div className="all-star">
                                <div className="star-rating">
                                    <span className="fa fa-star fa-1x star-base star-check"></span>
                                    <span className="fa fa-star fa-1x star-base star-check"></span>
                                    <span className="fa fa-star fa-1x star-base star-check"></span>
                                    <span className="fa fa-star fa-1x star-base star-check"></span>
                                    <span className="fa fa-star fa-1x star-base star-check"></span>
                                </div>
                                <div className="star-rating">
                                    <span className="fa fa-star fa-1x star-base star-check"></span>
                                    <span className="fa fa-star fa-1x star-base star-check"></span>
                                    <span className="fa fa-star fa-1x star-base star-check"></span>
                                    <span className="fa fa-star fa-1x star-base star-check"></span>
                                    <span className="fa fa-star fa-1x star-base"></span>
                                </div>
                                <div className="star-rating">
                                    <span className="fa fa-star fa-1x star-base star-check"></span>
                                    <span className="fa fa-star fa-1x star-base star-check"></span>
                                    <span className="fa fa-star fa-1x star-base star-check"></span>
                                    <span className="fa fa-star fa-1x star-base"></span>
                                    <span className="fa fa-star fa-1x star-base"></span>
                                </div>
                                <div className="star-rating">
                                    <span className="fa fa-star fa-1x star-base star-check"></span>
                                    <span className="fa fa-star fa-1x star-base star-check"></span>
                                    <span className="fa fa-star fa-1x star-base"></span>
                                    <span className="fa fa-star fa-1x star-base"></span>
                                    <span className="fa fa-star fa-1x star-base"></span>
                                </div>
                                <div className="star-rating">
                                    <span className="fa fa-star fa-1x star-base star-check"></span>
                                    <span className="fa fa-star fa-1x star-base"></span>
                                    <span className="fa fa-star fa-1x star-base"></span>
                                    <span className="fa fa-star fa-1x star-base"></span>
                                    <span className="fa fa-star fa-1x star-base"></span>
                                </div>
                                
                            </div>
                            <div className="all-rate">
                                d
                            </div>
                            <div className="num-rate">
                                d
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div className="post-review-container">
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
                                <input type="radio" name="star" id="star5" value={5}/><label for="star5"></label>
                                <input type="radio" name="star" id="star4" value={4}/><label for="star4"></label>
                                <input type="radio" name="star" id="star3" value={3}/><label for="star3"></label>
                                <input type="radio" name="star" id="star2" value={2}/><label for="star2"></label>
                                <input type="radio" name="star" id="star1" value={1}/><label for="star1"></label>
                            </div>
                        </div> 
                    </div>
                </div>
                <div className="review-message-box">
                    <textarea placeholder="Add a comment..." id="review-message-textarea"></textarea>
                </div>
                <div className="review-button-box">
                    <button type="submit" className="post-review-button">Post</button>
                </div>
            </div>
            
        </div>
      
    );
  };
  
  export default MenuReview;