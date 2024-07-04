import React, { useRef, useEffect } from 'react';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  colorIndex: number; // Change from string to number
}

interface AnnotatedImageProps {
  imageUrl: string;
  boundingBoxes: BoundingBox[];
}

const getColorFromIndex = (index: number): string => {
  const colors = ['red', 'yellow', 'green', 'blue', 'purple'];
  console.log("index: "+index);
  console.log("index color: "+colors[index % colors.length]);
  return colors[index % colors.length];
};

const AnnotatedImage: React.FC<AnnotatedImageProps> = ({ imageUrl, boundingBoxes }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const context = canvas?.getContext('2d');
    const image = imageRef.current;

    if (canvas && context && image) {
      image.onload = () => {
        // Resize canvas to match the image dimensions
        canvas.width = image.width;
        canvas.height = image.height;

        // Clear the canvas before drawing
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw the image on the canvas
        context.drawImage(image, 0, 0, image.width, image.height);

        // Log bounding boxes
        console.log('Bounding Boxes:', boundingBoxes);

        // Draw bounding boxes and labels
        boundingBoxes.forEach(box => {
          const color = getColorFromIndex(box.colorIndex);
          context.strokeStyle = color; // Set stroke color
          context.lineWidth = 2;
          context.strokeRect(box.x, box.y, box.width, box.height);

          context.fillStyle = color; // Set text color
          context.font = '16px Arial';
          context.fillText(box.label, box.x, box.y - 5);
        });
      };

      // Trigger image load
      image.src = imageUrl;
      console.log('Image URL:', imageUrl);
    }
  }, [imageUrl, boundingBoxes]);

  return (
    <div>
      <img ref={imageRef} src={imageUrl} alt="Annotated" style={{ display: 'none' }} />
      <canvas ref={canvasRef}></canvas>
    </div>
  );
};

export default AnnotatedImage;
