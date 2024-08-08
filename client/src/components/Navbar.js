import React from 'react';
import '../css/Navbar.css';

const Navbar = ({onCameraClick}) => {
  return (
    <div className="navbar">
      <a className="icon-home nav-item"><i className="fa fa-home icon"  aria-hidden="true"></i></a>
      <a className="icon-heart nav-item"><i className="fa fa-heart icon"  aria-hidden="true"></i></a>
      <a className="icon-camera nav-item" onClick={onCameraClick}><i className="fa fa-camera icon" aria-hidden="true"></i></a>
      <a className="icon-clock nav-item"><i className="fa fa-clock icon"  aria-hidden="true"></i></a>
      <a className="icon-user nav-item"><i className="fa fa-user icon"  aria-hidden="true"></i></a>
    </div>
  );
};

export default Navbar;
