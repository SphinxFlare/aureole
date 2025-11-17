import { useEffect, useRef } from "react";

const CosmicBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let width = (canvas.width = window.innerWidth);
    let height = (canvas.height = window.innerHeight);

    // --- GLOW ORBS ---
    const orbs = Array.from({ length: 6 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      r: Math.random() * 120 + 80,
      dx: (Math.random() - 0.5) * 0.2,
      dy: (Math.random() - 0.5) * 0.2,
      color: Math.random() > 0.5
        ? "rgba(0, 200, 255, 0.18)" // cyan
        : "rgba(120, 60, 255, 0.15)", // purple
    }));

    // --- SOFT DUST PARTICLES ---
    const dust = Array.from({ length: 80 }, () => ({
      x: Math.random() * width,
      y: Math.random() * height,
      size: Math.random() * 2 + 0.5,
      speed: Math.random() * 0.3 + 0.1,
      opacity: Math.random() * 0.4 + 0.2,
      drift: (Math.random() - 0.5) * 0.3,
    }));

    let t = 0;

    const drawBase = () => {
      const gradient = ctx.createLinearGradient(0, 0, 0, height);
      gradient.addColorStop(0, "#030615");  // midnight blue
      gradient.addColorStop(1, "#05010D");  // deep space purple
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, width, height);
    };

    const drawFog = () => {
      const fogGradient = ctx.createRadialGradient(
        width * 0.6,
        height * 0.7,
        0,
        width * 0.6,
        height * 0.7,
        width * 0.9
      );

      fogGradient.addColorStop(0, "rgba(100, 50, 255, 0.15)");
      fogGradient.addColorStop(1, "rgba(80, 20, 140, 0)");

      ctx.globalAlpha = 0.7;
      ctx.fillStyle = fogGradient;

      ctx.save();
      ctx.translate(0, Math.sin(t * 0.0004) * 30); // slow vertical drift
      ctx.fillRect(0, 0, width, height);
      ctx.restore();

      ctx.globalAlpha = 1;
    };

    const drawOrbs = () => {
      orbs.forEach((o) => {
        const radial = ctx.createRadialGradient(o.x, o.y, 0, o.x, o.y, o.r);
        radial.addColorStop(0, o.color);
        radial.addColorStop(1, "rgba(0,0,0,0)");

        ctx.fillStyle = radial;
        ctx.beginPath();
        ctx.arc(o.x, o.y, o.r, 0, Math.PI * 2);
        ctx.fill();

        o.x += o.dx;
        o.y += o.dy;

        if (o.x - o.r > width) o.x = -o.r;
        if (o.x + o.r < 0) o.x = width + o.r;
        if (o.y - o.r > height) o.y = -o.r;
        if (o.y + o.r < 0) o.y = height + o.r;
      });
    };

    const drawDust = () => {
      dust.forEach((p) => {
        p.y -= p.speed;
        p.x += p.drift;

        if (p.y < -10) p.y = height + 10;
        if (p.x > width + 10) p.x = -10;
        if (p.x < -10) p.x = width + 10;

        ctx.fillStyle = `rgba(160, 220, 255, ${p.opacity})`;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      });
    };

    const animate = () => {
      drawBase();
      drawFog();
      drawOrbs();
      drawDust();

      t += 1;
      requestAnimationFrame(animate);
    };

    animate();

    const handleResize = () => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 w-full h-full pointer-events-none"
      style={{
        zIndex: -10,
      }}
    />
  );
};

export default CosmicBackground;