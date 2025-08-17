import React, { useState } from 'react';
import AboutMe1 from '../components/AboutMe1';
import AboutMe2 from '../components/AboutMe2';
import AboutMe3 from '../components/AboutMe3';
import '../css/AboutMeTransition.css';

const AboutMeCarousel = () => {
  const [currentPage, setCurrentPage] = useState(0);
  const [touchStart, setTouchStart] = useState(null);
  const [touchEnd, setTouchEnd] = useState(null);

  const pages = [
    <AboutMe1 key="aboutme1" />,
    <AboutMe2 key="aboutme2" />,
    <AboutMe3 key="aboutme3" />
  ];
  const minSwipeDistance = 50;

  const handleTouchStart = (e) => {
    setTouchStart(e.targetTouches[0].clientX);
  };

  const handleTouchMove = (e) => {
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const handleTouchEnd = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (isRightSwipe && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  const handleMouseDown = (e) => {
    setTouchStart(e.clientX);
  };

  const handleMouseMove = (e) => {
    if (touchStart !== null) {
      setTouchEnd(e.clientX);
    }
  };

  const handleMouseUp = () => {
    if (!touchStart || !touchEnd) return;
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > minSwipeDistance;
    const isRightSwipe = distance < -minSwipeDistance;

    if (isLeftSwipe && currentPage < pages.length - 1) {
      setCurrentPage(currentPage + 1);
    } else if (isRightSwipe && currentPage > 0) {
      setCurrentPage(currentPage - 1);
    }

    setTouchStart(null);
    setTouchEnd(null);
  };

  return (
    <div
      className="carousel-container"
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        className="carousel-slider"
        style={{ transform: `translateX(-${currentPage * 100}%)` }}
      >
        {pages.map((Page, index) => (
          <div className="carousel-page" key={index}>
            {Page}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutMeCarousel;