import JSZip from "jszip";
import { saveAs } from "file-saver"; // Also install file-saver

const handleDownloadAll = async () => {
  const zip = new JSZip();

  for (const annotation of uniqueAnnotations) {
    if (annotation.imageUrl) {
      try {
        // Fetch the image as a blob and add it to the zip
        const response = await fetch(annotation.imageUrl);
        const blob = await response.blob();
        zip.file(`${annotation.image_id}.png`, blob);
      } catch (error) {
        console.error(`Failed to fetch image for ${annotation.image_id}`, error);
      }
    }
  }

  // Generate the ZIP file and trigger download
  zip.generateAsync({ type: "blob" }).then((content) => {
    saveAs(content, "images.zip"); // Save the ZIP file with a specified name
  });
};
