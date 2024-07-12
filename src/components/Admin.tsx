import React from 'react';

import { uploadData, getUrl } from 'aws-amplify/storage';

const Admin: React.FC = () => {
  const [file, setFile] = React.useState<File | null>(null);
  const [url, setUrl] = React.useState<string | undefined>("");

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
    const selectedFile = event.target.files ? event.target.files[0] : null;
    setFile(selectedFile);
  };


  const handleUpload = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }

    try {
      await uploadData({
        path: `dev/${file.name}`,
        data: file,
      });
      console.log("File uploaded successfully");
      
    } catch (error) {
      console.error("Error uploading file:", error);
    }
  };
   
  return (
    <div className='main-content'>
        <h1>Coming soon</h1>
        <h1>upload and view files</h1>
      <input type="file" onChange={handleChange} />
      <div className='separator'/>
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>
      <div className='separator'/>
      <button onClick={seeFile} disabled={!file}>
        View File Contents
      </button>
      <img src={url} alt="Uploaded file" style={{ maxWidth: '100%', height: 'auto' }} />
    </div>
  );
};

export default Admin;
