import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import { saveIngredientsToLocalStorage } from '../utils/storageUtils';
import IconClose from '../image/nav_icon/close_btn.svg';
import { FaExclamationTriangle } from 'react-icons/fa'; 
import FlashOnIcon from '../image/nav_icon/flash_on.svg';
import FlashOffIcon from '../image/nav_icon/flash_off.svg';
import IngredientPreview from './IngredientPreview'; // Import IngredientPreview
import '../css/camera.css';
import '../css/LoadingPage.css';
import '../css/PopUpIngedientNotFound.css';

const Camera = ({ onClose }) => {
  const webcamRef = useRef(null);
  const [isFlashOn, setFlashOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [flashVisible, setFlashVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Loading state
  const [isIngredientFound, setIsIngredientFound] = useState(false); // Ingredient found state
  const [ingredients, setIngredients] = useState([]); // Store detected ingredients
  const [isIngredientNotFound, setIsIngredientNotFound] = useState(false);

  const capture = useCallback(() => {
    if (isFlashOn) {
      setFlashVisible(true);

      setTimeout(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          setCapturedImage(imageSrc);  // Capture and set image from webcam
        }
        setFlashVisible(false);
      }, 200);
    } else {
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
      }
    }
  }, [webcamRef, isFlashOn]);

  const toggleFlash = () => {
    setFlashOn(!isFlashOn);
  };

  const sendImageToBackend = async (imageSrc) => {
    try {
      setIsLoading(true);  // Start loading before sending the image

      const response = await fetch(`${process.env.REACT_APP_BACKEND_URL}/upload`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ image: imageSrc }),  // Send imageSrc, which is a base64 string
      });

      if (!response.ok) {
        throw new Error('Network response was not ok');
      }

      const data = await response.json();
      console.log('Response from backend:', data);

      // Ensure `ingredients` field exists in the response and is not empty
      if (data && data.ingredients && data.ingredients.length > 0) {
        const detectedIngredients = data.ingredients;
        console.log('detectedIngredients:', JSON.stringify(detectedIngredients, null, 2));
        if (detectedIngredients.length > 0) {
          // Save ingredients to localStorage and state
          saveIngredientsToLocalStorage(detectedIngredients);
          setIngredients(detectedIngredients);
          setIsIngredientFound(true); 
        } else{
          setIsIngredientNotFound(true);
        }
      } else {
        console.error('No ingredients detected in the backend response');
        setIsIngredientNotFound(true);
        setCapturedImage(null);
      }
      setIsLoading(false); // Stop loading

    } catch (error) {
      console.error('Error sending image to backend:', error);
      setIsLoading(false);  // Stop loading even if there's an error
    }
  };

  const handleImageUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCapturedImage(reader.result);  // Set the uploaded image as capturedImage (base64 format)
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    
    <div>
      {/* Show the loading popup when `isLoading` is true */}
      {isLoading && <LoadingPage />}

      {/* Show the ingredient not found popup when `isIngredientNotFound` is true */}
      {isIngredientNotFound && <PopUpIngredientNotFound />}
      {/* When ingredients are found, show IngredientPreview */}
      {isIngredientFound ? (
        <IngredientPreview ingredients={ingredients} />
      ) : (
        <div className="camera-container">
          {!capturedImage ? (
            <>
              {flashVisible && <div className="flash-overlay"></div>}
              <Webcam
                audio={false}
                ref={webcamRef}
                screenshotFormat="image/jpeg"  // Capture image in JPEG format
                className="webcam-view"
                videoConstraints={{
                  facingMode: "environment",  // Use the back camera
                }}
              />
              <div className="camera-header">
                <button onClick={toggleFlash} className="flash-button" aria-label="Toggle Flash">
                  <img src={isFlashOn ? FlashOnIcon : FlashOffIcon} alt={isFlashOn ? "Flash On" : "Flash Off"} />
                </button>
                <span>Identify the Ingredient</span>
                <img src={IconClose} className="close-button" alt="Close" onClick={onClose} />
              </div>
              <button onClick={capture} className="capture-button styled-button">Capture Photo</button>
              <div className="upload-section">
                <input type="file" accept="image/*" onChange={handleImageUpload} className="upload-button" />
                <span>Upload Image</span>
              </div>
            </>
          ) : (
            <div className="camera-container">
              <img src={capturedImage} alt="Captured" className="captured-image" />
              <button onClick={() => setCapturedImage(null)} className="retake-button styled-button">Retake</button>
              <button onClick={() => sendImageToBackend(capturedImage)} className="send-button styled-button">Send</button>
            </div>
          )}

          
        </div>
      )}
    </div>
  );
};

const LoadingPage = () => {
  return (
    <div className="loading-overlay">
      <div className="loading-popup">
        <div className="spinner"></div>
        <p>Processing your image, please wait...</p>
      </div>
    </div>
  );
};

const PopUpIngredientNotFound = () => {
  const [isVisible, setIsVisible] = useState(true); // Track visibility

  const handleClose = () => {
    setIsVisible(false); // Hide the popup when close button is clicked
  };

  if (!isVisible) return null; // Don't render the popup if it's hidden

  return (
    <div className="notfound-overlay">
      <div className="notfound-popup">
        <FaExclamationTriangle className="error-icon" />
        <p>Ingredient not found! Please try again.</p>
        <button className="close-button" onClick={handleClose}>Close</button>
      </div>
    </div>
  );
};

export default Camera;
