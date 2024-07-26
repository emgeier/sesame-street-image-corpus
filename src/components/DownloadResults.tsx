import React from "react";
import JSZip from "jszip";
import Papa from "papaparse";
import { saveAs } from "file-saver";

interface DownloadResultsProps {
  annotations: Array<{ [key: string]: any }>;
}

const DownloadResults: React.FC<DownloadResultsProps> = ({ annotations }) => {

  const downloadCSV = () => {
    const csv = Papa.unparse(annotations);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    saveAs(blob, "annotations.csv");
  };

  const downloadAll = async () => {
    const zip = new JSZip();
    const folder = zip.folder("images");

    for (const annotation of annotations) {
      if (annotation.imageUrl && folder) {
        const response = await fetch(annotation.imageUrl);
        const blob = await response.blob();
        folder.file(`${annotation.image_id}`, blob);
      }
    }

    const csv = Papa.unparse(annotations);
    zip.file("annotations.csv", csv);

    zip.generateAsync({ type: "blob" }).then((content) => {
      saveAs(content, "annotations_and_images.zip");
    });
  };

  return (
    <div>
      <button onClick={downloadCSV}>Download Data as CSV </button>
      <button onClick={downloadAll}>Download CSV and Images</button>
    </div>
  );
};

export default DownloadResults;

