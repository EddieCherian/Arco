'use client';

import { useEffect, useRef, useState } from 'react';

interface WaveformVisualizerProps {
  audioBlob: Blob;
}

export function WaveformVisualizer({ audioBlob }: WaveformVisualizerProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  useEffect(() => {
    drawWaveform();
  }, [audioBlob]);

  const drawWaveform = async () => {
    setIsDrawing(true);
    try {
      const arrayBuffer = await audioBlob.arrayBuffer();
      const audioContext = new AudioContext();
      const audioBuffer = await audioContext.decodeAudioData(arrayBuffer);
      const channelData = audioBuffer.getChannelData(0);
      
      const canvas = canvasRef.current;
      if (!canvas) return;
      
      const ctx = canvas.getContext('2d');
      if (!ctx) return;
      
      const width = canvas.width;
      const height = canvas.height;
      const step = Math.ceil(channelData.length / width);
      
      ctx.clearRect(0, 0, width, height);
      ctx.fillStyle = '#05080F';
      ctx.fillRect(0, 0, width, height);
      
      ctx.beginPath();
      ctx.strokeStyle = '#C9A84C';
      ctx.lineWidth = 2;
      
      let x = 0;
      for (let i = 0; i < channelData.length; i += step) {
        const slice = channelData.slice(i, i + step);
        const max = Math.max(...slice);
        const min = Math.min(...slice);
        const y1 = height / 2 - (max * height) / 2;
        const y2 = height / 2 - (min * height) / 2;
        
        ctx.moveTo(x, y1);
        ctx.lineTo(x, y2);
        ctx.stroke();
        
        x++;
        if (x >= width) break;
      }
    } catch (error) {
      console.error('Failed to draw waveform:', error);
    } finally {
      setIsDrawing(false);
    }
  };

  return (
    <div className="mt-4">
      <canvas
        ref={canvasRef}
        width={600}
        height={100}
        className="w-full h-24 rounded-lg bg-[#05080F]"
      />
      {isDrawing && (
        <div className="text-xs text-[#C9A84C] mt-2 animate-pulse">
          Visualizing waveform...
        </div>
      )}
    </div>
  );
}
