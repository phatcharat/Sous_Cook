import React, { useRef, useCallback, useState } from 'react';
import { useNavigate, useLocation } from "react-router-dom";
import Webcam from 'react-webcam';
import IconClose from '../image/nav_icon/close_btn.svg';
import uploadImage from '../image/camera/upload.png';
import SwapCamera from '../image/camera/swap_camera.png';
import CameraButtonDefault from '../image/camera/takecamera_Default.svg';
import CameraButtonHover from '../image/camera/takecamera_Onpress.svg';
import RetakeButton from '../image/camera/Retake_Button.svg';
import NextButton from '../image/camera/Next_Button.svg';
import '../css/camera.css';

const CameraSharedDish = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isHovered, setIsHovered] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const navigate = useNavigate();
  const location = useLocation();

  const menu_id = location.state?.menu_id;

  const handleSwapCamera = () => {
    setFacingMode(prev => prev === "environment" ? "user" : "environment");
  };

  // แค่เซ็ต capturedImage ไปหน้า preview
  const capture = useCallback(() => {
    if (webcamRef.current) {
      const imageSrc = webcamRef.current.getScreenshot();
      setCapturedImage(imageSrc);
      setIsHovered(false);
    }
  }, [webcamRef]);

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => setCapturedImage(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleBackNavigation = () => navigate(-1);

  const handleNext = () => {
    if (capturedImage) {
      navigate('/menu-detail', {
        state: {
          sharedDishImage: capturedImage,
          menu_id: menu_id,
          replace: true
        }
      });
    }
  };

  return (
    <div className="camera-container">
      {!capturedImage ? (
        <>
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="webcam-view"
            videoConstraints={{ facingMode }}
          />
          <div className="camera-header">
            <span className="header-title">Take your dish photo</span>
            <img src={IconClose} className="close-button" alt="Close" onClick={handleBackNavigation} />
          </div>
          <div className='camera-buttom'>
            <div className='upload-container'>
              <img
                src={uploadImage} 
                alt="Upload"
                onClick={() => document.getElementById('fileInput').click()}
                className="upload-image"
              />
            </div>
            <button 
              onClick={capture} 
              className="camera-button"
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => setIsHovered(false)}
            >
              <img 
                src={isHovered ? CameraButtonHover : CameraButtonDefault} 
                alt="Camera Button" 
                className="camera-button-img"
              />
            </button>
            <div className="swap-container">
              <img
                src={SwapCamera}
                alt="Swap Camera"
                className="swap-camera"
                onClick={handleSwapCamera}
              />
            </div>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              id="fileInput"
              style={{ display: 'none' }}
            />
          </div>
        </>
      ) : (
        <>
          <div className="camera-header">
            <span className="header-title">Preview</span>
            <img src={IconClose} className="close-button" alt="Close" onClick={handleBackNavigation} />
          </div>
          <img src={capturedImage} alt="Captured" className="captured-image" />
          <div className='camera-buttom-preview'>
            <button onClick={() => setCapturedImage(null)} className="retake-button styled-button">
              <img src={RetakeButton} alt="Retake" className="button-image" />
            </button>
            <button onClick={handleNext} className="send-button styled-button">
              <img src={NextButton} alt="Next" className="button-image" />
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default CameraSharedDish;
