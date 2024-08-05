import React from 'react';
import '../css/Navbar.css';

const Navbar = () => {
  return (
    <div className="navbar">
      <a href="#home" className="icon-home nav-item"><i className="fa fa-home"></i></a>
      <a href="#favorites" className="icon-heart nav-item"><i className="fa fa-heart"></i></a>
      <a href="#camera" className="icon-camera nav-item"><i className="fa fa-camera"></i></a>
      <a href="#time" className="icon-clock nav-item"><i className="fa fa-clock"></i></a>
      <a href="#profile" className="icon-user nav-item"><i className="fa fa-user"></i></a>
    </div>
  );
};

export default Navbar;
