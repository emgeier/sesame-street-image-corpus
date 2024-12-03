import { useEffect, useState } from "react";
import { getUrl } from "aws-amplify/storage";
import type { Schema } from "../../amplify/data/resource";
import DownloadResults from "./DownloadResults";

// For future code consolidation
interface FetchImageUrlsProps {
    annotations: Array<Schema["Annotation"]["type"]>;
  }

export const FetchImageUrls: React.FC<FetchImageUrlsProps> = ({ annotations }) => {
  const [annotationsWithUrls, setAnnotationsWithUrls] = useState<Array<Schema["Annotation"]["type"] & { imageUrl?: string }>>([]);

  useEffect(() => {
    const fetchUrls = async () => {
      // Filter annotations to get only unique image IDs
      const uniqueAnnotations = Array.from(
        new Map(annotations.map(annotation => [annotation.image_id, annotation])).values()
      );

      const updatedAnnotations = await Promise.all(
        uniqueAnnotations.map(async (annotation) => {
          try {
            const result = await getUrl({ path: `images/${annotation.image_id}` });
            // const imageUrlDated = `${result.url.href}?t=${new Date().getTime()}`;
            return { ...annotation, imageUrl: result.url.href };
          } catch (error) {
            console.error(`Failed to fetch URL for image ID: ${annotation.image_id}`, error);
            return { ...annotation, imageUrl: "" };
          }
        })
      );
      setAnnotationsWithUrls(updatedAnnotations);
    };

    fetchUrls();
  }, [annotations]);

  return <DownloadResults annotations={annotationsWithUrls} />;
};

