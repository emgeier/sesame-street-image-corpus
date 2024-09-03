import React, { useEffect, useState } from 'react';
import { uploadData, getUrl } from 'aws-amplify/storage';


const Admin: React.FC = () => {
  //Individual image file upload
  const [file, setFile] = useState<File | null>(null);
  //Folder upload
  const [files, setFiles] = useState<FileList | null>(null);
  //Visualize image selected for upload
  const [url, setUrl] = useState<string | undefined>("");
  //Selected folder
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  //Messaging
  const [message, setMessage] = useState<string | undefined>("");

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute("webkitdirectory", "true");
    }
  }, []);

  useEffect(() => {
    if (files) {
      handleUpload(); // Trigger upload when files are selected, no upload button needed, as it is on popup
    }
  }, [files]); // Run this effect when `files` changes

  //See the image selected for upload

  const seeFile = async () => {
    if (!file) {
      console.error("no file selected");
      return;
    }
    try {
      const result = await getUrl({
        path: `dev/${file.name}`
      });
      console.log(result);
      setUrl(result.url.href);
    } catch (error) {
      console.log(error);
    }
  };
  //When folder is selected, reset messaging and set files
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setMessage("");
    const selectedFiles = event.target.files;
    setFiles(selectedFiles);
    console.log("files:", selectedFiles);
  };

  const handleSingleFileUpload = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    try {
      console.log(file.name);
      await uploadData({
        path: `dev/${file.name}`,
        data: file,
      });
      console.log(`File ${file.name} uploaded successfully`);
      setMessage("File uploaded successfully");
      hideMessageAfterDelay(); // Auto-hide the message after delay
    } catch (error) {
      console.error("Error uploading file:", error);
      setMessage("Error uploading file.");
    }
  };

  const sleep = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));
  //Folder upload, upload in batches to circumvent API rate limits
  const handleUpload = async () => {
    if (!files) {
      console.error("No files selected");
      return;
    }

    const BATCH_SIZE = 5; // Number of files to upload at a time
    const DELAY = 1000; // Delay in milliseconds between batches

    try {
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = Array.from(files).slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async file => {
          const filePath = `input/${file.webkitRelativePath}`;
          console.log(`Uploading file: ${file.name} to path: ${filePath}`);
          await uploadData({
            path: filePath,
            data: file,
          });
          console.log(`File ${file.name} uploaded successfully`);
        }));

        // Add delay between batches to prevent rate limiting
        if (i + BATCH_SIZE < files.length) {
          await sleep(DELAY);
        }
      }
      setMessage("Folder uploaded successfully");
      hideMessageAfterDelay(); // Auto-hide the message after 5 seconds
    } catch (error) {
      console.error("Error uploading folder:", error);
      setMessage("Error uploading folder.");
    }
  };

  const hideMessageAfterDelay = () => {
    setTimeout(() => {
      setMessage(undefined); // Clear the message after 5 seconds
    }, 5000);
  };
  // const components = {
  //   Header: CustomHeader,
  // };

  return (
  
    <div className="main-content">
      <h3>Upload Folder</h3>
      <input
        type="file"
        onChange={handleChange}
        multiple
        ref={inputRef}
        style={{ display: 'none' }}
      />
      <button onClick={() => inputRef.current?.click()}>
        Select Folder
      </button>
      <div className="separator" />
      <div>{message && <p>{message}</p>}</div>
      <div className="separator" />
      <h3>Upload Individual Image File</h3>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
      />
      <button onClick={handleSingleFileUpload} disabled={!file}>
        Upload Single File
      </button>
      <div className="separator" />
      <button onClick={seeFile} disabled={!file}>
        View File Contents
      </button>
      {url && <img src={url} alt="Uploaded file" style={{ maxWidth: '100%', height: 'auto' }} />}
    </div>

  );
};

export default Admin;
