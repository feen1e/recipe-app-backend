import { useState } from "react";
import { uploadFile } from "../api/uploads";
import { useAuth } from "../auth/useAuth";
import { Link, useNavigate } from "react-router-dom";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [type, setType] = useState<"avatars" | "recipes">("avatars");
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  const handleUpload = async () => {
    if (!file) return alert("Please select a file first!");
    setLoading(true);
    try {
      const res = await uploadFile(type, file);
      setUploadedUrl(`${import.meta.env.VITE_API_URL}/uploads/${res.url}`);
    } catch (err) {
      console.error("Upload failed:", err);
      alert("Upload failed. Are you logged in?");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboardContainer">
      <nav className="dashboardNav">
        <div className="dashboardLinks">
          <Link to="/app/collections" className="dashboardLink">
            Collections
          </Link>
          <Link to="/app/uploads" className="dashboardLink active">
            Uploads
          </Link>
          <Link to="/app/recipes" className="dashboardLink">
            Recipes
          </Link>
          <Link to="/app/favorites" className="dashboardLink">
            Favorites
          </Link>
        </div>

        <div className="dashboardUser">
          {user && (
            <span className="dashboardUsername">Hi, {user.username}</span>
          )}
          <button onClick={handleLogout} className="logoutButton">
            Logout
          </button>
        </div>
      </nav>

      {/* Upload Form */}
      <div className="uploadCard">
        <h1 className="uploadTitle">File Upload</h1>

        <label className="uploadLabel">Upload type</label>
        <select
          className="uploadSelect"
          value={type}
          onChange={(e) => setType(e.target.value as "avatars" | "recipes")}
        >
          <option value="avatars">Avatar</option>
          <option value="recipes">Recipe</option>
        </select>

        <input
          type="file"
          accept="image/*"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="uploadInput"
        />

        <button
          onClick={handleUpload}
          disabled={loading}
          className="uploadButton"
        >
          {loading ? "Uploading..." : "Upload"}
        </button>

        {uploadedUrl && (
          <div className="uploadPreview">
            <p>Uploaded successfully:</p>
            <a
              href={uploadedUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="uploadLink"
            >
              {uploadedUrl}
            </a>
            <img src={uploadedUrl} alt="Uploaded" className="uploadImage" />
          </div>
        )}
      </div>
    </div>
  );
}
