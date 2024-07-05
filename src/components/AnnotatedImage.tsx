import React, { useRef, useEffect, useState } from 'react';
import type { Schema } from "../../amplify/data/resource";
import AttributePopup from './AttributePopup';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  colorIndex: number; // Change from string to number
  annotation: Schema["Annotation"]["type"];

}

interface AnnotatedImageProps {
  imageUrl: string;
  boundingBoxes: BoundingBox[];
}

const getColorFromIndex = (index: number): string => {
  const colors = ['red', 'yellow', 'green', 'blue', 'purple'];
  console.log("index color: " + colors[index % colors.length]);
  return colors[index % colors.length];
};

const AnnotatedImage: React.FC<AnnotatedImageProps> = ({ imageUrl, boundingBoxes }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const [selectedAnnotation, setSelectedAnnotation] = useState<Schema["Annotation"]["type"] | null>(null);

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
        canvas.addEventListener('click', handleCanvasClick);
      };

      // Trigger image load
      image.src = imageUrl;
      console.log('Image URL:', imageUrl);
    }
    return () => {
        // Cleanup event listener
        if (canvas) {
          canvas.removeEventListener('click', handleCanvasClick);
        }
    };
  }, [imageUrl, boundingBoxes]);


  const handleCanvasClick = (event: { clientX: number; clientY: number; }) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const x = event.clientX - rect.left;
    const y = event.clientY - rect.top;

    boundingBoxes.forEach(box => {
      if (x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height ) {
        setSelectedAnnotation(box.annotation);
      }
    });
  };

  return (
    <div>
      <img ref={imageRef} src={imageUrl} alt="Annotated" style={{ display: 'none' }} />
      <canvas ref={canvasRef} onClick={handleCanvasClick}></canvas>
      {selectedAnnotation && (
        <AttributePopup annotation={selectedAnnotation} onClose={() => setSelectedAnnotation(null)} />
      )}
    </div>
  );
};

export default AnnotatedImage;
