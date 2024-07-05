import React, { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { getUrl } from 'aws-amplify/storage';
import AnnotatedImage from "./AnnotatedImage";

interface BoundingBox {
  x: number;
  y: number;
  width: number;
  height: number;
  label: string;
  colorIndex: number;
  annotation: Schema["Annotation"]["type"];
}

const Search: React.FC = () => {
  const client = generateClient<Schema>();
  const [annotations, setAnnotations] = useState<Array<Schema["Annotation"]["type"] & { imageUrl?: string }>>([]);
  const [category, setCategory] = useState<string>("");
  const [keyword, setKeyword] = useState<string>("");
  const itemsPerPage = 12; // Items to display per page 
  const [currentPageIndex, setCurrentPageIndex] = useState(0); // Start at the first item
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedImageUrl, setSelectedImageUrl] = useState<string>("");
  const [boundingBoxes, setBoundingBoxes] = useState<BoundingBox[]>([]);

  // Function to fetch URL for each image ID
  const fetchImageUrl = async (imageId: string): Promise<string | undefined> => {
    try {
      const result = await getUrl({ path: `dev/${imageId}` });
      return result.url.href;
    } catch (error) {
      console.error(`Failed to fetch URL for image ID: ${imageId}`, error);
      return undefined;
    }
  };

  // Function to fetch annotation data from DynamoDB based on search criteria
  const fetchAnnotations = async (token: string | null = null) => {
    setLoading(true); // Set loading state
    
    const filter: any = {
      and: []
    };

    if (category) {
      filter.and.push({ category: { eq: category } });
    }
    if (keyword) {
      filter.and.push({ keywords: { contains: keyword } });
    }

    // Remove the 'and' key if it's empty to avoid unnecessary empty filter
    if (filter.and.length === 0) {
      delete filter.and;
    }

    try {
      const result: any = await client.models.Annotation.list({
        filter: Object.keys(filter).length ? filter : undefined,
        limit: 200,
        nextToken: token,
      });

      // Fetch image URLs for each annotation
      const annotationsWithUrls = await Promise.all(result.data.map(async (annotation: any) => {
        const imageUrl = await fetchImageUrl(annotation.image_id);
        return { ...annotation, imageUrl };
      }));

      setAnnotations(annotationsWithUrls);
    } catch (error) {
      console.error("Failed to fetch annotations:", error);
    }
    setLoading(false); // Reset loading state
  };

  useEffect(() => {
    setAnnotations([]); // Clear previous annotations
    fetchAnnotations();
  }, [category, keyword]);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(event.target.value);
    setCurrentPageIndex(0); // Reset to the first page
  };

  const handleKeywordChange = (event: string) => {
    setKeyword(event);
    setCurrentPageIndex(0); // Reset to the first page
    
  };

  const handleImageClick = (annotation: Schema["Annotation"]["type"] & { imageUrl?: string }) => {
    if (!annotation.imageUrl || !annotation.category || !annotation.polygon) return;
    setSelectedImageUrl(annotation.imageUrl);

    // Initialize an array to accumulate bounding boxes
    const allBoundingBoxes: BoundingBox[] = [];
    
    // Ensure that annotation.polygon is parsed correctly
    let polygon: number[];
    if (typeof annotation.polygon === 'string') {
      try {
        const parsed = JSON.parse(annotation.polygon);
        if (Array.isArray(parsed) && parsed.every(item => typeof item === 'number')) {
          polygon = parsed;
        } else {
          throw new Error("Parsed polygon is not an array of numbers");
        }
      } catch (error) {
        console.error("Failed to parse polygon:", error);
        return;
      }
    } else if (Array.isArray(annotation.polygon) && annotation.polygon.every(item => typeof item === 'number')) {
      polygon = annotation.polygon;
    } else {
      console.error("Polygon is not a valid array of numbers:", annotation.polygon);
      return;
    }

    if (Array.isArray(polygon) && polygon.length >= 4) {
      const [x, y, width, height] = polygon;
      const box: BoundingBox = {
        x: x,
        y: y,
        width: width - x, // Convert coordinates to width
        height: height - y, // Convert coordinates to height
        label: annotation.category,
        colorIndex: annotation.annotation_id, // Set the color for bounding boxes
        annotation: annotation,
      };
      allBoundingBoxes.push(box);
      console.log("box: " + JSON.stringify(box));
    } else {
      console.error("Polygon is not an array or does not have enough elements:", polygon);
    }

    setBoundingBoxes(allBoundingBoxes);
  };

  const handleNextPage = () => {
    if (currentPageIndex < Math.ceil(annotations.length / itemsPerPage) - 1) {
      setCurrentPageIndex(currentPageIndex + 1);
    }
  };

  const handlePreviousPage = () => {
    if (currentPageIndex > 0) {
      setCurrentPageIndex(currentPageIndex - 1);
    }
  };

  return (
    <div>
      <main className='main-content'>
        <h2>Search</h2>
        <div>
          <label htmlFor="category">Category: </label>
          <select id="category" value={category} onChange={handleCategoryChange}>
            <option value="">All</option>
            <option value="FACE">Face</option>
            <option value="PLACE">Place</option>
            <option value="NUMBER">Number</option>
            <option value="WORD">Word</option>
          </select>
        </div>
        <label htmlFor="attribute">Keyword: </label>
        <div className='input-container'>
          <input
            type="text"
            placeholder="puppet"
            onChange={(e) => handleKeywordChange(e.target.value)}
          />
            <div className="tooltip">
              <span>ℹ️</span>
              <div className="tooltiptext">
                Suggestions: human, puppet, occluded, full-view, multi-digit, child, adult, 18, real or caricature.
              </div>
            </div>
        </div>
        
        {loading ? (
          <p>Loading...</p>
        ) : (
          <ul className="annotation-grid">
            {annotations.slice(currentPageIndex * itemsPerPage, currentPageIndex * itemsPerPage + itemsPerPage).map((annotation) => (
              <ul className="annotation-item" key={`${annotation.image_id}-${annotation.annotation_id}`} onClick={() => handleImageClick(annotation)}>
                <strong>Category:</strong> {annotation.category ?? ""}<br />
                <strong>Image Id:</strong> {annotation.image_id}<br />
                {annotation.imageUrl && <img src={annotation.imageUrl} alt="Image" style={{ maxWidth: '180px', height: 'auto' }} />}
              </ul>
            ))}
          </ul>
        )}
        <div className="page-buttons">
          <button onClick={handlePreviousPage} disabled={currentPageIndex === 0 || loading}>Previous</button>
          <button onClick={handleNextPage} disabled={currentPageIndex * itemsPerPage + itemsPerPage >= annotations.length || loading}>Next</button>
        </div>
        {selectedImageUrl && (
          <div>
            <h4>Annotated Image</h4>
            <AnnotatedImage imageUrl={selectedImageUrl} boundingBoxes={boundingBoxes} />
          </div>
        )}
      </main>
      <a href="/advsearch"><h2>Advanced Search</h2></a>
    </div>
  );
};

export default Search;
