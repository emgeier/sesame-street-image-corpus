import React, { useEffect, useState } from "react";
import type { Schema } from "../../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

function Search() {
  const client = generateClient<Schema>();
  const [annotations, setAnnotations] = useState<Array<Schema["Annotation"]["type"]>>([]);
  const [category, setCategory] = useState<string>("");

  useEffect(() => {
    const fetchAnnotations = async () => {
      setAnnotations([]); 
      if (category) {
        try {
          const result: any = await client.models.Annotation.list({ filter: { category: { eq: category } } });
          console.log(result.data);
          console.log(result.data[0]);
          setAnnotations(result.data);
        } catch (error) {
          console.error("Failed to fetch annotations:", error);
        }
      } else {
        // Fetch all annotations if no category is selected "all" in menu
        try {
          const subscription = client.models.Annotation.observeQuery().subscribe({
            next: (data) => setAnnotations([...data.items])
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
        </li>
        ))}
      </ul>
    </main>
  );
};

export default Search;
