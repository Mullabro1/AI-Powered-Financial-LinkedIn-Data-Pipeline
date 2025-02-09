import React, { useState } from 'react';
import axios from 'axios';
import { JSONTree } from 'react-json-tree';  // Import react-json-tree

const FileUpload = () => {
  const [file, setFile] = useState(null);
  const [response, setResponse] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleFileChange = (e) => {
    setFile(e.target.files[0]);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!file) {
      alert("Please select a file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    setLoading(true);  // Set loading state
    setError(null);    // Reset error

    try {
      console.log("Uploading file...");
      // Upload the file to the backend
      const res = await axios.post('http://localhost:5000/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      // Check if response contains json_data and format_res
      if (res.data && res.data.json_data && res.data.format_res) {
        console.log("JSON Data received:", res.data.json_data);
        setResponse(res.data);  // Set the entire response to display
      } else {
        console.error('Invalid response structure:', res.data);
        alert('Failed to process file. No valid JSON data received.');
      }
    } catch (error) {
      console.error('Error uploading file', error);
      setError('Error uploading file');
    } finally {
      setLoading(false);  // Reset loading state
    }
  };

  return (
    <div>
      <h2>Upload a PDF</h2>
      <form onSubmit={handleSubmit}>
        <input type="file" onChange={handleFileChange} />
        <button type="submit" disabled={loading}>Upload</button>
      </form>

      {loading && <p>Uploading...</p>}  {/* Display loading message */}

      {error && <p style={{ color: 'red' }}>{error}</p>}  {/* Display error message */}

      {response && (
        <div>
          <h3>File processed successfully!</h3>
          <p>Detected format: {response.format_res}</p> {/* Display format */}
          {/* Use react-json-tree for nicely formatted JSON view */}
          <JSONTree data={response.json_data} />
        </div>
      )}
    </div>
  );
};

export default FileUpload;
