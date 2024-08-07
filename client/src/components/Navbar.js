import React from 'react';
import '../css/Navbar.css';

const Navbar = () => {
  return (
    <div className="navbar">
      <a href="#home" className="icon-home nav-item"><i className="fa fa-home icon"  aria-hidden="true"></i></a>
      <a href="#favorites" className="icon-heart nav-item"><i className="fa fa-heart icon"  aria-hidden="true"></i></a>
      <a href="#camera" className="icon-camera nav-item"><i className="fa fa-camera icon" aria-hidden="true"></i></a>
      <a href="#time" className="icon-clock nav-item"><i className="fa fa-clock icon"  aria-hidden="true"></i></a>
      <a href="#profile" className="icon-user nav-item"><i className="fa fa-user icon"  aria-hidden="true"></i></a>
    </div>
  );
};

export default Navbar;
