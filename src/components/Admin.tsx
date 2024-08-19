import React from 'react';
import { useState, useEffect } from 'react';
import { Authenticator } from '@aws-amplify/ui-react';

import { uploadData, getUrl } from 'aws-amplify/storage';

const Admin: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [files, setFiles] = React.useState<FileList | null>(null);
  const [uploadMessage, setUploadMessage] = useState<string | null>(null); // State to hold the upload message

  const [url, setUrl] = React.useState<string | undefined>("");
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  useEffect(() => {
    if (inputRef.current) {
      inputRef.current.setAttribute("webkitdirectory", "true");
    }
  }, []);

  const seeFile = async () => {
    if(!file) {
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

   }

   const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFiles = event.target.files;
    setFiles(selectedFiles);
  };
  const handleSingleFileUpload = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    try {
 
      if(file){

        console.log(file.name);
        await uploadData({
          path: `dev/${file.name}`,
          data: file,
        });
        console.log("File ${file.name} uploaded successfully");
        setUploadMessage("File ${file.name} uploaded successfully");

      }
    
      
    } catch (error) {
      console.error("Error uploading file:", error);
      setUploadMessage("Error uploading file.");
    }
  };

  const handleUpload = async () => {
    if (!files) {
      console.error("No files selected");
      setUploadMessage("No files selected");
      return;
    }

    try {
 
      if(files){
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const filePath = `input/${file.webkitRelativePath}`;
        console.log(`Uploading file: ${file.name} to path: ${filePath}`);
        await uploadData({
         //this will change in production, this is not recommended, as it may cause recurssion
          path: `input/${file.webkitRelativePath}`,
          data: file,
        });
        console.log("File ${file.name} uploaded successfully");
        setUploadMessage("All files uploaded successfully");
      }
    }
      
    } catch (error) {
      console.error("Error uploading files:", error);
      setUploadMessage("Error uploading files");

    }
  };
   
  return (
    <Authenticator hideSignUp className="authenticator-popup">
    {({  }) => (
    <div className='main-content'>
        <h3>Add data to the database</h3>
        
        <h3>Upload Episode Folder</h3>
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
      
     
      <button onClick={handleUpload} disabled={!files}>
        Upload
      </button>
      {uploadMessage && <p>{uploadMessage}</p>} {/* Display the upload message */}
      <div className='separator' />
      <div className='separator'/>
      <h3>Upload Individual Image File</h3>
      
      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
      />
      <button onClick={handleSingleFileUpload} disabled={!file}>
        Upload Image File
      </button>
      <div className='separator' />
      <button onClick={seeFile} disabled={!file}>
        View File Contents
      </button>
      {url && <img src={url} alt="Uploaded file" style={{ maxWidth: '100%', height: 'auto' }} />}
      
    </div>
    )}
    </Authenticator>
  );
};

export default Admin;
