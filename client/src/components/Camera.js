import React, { useRef, useCallback, useState } from 'react';
import Webcam from 'react-webcam';
import IconClose from '../image/nav_icon/close_btn.svg';
import FlashOnIcon from '../image/nav_icon/flash_on.svg';
import FlashOffIcon from '../image/nav_icon/flash_off.svg';
import '../css/camera.css';

const Camera = ({ onClose }) => {
  const webcamRef = useRef(null);
  const [isFlashOn, setFlashOn] = useState(false);

  const capture = useCallback(() => {
      const imageSrc = webcamRef.current.getScreenshot();
      console.log(imageSrc); // Logs the captured image URL
  }, [webcamRef]);

  const toggleFlash = () => {
      setFlashOn(!isFlashOn); // Toggle the flash state
  };

  return (
      <div className="camera-container">
          <Webcam
              audio={false}
              ref={webcamRef}
              screenshotFormat="image/jpeg"
              className="webcam-view"
              videoConstraints={{
                  width: window.innerWidth,
                  height: window.innerHeight,
                  facingMode: "user"
              }}
          />
          <div className="camera-header">
              <button onClick={toggleFlash} className="flash-button" aria-label="Toggle Flash">
                  <img src={isFlashOn ? FlashOnIcon : FlashOffIcon} alt={isFlashOn ? "Flash On" : "Flash Off"} />
              </button>
              <span>Identify the Ingredient</span>
              <img src={IconClose} className="close-button" alt="Close"onClick={onClose} />
          </div>
          <button onClick={capture} className="capture-button">Capture Photo</button>
          <div className="toolbar">
              {/* Additional toolbar items can be added here */}
          </div>
      </div>
  );
};

export default Camera;
