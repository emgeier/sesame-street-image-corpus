import React, { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { getUrl } from 'aws-amplify/storage';
import AnnotatedImage from "./AnnotatedImage";
import { Authenticator} from "@aws-amplify/ui-react";
import CustomHeader from './CustomMessaging';
import AnnotationDataViewerToggle from "./AnnotationDataViewerToggle";
import { FetchImageUrls } from "./FetchImageUrls";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  id: number;
  annotation: Schema["Annotation"]["type"];
}

const ImageSearch: React.FC = () => {
  const client = generateClient<Schema>();
  const [annotations, setAnnotations] = useState<Array<Schema["Annotation"]["type"] & { imageUrl?: string }>>([]);
  //annotation download function
  const [downloadAnnotations, setDownloadAnnotations] = useState<Array<Schema["Annotation"]["type"] >>([]);
  const [groupedAnnotations, setGroupedAnnotations] = useState<{ [key: string]: Array<Schema["Annotation"]["type"] & { imageUrl?: string }> }>({});
  //search terms
  const [category, setCategory] = useState<string>("");
  const [keywords, setKeywords] = useState<string>(""); 

  //selecting image for close up view of bounding boxes and annotations
  const [selectedImage, setSelectedImage] = useState<Schema["Image"]["type"]>();
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);
  // search counts
  const [annotationCount, setAnnotationCount] = useState(0); 
  const [imageCount, setImageCount] = useState(0);


  const fetchImageUrl = async (imageId: string): Promise<string | undefined> => {
    try {
      const result = await getUrl({ path: `images/${imageId}` });  
      return result.url.href;
    } catch (error) {
      console.error(`Failed to fetch URL for image ID: ${imageId}`, error);
      return undefined;
    }
  };

  // Function to fetch annotation data from DynamoDB based on search criteria
  const fetchAnnotations = async (token: string | null = null) => {

    const filter: any = {
      and: []
    };

    if (category) {
      filter.and.push({ category: { eq: category } });
    }
    if (keywords.length > 0) {
        const keywordsArray = keywords.split(" ").filter((word) => word.trim().length > 0);
        keywordsArray.forEach((keyword) => {
          filter.and.push({ keywords: { contains: keyword } });
        });
      }
      
    // Remove the 'and' key if it's empty to avoid unnecessary empty filter
    if (filter.and.length === 0) {
      delete filter.and;
    }

    try {
      const result: any = await client.models.Annotation.list({
        filter: Object.keys(filter).length ? filter : undefined,
        limit: 40000,
        nextToken: token,
      });

      setDownloadAnnotations(result.data);

      // Fetch image URLs for each annotation
      const annotationsWithUrls = await Promise.all(result.data.map(async (annotation: any) => {
        const imageUrl = await fetchImageUrl(annotation.image_id);
        return { ...annotation, imageUrl };
      }));

      setAnnotations(annotationsWithUrls);
      
      setAnnotationCount(annotationsWithUrls.length); // Total annotations

      // Group annotations by image ID
      const grouped = annotationsWithUrls.reduce((acc, annotation) => {
        if (!acc[annotation.image_id]) {
          acc[annotation.image_id] = [];
        }
        acc[annotation.image_id].push(annotation);
        return acc;
      }, {} as { [key: string]: Array<Schema["Annotation"]["type"] & { imageUrl?: string }> });

      setGroupedAnnotations(grouped);
      setImageCount(Object.keys(grouped).length);

    } catch (error) {
      console.error("Failed to fetch annotations:", error);
    }
  };

  useEffect(() => {
    setAnnotations([]); // Clear previous annotations
    fetchAnnotations();
  }, [category, keywords]);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(event.target.value);
  };

  const handleKeywordChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setKeywords(event.target.value);
    setAnnotations([]); // Clear previous annotations
    setGroupedAnnotations({}); // Clear grouped annotations
    setSelectedImage(undefined); // Clear selected image
    setSelectedImageUrl(""); // Clear the image URL
    setBoundingBoxes([]); // Clear bounding boxes
  };
  const handleImageClick = (imageId: string) => {
    setSelectedImage(undefined);
    const selectedAnnotations = groupedAnnotations[imageId];
    if (!selectedAnnotations || selectedAnnotations.length === 0) return;

    setSelectedImageUrl(selectedAnnotations[0].imageUrl || "");
  
    const allBoundingBoxes: BoundingBox[] = selectedAnnotations.map((annotation) => {
      const polygon = typeof annotation.polygon === 'string' ? JSON.parse(annotation.polygon) : annotation.polygon;
      if (!Array.isArray(polygon) || polygon.length < 4) return null;

      const [x, y, width, height] = polygon;
      return {
        x: x,
        y: y,
        width: width - x, // Convert coordinates to width
        height: height - y, // Convert coordinates to height
        id: annotation.annotation_id,
        annotation: annotation,
      } as BoundingBox;
    }).filter(Boolean) as BoundingBox[];

    setBoundingBoxes(allBoundingBoxes);
    fetchImageInfo(imageId);
  };
  const fetchImageInfo = async (imageId: string) => {
    
    const episode_number = imageId.split("-")[1].split("_")[0].substring(1);
   
    const image_number = imageId.split("-")[1].split("_")[1].split(".")[0];
   

    try {
      const result: any = await client.models.Image.get({
        episode_id: episode_number, image_id: image_number}
      )
      
      if(result.data){setSelectedImage(result.data);}
    } catch (error) {
      console.error("Failed to fetch annotations:", error);
    }
  }
  const clearSearch = () => {
    setCategory("");
    setKeywords(""); // Reset keywords to an empty string
    setSelectedImage(undefined); // Reset selected image
    setSelectedImageUrl("");
    fetchAnnotations(); // Trigger a search with no filters
  };

  return (
    <Authenticator hideSignUp components={{ Header: CustomHeader }}>
      {() => (
        <div>
          <main className="main-content">
            <br/>            <br/>
            <br/>
            <br/>

          <h1 className="intro">Image Search</h1>
            <div className="search-controls">
              <div className="search-control">
                <label htmlFor="category">Category: </label>
                <select id="category" value={category} onChange={handleCategoryChange}>
                  <option value="">All</option>
                  <option value="FACE">Face</option>
                  <option value="PLACE">Place</option>
                  <option value="NUMBER">Number</option>
                  <option value="WORD">Word</option>
                </select>
              </div>
              <div className="search-control">
                <label htmlFor="keywords">Keywords: </label>
                <input
                  type="text"
                  id="keywords"
                  placeholder="puppet forward full-view"
                  value={keywords} // Join keywords array into a single string
                  onChange={handleKeywordChange}
                />
                <br />
                <button onClick={clearSearch}>Clear</button>
              </div>
              <div className="tooltip">
                    <span>ℹ️</span>
                    <div className="tooltiptext">Keywords: human, puppet, animal, infant, child, teen, adult, elderly, Asian, American Indian/Alaska Native, Black/African American, Native Hawaiian/Other Pacific Islander, white, occluded, truncated, oblique, cardinal, close-up, single, multiple, skyline, domicile, business, attraction, institution, single-letter, word, nonword, pronounceable, full-view, single-digit, multi-digit, uppercase, lowercase, house, row-house, apartment, castle,  clear, blurry, full-view, front-face, side-profile, forward, downward, upward, proper noun, real or caricature.</div>
                </div>
            </div>

                <div><p>For a list of keywords, see the tooltip. For a full explanation of the terms used in the SSA see the <a href="/Guide" target="_blank" rel="noopener noreferrer">Guide</a>.</p></div>
                <p>Click image for annotation details.</p>
            <div className="annotation-grid-container-x">
              <ul className="annotation-grid-x">
                {Object.keys(groupedAnnotations).map((imageId) => (
                  <li
                    className="annotation-item-x"
                    key={imageId}
                    onClick={() => handleImageClick(imageId)}
                  >
                    {groupedAnnotations[imageId][0].imageUrl && (
                      <img
                        src={groupedAnnotations[imageId][0].imageUrl}
                        alt="Image"
                        style={{ maxWidth: "230px", height: "auto" }}
                        loading="lazy"
                      />
                    )}
                  </li>
                ))}
              </ul>
            </div>
            <div>{imageCount && <p>Matching Images: {imageCount} | Matching Annotations: {annotationCount}</p>}</div>
            <br/>
            {selectedImageUrl && (
          <div>
            {selectedImage && (
            <h3>{selectedImage?.episode_title} <br/>Season {selectedImage?.season}<br/> Episode {selectedImage?.episode_id}<br/> {selectedImage?.air_year}</h3>
            )}
            <AnnotatedImage imageUrl={selectedImageUrl} boundingBoxes={boundingBoxes} />
          </div>
        )}
            <AnnotationDataViewerToggle annotations={annotations}/>
            <FetchImageUrls annotations = {downloadAnnotations}></FetchImageUrls>
        <br/>
        <br/>
          </main>
        </div>
      )}
    </Authenticator>
  );
};

export default ImageSearch;
