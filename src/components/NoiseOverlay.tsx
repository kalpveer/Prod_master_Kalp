/* eslint-disable */
import { useEffect, useState } from 'react';

export default function NoiseOverlay() {
  const [noiseUrl, setNoiseUrl] = useState('');

  useEffect(() => {
    // Generate a static noise texture using a hidden canvas once on mount.
    // This is vastly faster on GPUs/CPUs than an SVG filter with <feTurbulence>.
    const generateNoise = () => {
      const canvas = document.createElement('canvas');
      canvas.width = 128;
      canvas.height = 128;
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const imgData = ctx.createImageData(128, 128);
      const data = imgData.data;

      // Fill with monochrome noise
      for (let i = 0; i < data.length; i += 4) {
        const val = Math.floor(Math.random() * 255);
        data[i] = val;     // R
        data[i + 1] = val; // G
        data[i + 2] = val; // B
        data[i + 3] = 20;  // Alpha (very subtle)
      }
      
      ctx.putImageData(imgData, 0, 0);
      setNoiseUrl(canvas.toDataURL('image/png'));
    };

    generateNoise();
  }, []);

  return (
    <div 
      className="pointer-events-none fixed inset-0 z-50"
      style={{ 
        backgroundImage: noiseUrl ? `url(${noiseUrl})` : 'none',
        backgroundRepeat: 'repeat',
        opacity: 0.035,
        willChange: 'auto',
      }}
    />
  );
}
