import React, { useEffect, useRef } from 'react';

export default function AnimatedNetworkBg() {

    const canvasRef = useRef(null);
    
      useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');
        let animationFrameId;
    
        
        const resizeCanvas = () => {
          canvas.width = window.innerWidth;
          canvas.height = window.innerHeight;
        };
    
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
    
        
        const nodes = [];
        const nodeCount = Math.min(window.innerWidth / 10, 100); 
        const connectionDistance = 120;
    
        class node {
          constructor() {
            this.x = Math.random() * canvas.width;
            this.y = Math.random() * canvas.height;
            this.vx = (Math.random() - 0.5) * 1.5;
            this.vy = (Math.random() - 0.5) * 1.5;
            this.radius = Math.random() * 2 + 1;
          }
    
          update() {
            this.x += this.vx;
            this.y += this.vy;
    
            
            if (this.x < 0 || this.x > canvas.width) this.vx = -this.vx;
            if (this.y < 0 || this.y > canvas.height) this.vy = -this.vy;
          }
    
          draw() {
            ctx.beginPath();
            ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
            ctx.fillStyle = 'rgba(99, 102, 241, 0.7)'; 
            ctx.fill();
          }
        }
    
       
        for (let i = 0; i < nodeCount; i++) {
          nodes.push(new node());
        }
    
        
        const animate = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
    
          
          nodes.forEach((node, index) => {
            node.update();
            node.draw();
    
           
            for (let j = index + 1; j < nodes.length; j++) {
              const p2 = nodes[j];
              const distance = Math.hypot(node.x - p2.x, node.y - p2.y);
    
              if (distance < connectionDistance) {
                ctx.beginPath();
                ctx.moveTo(node.x, node.y);
                ctx.lineTo(p2.x, p2.y);
                
                const opacity = 1 - distance / connectionDistance;
                ctx.strokeStyle = `rgba(99, 102, 241, ${opacity * 0.2})`;
                ctx.lineWidth = 1;
                ctx.stroke();
              }
            }
          });
    
          animationFrameId = requestAnimationFrame(animate);
        };
    
        animate();

        return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, []);


  return (
    <canvas
      ref={canvasRef}
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        width: '100vw',
        height: '100vh',
        zIndex: -1,
        background: '#0f172a', 
        pointerEvents: 'none',
      }}
    />
  )
}
