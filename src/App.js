import React, { useState } from "react";
import "./App.css";
import { v4 as uuidv4 } from "uuid";

function App() {
  const [image, setImage] = useState(null);
  const [uploadResultMessage, setUploadResultMessage] = useState(
    "Please upload an image to authenticate."
  );
  const [previewURL, setPreviewURL] = useState("");
  const [isAuth, setAuth] = useState(false);
  const [loading, setLoading] = useState(false);

  const API_BASE = process.env.REACT_APP_API_BASE;


  const handleFileChange = (e) => {
    const file = e.target.files[0];
    setImage(file);
    setPreviewURL(URL.createObjectURL(file));
  };

  const sendImage = async (e) => {
    e.preventDefault();
    if (!image) {
      setUploadResultMessage("Please select an image first!");
      return;
    }

    try {
      setLoading(true);
      const visitorImageName = uuidv4() + ".jpeg";
      setUploadResultMessage("⏳ Uploading image...");

      const uploadUrl = `${API_BASE}/bucket/visitor-pics-27102025/filename/${visitorImageName}`;
      const uploadResponse = await fetch(uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": "image/jpeg" },
        body: image,
      });

      if (!uploadResponse.ok)
        throw new Error(`Upload failed with ${uploadResponse.status}`);

      setUploadResultMessage("✅ Upload successful! Authenticating...");

      const authUrl = `${API_BASE}/employee?objectKey=${visitorImageName}`;
      const authResponse = await fetch(authUrl, {
        method: "GET",
        headers: { Accept: "application/json" },
      });

      const result = await authResponse.json();
      setLoading(false);

      if (result.Message === "Success") {
        setAuth(true);
        setUploadResultMessage(
          `👋 Hi ${result.firstName} ${result.lastName}, welcome to work!`
        );
      } else {
        setAuth(false);
        setUploadResultMessage("❌ Authentication Failed: Not an employee.");
      }
    } catch (err) {
      console.error(err);
      setAuth(false);
      setLoading(false);
      setUploadResultMessage(
        "⚠️ Error during authentication. Please try again."
      );
    }
  };

  return (
    <div className="app-container">
      <div className="card">
        <h1 className="title">Facial Recognition System</h1>
        <p className="subtitle">Secure Employee Authentication Portal</p>

        <form onSubmit={sendImage} className="form">
          <label className="file-label">
            <input
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="file-input"
            />
            <span>Select Image</span>
          </label>

          <button type="submit" className="btn" disabled={!image || loading}>
            {loading ? "Processing..." : "Authenticate"}
          </button>
        </form>

        <p className={`message ${isAuth ? "success" : "failure"}`}>
          {uploadResultMessage}
        </p>

        {previewURL && (
          <div className="preview">
            <img src={previewURL} alt="Visitor Preview" />
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
