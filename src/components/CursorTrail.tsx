import React, { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  size: number;
  speedX: number;
  speedY: number;
  color: string;
  life: number;
  maxLife: number;
}

export const CursorTrail: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const particles = useRef<Particle[]>([]);
  const mouse = useRef({ x: 0, y: 0 });

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    const colors = ['#00f2ff', '#7000ff', '#001aff', '#bd00ff', '#00d4ff', '#7b61ff'];

    const createParticle = (x: number, y: number) => {
      const size = Math.random() * 4 + 2;
      const life = Math.random() * 40 + 20;
      particles.current.push({
        x,
        y,
        size,
        speedX: (Math.random() - 0.5) * 2.5,
        speedY: (Math.random() - 0.5) * 2.5,
        color: colors[Math.floor(Math.random() * colors.length)],
        life,
        maxLife: life,
      });
    };

    const handleMouseMove = (e: MouseEvent) => {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;
      
      // Create particles for a dense trail
      // Reduced count slightly for better performance while maintaining density
      for (let i = 0; i < 15; i++) {
        createParticle(e.clientX, e.clientY);
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches[0]) {
        mouse.current.x = e.touches[0].clientX;
        mouse.current.y = e.touches[0].clientY;
        for (let i = 0; i < 10; i++) {
          createParticle(e.touches[0].clientX, e.touches[0].clientY);
        }
      }
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let i = 0; i < particles.current.length; i++) {
        const p = particles.current[i];
        p.x += p.speedX;
        p.y += p.speedY;
        p.life--;

        if (p.life <= 0) {
          particles.current.splice(i, 1);
          i--;
          continue;
        }

        const opacity = p.life / p.maxLife;
        
        // 1. Large Outer Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * opacity * 1.5, 0, Math.PI * 2);
        ctx.shadowBlur = 15 * opacity;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity * 0.15;
        ctx.fill();
        
        // 2. Intense Inner Glow
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * opacity, 0, Math.PI * 2);
        ctx.shadowBlur = 8 * opacity;
        ctx.shadowColor = p.color;
        ctx.fillStyle = p.color;
        ctx.globalAlpha = opacity * 0.3;
        ctx.fill();
        
        // 3. Bright Core
        ctx.beginPath();
        ctx.arc(p.x, p.y, (p.size * opacity) / 2, 0, Math.PI * 2);
        ctx.shadowBlur = 0;
        ctx.fillStyle = '#ffffff';
        ctx.globalAlpha = opacity * 0.4;
        ctx.fill();

        ctx.globalAlpha = 1;
        ctx.shadowBlur = 0;
      }

      requestAnimationFrame(animate);
    };

    const animationId = requestAnimationFrame(animate);

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ mixBlendMode: 'screen' }}
    />
  );
};
