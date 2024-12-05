import React, {useState} from "react";
import JSZip from "jszip";
import Papa from "papaparse";
import { saveAs } from "file-saver";

interface DownloadResultsProps {
  annotations: Array<{ [key: string]: any }>;
}

const DownloadResults: React.FC<DownloadResultsProps> = ({ annotations }) => {

  const [message, setMessage] = useState("");
  const downloadCSV = () => {
    setMessage("Preparing CSV download...");

    const csv = Papa.unparse(annotations);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "annotations.csv");

    setMessage("CSV download prepared.");
    setTimeout(() => setMessage(""), 2000); // Clear message after 2 seconds    
  };

  const downloadAll = async () => {
    setMessage("Preparing download...");

    const zip = new JSZip();
    const folder = zip.folder("images");

    for (const annotation of annotations) {
      if (annotation.imageUrl && folder) {
        const response = await fetch(annotation.imageUrl, {mode: 'cors', cache: 'no-cache'});
        const blob = await response.blob();
        folder.file(`${annotation.image_id}`, blob);
      }
    }

    const csv = Papa.unparse(annotations);
    zip.file("annotations.csv", csv);

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "annotations_and_images.zip");
    });

    setMessage("Download prepared.");
    setTimeout(() => setMessage(""), 2000); // Clear message after 2 seconds    
  };

  return (
    <div>
      <button onClick={downloadCSV}>Download CSV </button>
      <button onClick={downloadAll}>Download CSV and Images</button>
      {message && <p>{message}</p>}
    </div>
  );
};

export default DownloadResults;

