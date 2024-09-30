import React, { useState } from 'react';
import './css/App.css';
import Navbar from './components/Navbar';
import Camera from './components/Camera';

function App() {
    const [showCamera, setShowCamera] = useState(false);

    return (
        <div className="App">

                {showCamera ? (
                    <Camera onClose={() => setShowCamera(false)} />
                ) : (
                    <Navbar onCameraClick={() => setShowCamera(true)} />
                )}
        </div>
    );
}

export default App;
