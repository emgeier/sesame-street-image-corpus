import React, { useState, useRef } from 'react';

interface BoxSearchProps {
  onSearch: (rectangle: { x: number, y: number, width: number, height: number }) => void;
}

const BoxSearch: React.FC<BoxSearchProps> = ({ onSearch }) => {
  const [isDrawing, setIsDrawing] = useState(false);
  const [startX, setStartX] = useState(0);
  const [startY, setStartY] = useState(0);
  const [currentX, setCurrentX] = useState(0);
  const [currentY, setCurrentY] = useState(0);
  const [rectangle, setRectangle] = useState<{ x: number, y: number, width: number, height: number } | null>(null);
  const boxRef = useRef<HTMLDivElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDrawing(true);
    setStartX(e.nativeEvent.offsetX);
    setStartY(e.nativeEvent.offsetY);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing) return;
    setCurrentX(e.nativeEvent.offsetX);
    setCurrentY(e.nativeEvent.offsetY);
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
    const width = Math.abs(currentX - startX);
    const height = Math.abs(currentY - startY);
    const x = Math.min(startX, currentX);
    const y = Math.min(startY, currentY);

    const newRectangle = { x, y, width, height };
    setRectangle(newRectangle);
    onSearch(newRectangle); // Pass the rectangle dimensions to the parent component
  };

  return (
    <div
      ref={boxRef}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      style={{
        width: '500px',
        height: '500px',
        backgroundColor: 'black',
        position: 'relative'
      }}
    >
        <h4>Find Annotations by Location in Image</h4>
      {rectangle && (
          <div
            style={{
              position: 'absolute',
              left: `${rectangle.x}px`,
              top: `${rectangle.y}px`,
              width: `${rectangle.width}px`,
              height: `${rectangle.height}px`,
              border: '2px solid red'
            }}
          ></div>
        )}
      {isDrawing && (
        <div
          style={{
            position: 'absolute',
            left: `${Math.min(startX, currentX)}px`,
            top: `${Math.min(startY, currentY)}px`,
            width: `${Math.abs(currentX - startX)}px`,
            height: `${Math.abs(currentY - startY)}px`,
            border: '2px solid red'
          }}
        ></div>
      )}
    </div>
  );
};

export default BoxSearch;

