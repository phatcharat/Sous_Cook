import React, { useState, useRef, useEffect } from 'react';
import '../css/AboutMe.css';
import logo from '../image/Logo.svg'; // page 1
import pic2 from '../image/picAboutMe2.jpg'; // page 2
import pic3 from '../image/picAboutMe3.svg'; // page 3
import { useNavigate } from 'react-router-dom';

const AboutMe = () => {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [scrollLeft, setScrollLeft] = useState(0);
  const containerRef = useRef(null);
  const navigate = useNavigate();

  const slides = [
    {
      id: 1,
      image: logo,
      description:
        'Sous cook is your little cooking helper, he will suggest whip-up delicious recipes based on your ingredients!',
      type: 'logo',
    },
    {
      id: 2,
      image: pic2,
      title: 'OUR MISSION',
      description:'"Provide a proper cooking and food preparation techniques to significantly minimize food waste."',
      type: 'circle',
    },
    {
      id: 3,
      image: pic3,
      title: 'Join Us Now!',
      description:
        '\"Cutting down on food waste not only positively impacts the world but also puts money back in your pocket by eliminating unnecessary spending.\"\n\nLet’s be a part of eco-conscious together !',
      type: 'banner',
    },
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  const goToSlide = (index) => {
    setCurrentSlide(index);
  };

  // Touch/Mouse handlers for swiping
  const handleStart = (e) => {
    setIsDragging(true);
    const clientX =
      e.type === 'mousedown' ? e.clientX : e.touches[0].clientX;
    setStartX(clientX);
    setScrollLeft(currentSlide * containerRef.current.offsetWidth);
  };

  const handleMove = (e) => {
    if (!isDragging) return;
    e.preventDefault();
    const clientX =
      e.type === 'mousemove' ? e.clientX : e.touches[0].clientX;
    const walk = (startX - clientX) * 2;
    const newScrollLeft = scrollLeft + walk;

    // Update slide based on scroll position
    const slideWidth = containerRef.current.offsetWidth;
    const newSlideIndex = Math.round(newScrollLeft / slideWidth);

    if (
      newSlideIndex !== currentSlide &&
      newSlideIndex >= 0 &&
      newSlideIndex < slides.length
    ) {
      setCurrentSlide(newSlideIndex);
    }
  };

  const handleEnd = () => {
    setIsDragging(false);
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e) => {
      if (e.key === 'ArrowRight') {
        nextSlide();
      } else if (e.key === 'ArrowLeft') {
        prevSlide();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentSlide]);

  return (
    <div className="onboarding-container">
      {/* Slides Container */}
      <div
        ref={containerRef}
        className="slides-wrapper"
        style={{ transform: `translateX(-${currentSlide * 100}%)` }}
        onMouseDown={handleStart}
        onMouseMove={handleMove}
        onMouseUp={handleEnd}
        onMouseLeave={handleEnd}
        onTouchStart={handleStart}
        onTouchMove={handleMove}
        onTouchEnd={handleEnd}
      >
        {slides.map((slide) => (
          <div
            key={slide.id}
            className={`slide ${
              slide.type === 'banner' ? 'slide-banner' : ''
            }`}
          >
            
            {/* Top Section with Icon/Image */}
            <div className="slide-content">

              {/* IMAGE AREA */}
            {slide.type === "circle" && (
              <div className="image-circle">
                <img src={slide.image} alt={slide.title || 'slide image'} className="circle-img" />
              </div>
            )}

            {slide.type === "logo" && (
              <div className="image-logo">
                <img src={slide.image} alt="SousCook Logo" className="logo-img" />
              </div>
            )}

            {slide.type === "banner" && (
              <div className="image-banner">
                <img src={slide.image} alt={slide.title || 'slide image'} className="banner-img" />
              </div>
            )}

              {/* TEXT AREA */}
              <div className="text-content">
                {slide.title && (
                  <h1 className="slide-title">{slide.title}</h1>
                )}
                <p className="slide-description">{slide.description}</p>
              </div>
            </div>

            {/* FOOTER */}
            <div className="slide-footer">
              <div className="dot-indicators">
                {slides.map((_, dotIndex) => (
                  <button
                    key={dotIndex}
                    onClick={() => goToSlide(dotIndex)}
                    className={`dot ${
                      dotIndex === currentSlide ? 'dot-active' : ''
                    }`}
                  />
                ))}
              </div>

              <button
                className="get-started-btn"
                onClick={() => navigate('/login')}
              >
                GET STARTED
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AboutMe;