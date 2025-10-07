import { useEffect, useState } from "react";
import { getUserCollections, createCollection } from "../api/collections";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/useAuth";

interface CollectionResponseDto {
  id: string;
  name: string;
  description: string | null;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export default function CollectionsPage() {
  const [collections, setCollections] = useState<CollectionResponseDto[]>([]);
  const username = localStorage.getItem("username");
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  useEffect(() => {
    if (username) {
      getUserCollections(username)
        .then((res: { data: CollectionResponseDto[] }) =>
          setCollections(res.data)
        )
        .catch((err: unknown) => console.error(err));
    }
  }, [username]);

  const handleCreate = async () => {
    const name = prompt("Collection name?");
    if (!name) return;

    try {
      const createRes = await createCollection({ name });
      console.log("Created:", createRes.data);

      const res = await getUserCollections(username!);
      setCollections(res.data);
    } catch (err) {
      console.error("Failed to create collection:", err);
      alert("Failed to create collection. Are you logged in?");
    }
  };

  return (
    <div className="dashboardContainer">
      <nav className="dashboardNav">
        <div className="dashboardLinks">
          <Link to="/app/collections" className="dashboardLink">
            Collections
          </Link>
          <Link to="/app/uploads" className="dashboardLink">
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
      <div className="collectionsContainer">
        <h1 className="collectionsTitle">My Collections</h1>
        <button onClick={handleCreate} className="createButton">
          + New Collection
        </button>

        <ul className="collectionsList">
          {collections.map((c) => (
            <li key={c.id} className="collectionItem">
              {c.name}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
