import React from 'react';
import '../css/UserDataPage.css';  // Import the CSS file
import IconSetting from '../Icon/Button/Setting_btn.png';
import defaultProfile from '../image/profile.jpg';
import { useNavigate } from 'react-router-dom';
const UserDataPage = () => {
    const navigate = useNavigate();
    
    // let profilePic = document.getElementById("pic-pro");
    // let inputPic = document.getElementById("input-img");

    // inputPic.onchange = function(){
    //     profilePic.src = URL.createObjectURL(inputPic.files[0]);
    // }


    return (
      <div>
        <div class="profile-container">
            <div class="setting-container">
                <a onClick={() => navigate("/home")}><img src={IconSetting}/></a> 
            </div>
            <div class="profile-pic">
                <div class="border-box"></div>
                <div class="pic-con">
                    <img src={defaultProfile} id="pic-pro"></img>
                    {/* <div id="pic-border"></div> */}
                    <div class="nameplace">Name</div>
                </div> 
            </div>
            {/* <label for="input-img">upload image</label>
            <input type="file" accept="image/jpg, image/png, image/jpeg" id="input-img" onChange="loadPic(event)"></input> */}
            
        </div>

        <div class="userData-container">
            <div class="data-box-top">
                <div class="title">Email</div>
                <div class="data">johndoe.000@example.com</div>
                <div class="title">Phone number</div>
                <div class="data">081-234-5678</div>
                <div class="title">Date</div>
                <div class="data">23/05/2000</div>
                <div class="title">Country</div>
                <div class="data">Thailand</div>
            </div>
            <div><hr></hr></div>
            <div class="data-box-bottom">
                <div class="title">Meal Complete</div>
                <div class="data">45</div>
                <div class="title">Frequently Cooked</div>
                <div class="data">Sandwich</div>
            </div>

            <div class="logout-place">
                <button class="logout-button">LOG OUT</button>
            </div>

        </div>
      </div>
    );
  };
  
  export default UserDataPage;
