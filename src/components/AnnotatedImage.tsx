import React, { useRef, useEffect, useState } from 'react';
import type { Schema } from "../../amplify/data/resource";
import AttributePopup from './AttributePopup';

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  id: number;
  annotation: Schema["Annotation"]["type"];
}

interface AnnotatedImageProps {
  imageUrl: string;
  boundingBoxes: BoundingBox[];
}

const getColorFromId = (id: number): string => {
  const colors = ['red', 'yellow', 'green', 'blue', 'orange'];
  return colors[id % colors.length];
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
        canvas.width = image.width;
        canvas.height = image.height;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.drawImage(image, 0, 0, image.width, image.height);

        boundingBoxes.forEach(box => {
          const color = getColorFromId(box.id);
          context.strokeStyle = color;
          context.lineWidth = 2;
          context.fillStyle = color;
          context.font = '16px Arial';

          if (box.annotation.rotation) {
            context.save();
            context.translate(box.x + box.width / 2, box.y + box.height / 2);
            context.rotate((box.annotation.rotation * Math.PI) / 180);
            context.translate(-(box.x + box.width / 2), -(box.y + box.height / 2));
          }

          context.strokeRect(box.x, box.y, box.width, box.height);
          context.fillText(box.id.toString(), box.x, box.y - 5);

          if (box.annotation.rotation) {
            context.restore();
          }
        });

        canvas.addEventListener('click', handleCanvasClick);
      };

      image.src = imageUrl;
    }

    return () => {
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
      if (x >= box.x && x <= box.x + box.width && y >= box.y && y <= box.y + box.height) {
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
