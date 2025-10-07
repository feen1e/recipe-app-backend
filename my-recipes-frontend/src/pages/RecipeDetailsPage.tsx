import { useParams } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getRecipeById } from "../api/recipes";
import { addFavorite, removeFavorite } from "../api/favorites";
import { addRecipeToCollection } from "../api/collections";
import { useAuth } from "../auth/useAuth";

interface Recipe {
  id: string;
  title: string;
  description: string;
  imageUrl?: string;
  ingredients: string[];
  steps: string[];
  isFavorite?: boolean;
}

export default function RecipeDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const { user } = useAuth();
  const username = user?.username ?? null;
  const queryClient = useQueryClient();

  const {
    data: recipe,
    isLoading,
    isError,
  } = useQuery<Recipe>({
    queryKey: ["recipe", id],
    queryFn: async () => {
      if (!id) throw new Error("Missing recipe ID");
      const res = await getRecipeById(id);
      return res.data;
    },
    enabled: !!id,
  });

  const favoriteMutation = useMutation({
    mutationFn: async (isFav: boolean) => {
      if (!id) throw new Error("Missing recipe ID");
      if (isFav) return removeFavorite(id);
      return addFavorite(id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["recipe", id] });
      queryClient.invalidateQueries({ queryKey: ["favorites", username] });
    },
  });

  const addToCollectionMutation = useMutation({
    mutationFn: async (collectionId: string) => {
      if (!id) throw new Error("Missing recipe ID");
      return addRecipeToCollection(collectionId, id);
    },
    onSuccess: () => {
      alert("Added to collection!");
    },
  });

  if (isLoading) return <div>Loading recipe...</div>;
  if (isError || !recipe) return <div>Recipe not found</div>;

  return (
    <div className="recipeDetailsContainer">
      <h1 className="recipeTitle">{recipe.title}</h1>
      {recipe.imageUrl && (
        <img
          src={`${import.meta.env.VITE_API_URL}${recipe.imageUrl}`}
          alt={recipe.title}
          className="recipeImage"
        />
      )}
      <p className="recipeDescription">{recipe.description}</p>

      <h2 className="sectionTitle">Ingredients</h2>
      <ul className="ingredientList">
        {recipe.ingredients.map((ing, i) => (
          <li key={i}>{ing}</li>
        ))}
      </ul>

      <h2 className="sectionTitle">Steps</h2>
      <ol className="stepList">
        {recipe.steps.map((step, i) => (
          <li key={i}>{step}</li>
        ))}
      </ol>

      <div className="recipeButtons">
        <button
          onClick={() => favoriteMutation.mutate(!!recipe.isFavorite)}
          disabled={favoriteMutation.isPending}
          className="favoriteButton"
        >
          {favoriteMutation.isPending
            ? "Processing..."
            : recipe.isFavorite
            ? "Remove Favorite"
            : "Add Favorite"}
        </button>

        <button
          onClick={() => {
            const collectionId = prompt("Enter collection ID:");
            if (collectionId) addToCollectionMutation.mutate(collectionId);
          }}
          disabled={addToCollectionMutation.isPending}
          className="addCollectionButton"
        >
          {addToCollectionMutation.isPending
            ? "Adding..."
            : "Add to Collection"}
        </button>
      </div>
    </div>
  );
}
