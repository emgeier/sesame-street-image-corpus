import React, { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { getUrl } from "aws-amplify/storage";
import { Authenticator, ToggleButton } from "@aws-amplify/ui-react";
import CustomHeader from "./CustomMessaging";
import AnnotationDataViewer from "./AnnotationDataViewer";

import JSZip from "jszip";
import { saveAs } from "file-saver"; 

const ImageSearch: React.FC = () => {
  const client = generateClient<Schema>();
  const [uniqueAnnotations, setUniqueAnnotations] = useState<Array<Schema["Annotation"]["type"] & { imageUrl?: string }>>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [viewDataSelected, selectViewData] = useState<boolean>(false);
  const [imageUrls, setImageUrls] = useState<string[]>([]);

  const components = {
    Header: CustomHeader,
  };

  // Function to fetch a pre-signed URL for each image
  const fetchImageUrl = async (imageId: string): Promise<string | undefined> => {
    try {
      const result = await getUrl({ path: `images/${imageId}` });
      return result.url.href;
    } catch (error) {
      console.error(`Failed to fetch URL for image ID: ${imageId}`, error);
      return undefined;
    }
  };

  // Function to fetch annotations and filter for unique images
  const fetchUniqueAnnotations = async (token: string | null = null) => {
    setLoading(true);

    try {
      const result: any = await client.models.Annotation.list({
        limit: 40000,
        nextToken: token,
      });

      // Use a Map to store unique image IDs and their corresponding annotations
      const uniqueAnnotationsMap = new Map<string, Schema["Annotation"]["type"] & { imageUrl?: string }>();

      for (const annotation of result.data) {
        if (!uniqueAnnotationsMap.has(annotation.image_id)) {
          const imageUrl = await fetchImageUrl(annotation.image_id);
          uniqueAnnotationsMap.set(annotation.image_id, { ...annotation, imageUrl });
        }
      }

      // Convert Map values to an array to set as state
      setUniqueAnnotations(Array.from(uniqueAnnotationsMap.values()));
    } catch (error) {
      console.error("Failed to fetch unique annotations:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchUniqueAnnotations();
  }, []);

 // Helper function to add a delay

// Function to download all unique images with a slight delay
const handleDownloadAll = async () => {
  for (const annotation of uniqueAnnotations) {
    if (annotation.imageUrl) {
      const a = document.createElement("a");
      a.href = annotation.imageUrl;
      a.download = `${annotation.image_id}`;  // Suggested filename
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  }
};

  

  
//   const handleDownloadAll = async () => {
//     const zip = new JSZip();
//     const folder = zip.folder("images");
  
//     if (!folder) {
//       console.error("Failed to create folder in ZIP file.");
//       return;
//     }
  
//     await Promise.all(
//       uniqueAnnotations.map(async (annotation, index) => {
//         if (annotation.imageUrl) {
//           try {
//             const response = await fetch(annotation.imageUrl);
//             const blob = await response.blob();
//             folder.file(`image_${index + 1}.jpg`, blob); // Name each file uniquely
//           } catch (error) {
//             console.error(`Failed to fetch image at ${annotation.imageUrl}`, error);
//           }
//         }
//       })
//     );
  
//     // Generate the zip file and trigger download
//     zip.generateAsync({ type: "blob" })
//       .then((content) => {
//         saveAs(content, "images.zip");
//       })
//       .catch((err) => console.error("Error creating zip file:", err));
//   };
  
  
  
  

  return (
    <Authenticator hideSignUp className="authenticator-popup" components={components}>
      {() => (
        <div>
          <main className="main-content">
            <h1 className="intro">Image Search</h1>
            {loading ? (
              <p>Loading...</p>
            ) : (
              <div>
                <p>Unique search results:</p>
                <div className="annotation-grid-container">
                  <ul className="annotation-grid">
                    {uniqueAnnotations.map((annotation) => (
                      <li key={annotation.image_id} className="annotation-item">
                        {annotation.imageUrl && (
                          <img src={annotation.imageUrl} alt="Image" style={{ maxWidth: "200px", height: "auto" }} />
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
                <button onClick={handleDownloadAll}>Download All Unique Images</button>
              </div>
            )}
            <ToggleButton onClick={() => selectViewData(!viewDataSelected)}>View Data Table</ToggleButton>
            {viewDataSelected && <AnnotationDataViewer annotations={uniqueAnnotations} />}
          </main>
        </div>
      )}
    </Authenticator>
  );
};

export default ImageSearch;
