import React, { useRef, useCallback } from 'react';
import Webcam from 'react-webcam';
import '../css/camera.css';

const Camera = ({ onClose }) => {
    const webcamRef = useRef(null);

    const capture = useCallback(() => {
        const imageSrc = webcamRef.current.getScreenshot();
        console.log(imageSrc); // This logs the captured image URL
    }, [webcamRef]);

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
                <span>Identify the Ingredient</span>
                <button onClick={onClose} className="close-button">✖</button>
            </div>
            <button onClick={capture} className="capture-button">Capture Photo</button>
            <div className="toolbar">
                {/* Additional buttons or indicators can go here */}
            </div>
        </div>
    );
};

export default Camera;
