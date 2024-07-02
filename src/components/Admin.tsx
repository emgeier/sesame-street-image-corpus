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
    <div>
      <input type="file" onChange={handleChange} />
      <button onClick={handleUpload} disabled={!file}>
        Upload
      </button>
      <img src={url} alt="Uploaded file" style={{ maxWidth: '100%', height: 'auto' }} />
      <button onClick={seeFile} disabled={!file}>
        See
      </button>
    </div>
  );
};

export default Admin;
