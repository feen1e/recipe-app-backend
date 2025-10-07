import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { createRecipe, getUserRecipes } from "../api/recipes";
import { getUserFavorites } from "../api/favorites";
import { uploadFile } from "../api/uploads";
import { useAuth } from "../auth/useAuth";
import RecipeCard from "../components/RecipeCard";

import type { RecipeResponseDto } from "../types";
import { Link, useNavigate } from "react-router-dom";

export default function RecipesPage() {
  const { user, logout } = useAuth();
  const username = user?.username ?? null;
  const queryClient = useQueryClient();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // Fetch recipes + mark favorites
  const { data: recipesData = [], isLoading } = useQuery<RecipeResponseDto[]>({
    queryKey: ["userRecipes", username],
    queryFn: async () => {
      if (!username) return [];

      const [recipesRes, favoritesRes] = await Promise.all([
        getUserRecipes(username),
        getUserFavorites(username),
      ]);

      const favoriteIds = new Set(
        favoritesRes.data.map((f: { id: unknown }) => f.id)
      );

      return recipesRes.data.map((r: RecipeResponseDto) => ({
        ...r,
        isFavorite: favoriteIds.has(r.id),
      }));
    },
    enabled: !!username,
  });

  // Create recipe form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [ingredients, setIngredients] = useState<string[]>([]);
  const [steps, setSteps] = useState<string[]>([]);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Create recipe mutation
  const createMutation = useMutation({
    mutationFn: async (payload: {
      title: string;
      description?: string;
      ingredients: string[];
      steps: string[];
      imageFile?: File | null;
    }) => {
      let imageUrl: string | undefined;

      if (payload.imageFile) {
        const upload = await uploadFile("recipes", payload.imageFile);
        imageUrl = `/uploads/${upload.url}`;
      }

      return createRecipe({
        title: payload.title,
        description: payload.description,
        ingredients: payload.ingredients,
        steps: payload.steps,
        imageUrl,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRecipes", username] });
    },
  });

  const handleCreate = () => {
    if (!title.trim()) return alert("Title is required");

    createMutation.mutate({
      title,
      description,
      ingredients,
      steps,
      imageFile,
    });

    // Reset form
    setTitle("");
    setDescription("");
    setIngredients([]);
    setSteps([]);
    setImageFile(null);
  };

  if (isLoading) return <div>Loading recipes...</div>;

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
      <div className="recipesContainer">
        <h1 className="recipesTitle">My Recipes</h1>

        <div className="recipeFormCard">
          <input
            placeholder="Recipe title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="formInput"
          />
          <textarea
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            className="formTextarea"
          />
          <input
            placeholder="Ingredients (comma-separated)"
            onChange={(e) => setIngredients(e.target.value.split(","))}
            className="formInput"
          />
          <input
            placeholder="Steps (comma-separated)"
            onChange={(e) => setSteps(e.target.value.split(","))}
            className="formInput"
          />
          <input
            type="file"
            accept="image/*"
            onChange={(e) => setImageFile(e.target.files?.[0] ?? null)}
            className="formFile"
          />
          <button
            onClick={handleCreate}
            disabled={createMutation.isPending}
            className="createButton"
          >
            {createMutation.isPending ? "Creating..." : "Create Recipe"}
          </button>
        </div>

        {recipesData.length === 0 ? (
          <div className="emptyMessage">No recipes yet.</div>
        ) : (
          <div className="recipeGrid">
            {recipesData.map((recipe) => (
              <RecipeCard key={recipe.id} recipe={recipe} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
