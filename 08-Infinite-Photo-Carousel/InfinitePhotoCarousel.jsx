import React, { useEffect, useRef, useState } from "react";

export default function InfinitePhotoCarousel({
  images = [],
  speed = 14,
  imageWidth = 170,
  imageHeight = 205,
  spacing = 245,
  depth = 150,
  borderRadius = 20,
}) {
  const containerRef = useRef(null);
  const cardsRef = useRef([]);
  const animationRef = useRef(null);
  const progressRef = useRef(0);
  const lastTimeRef = useRef(0);
  const hoveredIndexRef = useRef(null);

  const [viewportWidth, setViewportWidth] = useState(1200);

  useEffect(() => {
    if (!containerRef.current) return;

    const observer = new ResizeObserver((entries) => {
      const width = entries[0]?.contentRect?.width;

      if (width) {
        setViewportWidth(width);
      }
    });

    observer.observe(containerRef.current);

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!images.length) return;

    const animate = (time) => {
      if (!lastTimeRef.current) {
        lastTimeRef.current = time;
      }

      const delta = (time - lastTimeRef.current) / 1000;

      lastTimeRef.current = time;

      
      if (hoveredIndexRef.current === null) {
        progressRef.current += delta / speed;
      }

      const count = images.length;

      cardsRef.current.forEach((card, index) => {
        if (!card) return;

        let position = index / count + progressRef.current;

        position = ((position + 0.5) % 1 + 1) % 1 - 0.5;

        const x = Math.sin(position * Math.PI * 2) * spacing;

        const z = Math.cos(position * Math.PI * 2);

        const front = (z + 1) / 2;

        const isSelected = hoveredIndexRef.current === index;

        
        let scale = 0.48 + front * 0.52;

        let blur = (1 - front) * 6;

        let opacity = 0.45 + front * 0.55;

        let selectedX = x;
        let selectedY = (1 - front) * 8;
        let selectedZ = z * depth;

        if (isSelected) {

          scale += 0.16;
          blur = 0;
          opacity = 1;
          selectedZ += 180;
          selectedY -= 10;
        }

        card.style.transform = ` translate3d( ${selectedX}px, ${selectedY}px,

            ${selectedZ}px ) translate(-50%, -50%) scale(${scale}) `;

        card.style.filter = `blur(${blur}px)`;

        card.style.opacity = String(opacity);

        card.style.zIndex = String( isSelected ? 5000 : Math.round(front * 1000) );
      });

      animationRef.current =  requestAnimationFrame(animate);
    };

    animationRef.current = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(
        animationRef.current
      );

      lastTimeRef.current = 0;
    };
  }, [images, speed, spacing, depth,]);

  
  const isMobile = viewportWidth <= 600;

  const isTablet = viewportWidth > 600 && viewportWidth <= 1024;

  const scale = isMobile ? 0.62 : isTablet ? 0.78 : 1;

  const responsiveWidth = imageWidth * scale;
    

  const responsiveHeight = imageHeight * scale;
    

  const responsiveSpacing = spacing * scale;
    

  const responsiveDepth =  depth * scale;
   

  const containerStyle = {
    position: "relative",
    width: "100%",
    height: isMobile ? 300 : isTablet? 400 : 520,
    overflow: "hidden",
    background: "transparent",
    perspective: isMobile ? 900 : 1200,
    perspectiveOrigin: "50% 50%",
    isolation: "isolate",
  };

  const trackStyle = {
    position: "absolute",
    left: "50%",
    top: "50%",
    width: 0,
    height: 0,
    transformStyle: "preserve-3d",
    pointerEvents: "none",
  };

  
  const cardStyle = {
    position: "absolute",
    left: 0,
    top: 0,

    width: responsiveWidth,
    height: responsiveHeight,

    overflow: "hidden",

    borderRadius:  borderRadius * scale,

    border: "2px solid rgba(255,255,255,0.9)",

    boxSizing: "border-box",

    background: "transparent",

    transformOrigin: "center center",

    transformStyle: "preserve-3d",

    willChange: "transform, filter, opacity",

    backfaceVisibility: "hidden",

    WebkitBackfaceVisibility: "hidden",

    pointerEvents: "auto",

    cursor:"pointer",

    transition:"filter 260ms ease, opacity 260ms ease",
  };

  const imageStyle = {
    display: "block",

    width: "100%",
    height: "100%",

    objectFit: "cover",

    borderRadius:  borderRadius * scale,

    userSelect: "none",

    WebkitUserSelect: "none",

    WebkitUserDrag: "none",

    pointerEvents:"none",
  };

  return (
    <div
      ref={containerRef}
      style={containerStyle} >

      <div style={trackStyle}>
        {images.map((src, index) => (

          <div key={`${src}-${index}`}
                ref={(element) => {
                  cardsRef.current[index] = element;
              }}

            style={cardStyle} onMouseEnter={() => {
              hoveredIndexRef.current = index;
                
            }}
            onMouseLeave={() => { hoveredIndexRef.current = null;
                

              
              lastTimeRef.current =  performance.now();
               
            }}
            onTouchStart={() => {
              hoveredIndexRef.current =  index;
               
            }}
            onTouchEnd={() => {
              hoveredIndexRef.current = null;
                

              lastTimeRef.current = performance.now();
                
            }}>

            <img src={src}  alt="" draggable={false}
            style={imageStyle} />
          </div>
        ))}
      </div>
    </div>
  );
}