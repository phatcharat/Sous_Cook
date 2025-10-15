import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { saveCameraIngredientsToLocalStorage, getCameraIngredientsFromLocalStorage } from '../utils/storageUtils';
import IconClose from '../image/nav_icon/close_btn.svg';
import { FaExclamationTriangle } from 'react-icons/fa'; 
import { useNavigate } from "react-router-dom";
import uploadImage from '../image/camera/upload.png';
import SwapCamera from '../image/camera/swap_camera.png';
import CameraButtonDefault from '../image/camera/takecamera_Default.svg';
import CameraButtonHover from '../image/camera/takecamera_Onpress.svg';
import RetakeButton from '../image/camera/Retake_Button.svg';
import NextButton from '../image/camera/Next_Button.svg';
import '../css/camera.css';
import '../css/LoadingPage.css';
import '../css/PopUpIngedientNotFound.css';

const CameraSearch = () => {
  const webcamRef = useRef(null);
  const [capturedImage, setCapturedImage] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isIngredientNotFound, setIsIngredientNotFound] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [facingMode, setFacingMode] = useState("environment");
  const navigate = useNavigate();

  const handleSwapCamera = () => {
    setFacingMode((prevState) =>
      prevState === "environment" ? "user" : "environment"
    );
  };

  const capture = useCallback(() => {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        setIsHovered(false);
        setCapturedImage(imageSrc);
      }
    }, [webcamRef]);

  const sendImageToBackend = async (imageSrc) => {
    try {
      setIsLoading(true);

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageSrc }),
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Response from backend:', data);

      if (data && data.ingredients && data.ingredients.length > 0) {
        const detectedIngredients = data.ingredients.map(ing => ({
          ...ing,
          source: "camera"
        }));
        
        console.log('detectedIngredients:', JSON.stringify(detectedIngredients, null, 2));
        
        if (detectedIngredients.length > 0) {
          // Get existing camera ingredients and append new ones
          const existingCameraIngredients = getCameraIngredientsFromLocalStorage();
          const updatedCameraIngredients = [...existingCameraIngredients, ...detectedIngredients];
          
          // Save all camera ingredients
          saveCameraIngredientsToLocalStorage(updatedCameraIngredients);
          
          navigate("/ingredient-preview");
        } else {
          setIsIngredientNotFound(true);
        }
      } else {
        console.error('No ingredients detected in the backend response');
        setIsIngredientNotFound(true);
        setCapturedImage(null);
      }
      setIsLoading(false);

    } catch (error) {
      console.error('Error sending image to backend:', error);
      setIsLoading(false);
      setIsIngredientNotFound(true);
      setCapturedImage(null);
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div>
      {isLoading && <LoadingIngredientPage />}
      {isIngredientNotFound && <PopUpIngredientNotFound onClose={() => setIsIngredientNotFound(false)} />}

      <div className="camera-container">
        {!capturedImage ? (
          <>
            <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="webcam-view"
              videoConstraints={{
                facingMode: facingMode,
              }}
            />
            <div className="camera-header">
              <span className="header-title">Add Ingredients</span>
              <img 
                src={IconClose} 
                className="close-button" 
                alt="Close" 
                onClick={() => navigate('/search')} 
              />
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
                className="upload-button"
                id="fileInput"
                style={{ display: 'none' }}
              />
            </div>
          </>
        ) : (
          <>
            <div className="camera-header">
              <span className="header-title">Add Ingredients</span>
              <img 
                src={IconClose} 
                className="close-button" 
                alt="Close" 
                onClick={() => navigate('/search')} 
              />
            </div>
            <img src={capturedImage} alt="Captured" className="captured-image" />
            <div className='camera-buttom-preview'>
              <button onClick={() => setCapturedImage(null)} className="retake-button styled-button">
                <img src={RetakeButton} alt="Retake" className="button-image" />
              </button>
              <button onClick={() => sendImageToBackend(capturedImage)} className="send-button styled-button">
                <img src={NextButton} alt="Next" className="button-image" />
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const LoadingIngredientPage = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-popup">
        <div className="spinner"></div>
        <p>Processing your image, please wait...</p>
      </div>
    </div>
  );
};

const PopUpIngredientNotFound = ({ onClose }) => {
  const [isVisible, setIsVisible] = useState(true);

  const handleClose = () => {
    setIsVisible(false);
    if (onClose) onClose();
  };

  if (!isVisible) return null;

  return (
    <div className="notfound-overlay">
      <div className="notfound-popup">
        <FaExclamationTriangle className="error-icon" />
        <p>Error Please try again</p>
        <button className="close-button" onClick={handleClose}>Close</button>
      </div>
    </div>
  );
};

export default CameraSearch;