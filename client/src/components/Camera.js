import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import IconClose from '../image/nav_icon/close_btn.svg';
import FlashOnIcon from '../image/nav_icon/flash_on.svg';
import FlashOffIcon from '../image/nav_icon/flash_off.svg';
import '../css/camera.css';

const Camera = ({ onClose }) => {
  const webcamRef = useRef(null);
  const [isFlashOn, setFlashOn] = useState(false);
  const [capturedImage, setCapturedImage] = useState(null);
  const [flashVisible, setFlashVisible] = useState(false);
  const [gptResponse, setGptResponse] = useState(null);
  const [isLoading, setIsLoading] = useState(false); // New loading state

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
    } catch (error) {
      console.error('Error sending image to backend:', error);
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

  if (isLoading) {
    return <LoadingPage />; // Show loading page while waiting
  }

  if (gptResponse) {
    return <ResponsePage response={gptResponse} />;  // Show GPT-4 response
  }

  return (
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
  );
};

const LoadingPage = () => {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>Processing your image, please wait...</p>
    </div>
  );
};

const ResponsePage = ({ response }) => {
  return (
    <div className="response-container">
      <h2>Response from GPT-4</h2>
      <p>{response}</p>
      <button onClick={() => window.location.reload()} className="back-button styled-button">
        Back to Camera
      </button>
    </div>
  );
};

export default Camera;
