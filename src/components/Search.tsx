import React, { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";
import { getUrl } from 'aws-amplify/storage';

const Search: React.FC = () => {
  const client = generateClient<Schema>();
  const [annotations, setAnnotations] = useState<Array<Schema["Annotation"]["type"] & { imageUrl?: string }>>([]);
  const [category, setCategory] = useState<string>("");

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

  useEffect(() => {
    const fetchAnnotations = async () => {
      setAnnotations([]); // Clear current annotations before fetching new results
      if (category) {
        try {
          const result: any = await client.models.Annotation.list({
            filter: { category: { eq: category } },
            limit: 5
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
      } else {
        // Fetch all annotations if no category is selected
        try {
          const subscription = client.models.Annotation.observeQuery().subscribe({
            next: async (data) => {
              const annotationsWithUrls = await Promise.all(data.items.map(async (annotation: any) => {
                const imageUrl = await fetchImageUrl(annotation.image_id);
                return { ...annotation, imageUrl };
              }));
              setAnnotations(annotationsWithUrls);
            },
            error: (error) => console.error("Failed to fetch annotations:", error)
          });
          return () => subscription.unsubscribe();
        } catch (error) {
          console.error("Failed to fetch annotations:", error);
        }
      }
    };

    fetchAnnotations();
  }, [category]);

  const handleCategoryChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    setCategory(event.target.value);
  };

  return (
    <main>
      <div className='separator'></div>
      <h2>Search Annotations by Category</h2>
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
      <ul>
        {annotations.map((annotation) => (
          <li key={`${annotation.image_id}-${annotation.annotation_id}`}>
            <strong>Category:</strong> {annotation.category}<br />
            <strong>Image Id:</strong> {annotation.image_id}<br />
            {annotation.imageUrl && <img src={annotation.imageUrl} alt="Annotation Image" style={{ maxWidth: '200px', height: 'auto' }} />}
          </li>
        ))}
      </ul>
    </main>
  );
};

export default Search;
