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

  const capture = useCallback(() => {
    if (isFlashOn) {
      // Show the flash overlay
      setFlashVisible(true);

      // Wait a short duration, then capture the photo and hide the flash
      setTimeout(() => {
        if (webcamRef.current) {
          const imageSrc = webcamRef.current.getScreenshot();
          setCapturedImage(imageSrc); // Save the captured image to state
        }

        // Hide the flash overlay
        setFlashVisible(false);
      }, 200); // Delay for flash effect (200ms)
    } else {
      // Capture photo without flash
      if (webcamRef.current) {
        const imageSrc = webcamRef.current.getScreenshot();
        setCapturedImage(imageSrc);
      }
    }
  }, [webcamRef, isFlashOn]);

  const toggleFlash = () => {
    setFlashOn(!isFlashOn);
  };

  return (
    <div className="camera-container">
      {!capturedImage ? (
        <>
          {flashVisible && <div className="flash-overlay"></div>}
          <Webcam
            audio={false}
            ref={webcamRef}
            screenshotFormat="image/jpeg"
            className="webcam-view"
            videoConstraints={{
              facingMode: "environment", // Always use the rear camera
            }}
          />
          <div className="camera-header">
            <button onClick={toggleFlash} className="flash-button" aria-label="Toggle Flash">
              <img src={isFlashOn ? FlashOnIcon : FlashOffIcon} alt={isFlashOn ? "Flash On" : "Flash Off"} />
            </button>
            <span>Identify the Ingredient</span>
            <img src={IconClose} className="close-button" alt="Close" onClick={onClose} />
          </div>
          <button onClick={capture} className="capture-button">Capture Photo</button>
        </>
      ) : (
        <div className="camera-container">
          <img src={capturedImage} alt="Captured" className="captured-image" />
          <button onClick={() => setCapturedImage(null)} className="retake-button">Retake</button>
        </div>
      )}
      <div className="toolbar">
        {/* Additional toolbar items can be added here */}
      </div>
    </div>
  );
};

export default Camera;
