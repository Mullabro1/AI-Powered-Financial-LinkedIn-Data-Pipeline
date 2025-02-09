document.getElementById("uploadForm").addEventListener("submit", async (event) => {
    event.preventDefault();
  
    const formData = new FormData();
    const fileInput = document.getElementById("fileInput");
  
    if (!fileInput.files[0]) {
      alert("Please select a file to upload.");
      return;
    }
  
    formData.append("file", fileInput.files[0]);
  
    try {
      const response = await fetch("http://localhost:5000/upload", {
        method: "POST",
        body: formData
      });
  
      const result = await response.text();
      
      // Show success or error message
      const responseMessage = document.getElementById("responseMessage");
      if (response.ok) {
        responseMessage.textContent = result;
        responseMessage.style.color = "green";
      } else {
        responseMessage.textContent = `Error: ${result}`;
        responseMessage.style.color = "red";
      }
    } catch (error) {
      console.error("Error uploading file:", error);
      document.getElementById("responseMessage").textContent = "An error occurred during the file upload.";
    }
  });
  