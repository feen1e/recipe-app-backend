import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getUserFavorites, removeFavorite } from "../api/favorites";
import { useAuth } from "../auth/useAuth";
import { Link, useNavigate } from "react-router-dom";

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
}

export default function FavoritesPage() {
  const { user, logout } = useAuth();
  const username = user?.username ?? null;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const {
    data: favorites = [],
    isLoading,
    isError,
  } = useQuery<Recipe[]>({
    queryKey: ["favorites", username],
    queryFn: async () => {
      if (!username) return [];
      const res = await getUserFavorites(username);
      return res.data;
    },
    enabled: !!username,
  });

  const removeMutation = useMutation({
    mutationFn: async (recipeId: string) => removeFavorite(recipeId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["favorites", username] });
    },
  });

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  if (isLoading) return <div className="pageMessage">Loading favorites...</div>;
  if (isError)
    return <div className="pageMessage">Failed to load favorites.</div>;

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
          <Link to="/app/favorites" className="dashboardLink activeLink">
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
      <div className="favoritesPage">
        <div className="favoritesContent">
          <h1 className="favoritesTitle">My Favorites</h1>

          {favorites.length === 0 && (
            <div className="noFavoritesMessage">No favorite recipes yet.</div>
          )}

          <div className="favoritesGrid">
            {favorites.map((r) => (
              <div key={r.id} className="favoriteCard">
                <Link to={`/app/recipes/${r.id}`} className="favoriteTitle">
                  {r.title}
                </Link>

                {r.imageUrl && (
                  <img
                    src={`${import.meta.env.VITE_API_URL}${r.imageUrl}`}
                    alt={r.title}
                    className="favoriteImage"
                  />
                )}

                <p className="favoriteDescription">{r.description}</p>

                <button
                  onClick={() => removeMutation.mutate(r.id)}
                  disabled={removeMutation.isPending}
                  className="removeButton"
                >
                  {removeMutation.isPending ? "Removing..." : "Remove"}
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
