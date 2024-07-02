import { useEffect, useState } from "react";
import type { Schema } from "../amplify/data/resource";
import { generateClient } from "aws-amplify/data";

const client = generateClient<Schema>();

function App() {
  const [annotations, setAnnotations] = useState<Array<Schema["Annotation"]["type"]>>([]);

  useEffect(() => {
    client.models.Annotation.observeQuery().subscribe({
      next: (data) => setAnnotations([...data.items]),
    });
  }, []);

  // This image id and annotation id need to be pulled and created (annotatations.length())
  function createAnnotation() {
    client.models.Annotation.create({ image_id: "003.png", annotation_id: 0, attributes : window.prompt("attributes content") });
  }   

  return (
    <main>
      <h1>Annotations</h1>
      <button onClick={createAnnotation}>+ new</button>
      <ul>
        {annotations.map((annotation) => (
          <li key={annotation.annotation_id}>{annotation.content}</li>
        ))}
      </ul>
      <div>
        🥳 App successfully hosted. Try creating a new annotation.
        <br />
        <a href="https://docs.amplify.aws/react/start/quickstart/#make-frontend-updates">
          Review next step of this tutorial.
        </a>
      </div>
    </main>
  );
}

export default App;
