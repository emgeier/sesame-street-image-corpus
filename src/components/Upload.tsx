import React, { useEffect, useState } from 'react';
import { uploadData, getUrl} from 'aws-amplify/storage';
import { Divider } from '@aws-amplify/ui-react';
import {getCurrentUser } from 'aws-amplify/auth';


const Upload: React.FC = () => {
  //Individual image file upload
  const [file, setFile] = useState<File | null>(null);
  //Folder upload
  const [files, setFiles] = useState<FileList | null>(null);
  //Visualize image selected for upload
  const [url, setUrl] = useState<string | undefined>("");
  //Selected folder and file state
  const inputRefFile = React.useRef<HTMLInputElement | null>(null);
  const inputRef = React.useRef<HTMLInputElement | null>(null);
  //Messaging
  const [folderMessage, setFolderMessage] = useState<string | undefined>("");
  const [fileMessage, setFileMessage] = useState<string | undefined>("");
  // Visualize file uploaded
  const [fileContent, setFileContent] = useState<string | null>(null); // For non-image files like XML

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

  // Function to check if user is logged in
  const checkUserAuthorization = async () => {
    try {
      const { userId } = await getCurrentUser();
      if (!userId ) {return false;}
      return true; // User is logged in
      } catch (error) {
        console.error("Error checking user authorization:", error);
        return false;
      }
    };

  //See the image selected for upload
  const seeFile = async () => {
    if (!file) {
      console.error("no file selected");
      return;
    }
    if (file.type === 'text/xml') {
      // Read and display XML file content
      const reader = new FileReader();
      reader.onload = (e) => {
        setFileContent(e.target?.result as string);
      };
      reader.readAsText(file);
    } else {
        try {
          const result = await getUrl({
            path: `images/${file.name}`
          });
          console.log(result);
          setUrl(result.url.href);
        } catch (error) {
          console.log(error);
        }
      }
  };
  //When folder is selected, reset messaging and set files
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFolderMessage("");
    const selectedFiles = event.target.files;
    setFiles(selectedFiles);
    console.log("files:", selectedFiles);
  };
  //Single file upload in response to button
  const handleSingleFileUpload = async () => {
    if (!file) {
      console.error("No file selected");
      return;
    }
    try {
      const isAuthorized = await checkUserAuthorization();
      if (!isAuthorized) {
        setFileMessage("User not authorized to upload file.");
        return; // Stop if user is unauthorized
      }
      const filePath = file.type === 'text/xml' ? 'data' : 'images';
      console.log(file.name);
      console.log(filePath);
      await uploadData({
        path: `data/${file.name}`,
        data: file,
      });
      console.log(`File ${file.name} uploaded successfully`);
      setFileMessage("File uploaded successfully");
      if (inputRefFile.current) {
        inputRefFile.current.value = ""; // Reset the file input field
      }
      hideMessageAfterDelay(); // Auto-hide the message after delay
    } catch (error) {
      console.error("Error uploading file:", error);
      setFileMessage("Error uploading file.");
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
      const isAuthorized = await checkUserAuthorization();
      if (!isAuthorized) {
        setFolderMessage("User not authorized to upload folder.");
        return; // Stop if user is unauthorized
      }
      for (let i = 0; i < files.length; i += BATCH_SIZE) {
        const batch = Array.from(files).slice(i, i + BATCH_SIZE);
        await Promise.all(batch.map(async file => {
          const filePath = `data/${file.webkitRelativePath}`;
          console.log(`Uploading file: ${file.name} to path: ${filePath}`);
          await uploadData({
            path: filePath,
            data: file,
          });
          console.log(`File ${file.name} uploaded successfully`);
          setFolderMessage(`File ${file.name} uploaded successfully`);
        }));

        // Add delay between batches to prevent rate limiting
        if (i + BATCH_SIZE < files.length) {
          await sleep(DELAY);
        }
      }
      setFolderMessage("Folder uploaded successfully");
      hideMessageAfterDelay(); // Auto-hide the message after 5 seconds
    } catch (error) {
      console.error("Error uploading folder:", error);
      setFolderMessage("Error uploading folder.");
    }
  };

  const hideMessageAfterDelay = () => {
    setTimeout(() => {
      setFolderMessage(undefined); // Clear the message after 5 seconds
      setFileMessage(undefined); // Clear the message after 5 seconds
    }, 5000);
  };


  return (
    <div >
      <div className='separator'></div>
      <div className='separator'></div>
      <div className='separator'></div>
      <div className='separator'></div>
      <header className="banner1"></header>
      <div className='separator'></div>
        <h1 className='intro'>Add Images and Annotations to Archive</h1>
        <div className='upload-tooltip-container'>
        <div className="upload-tooltip">
          <span>ℹ️</span>
          <div className="upload-tooltiptext">
          <p>To correlate image and annotation data, annotations should reference image ids in their filename field. </p><p>Preferred filename format is : S season number -E episode number_image number.png.<br/>Example: S13-E4055_00129.png.</p> <p> Currently, only xml files for annotation data and png files for images can be uploaded. </p>          
          </div>
          </div>
        </div>
        <br/>
      <Divider></Divider>
      <div className='upload-content'>
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
      <div>{folderMessage && <p>{folderMessage}</p>}</div>
      <div className="separator" />
      <Divider></Divider>
      <h3>Upload File</h3>
      <input
        type="file"
        onChange={(e) => setFile(e.target.files ? e.target.files[0] : null)}
        ref={inputRefFile}
      />
      <button onClick={handleSingleFileUpload} disabled={!file}>
        Upload File
      </button>
      <div>{fileMessage && <p>{fileMessage}</p>}</div>
      <div className="separator" />
      <h4>        Verify Upload: View File Contents
      </h4>
      <button onClick={seeFile} disabled={!file}>
        View 
      </button>
      <br/>
      {url && <img src={url} alt="Uploaded file" style={{ maxWidth: '100%', height: 'auto' }} />}
      {fileContent && <pre>{fileContent}</pre>} {/* For XML or other text files */}
    </div>
    </div>
  );
};

export default Upload;
