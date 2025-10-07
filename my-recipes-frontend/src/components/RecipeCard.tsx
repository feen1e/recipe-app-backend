import { Link } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { addFavorite, removeFavorite } from "../api/favorites";
import { useAuth } from "../auth/useAuth";
import type { RecipeResponseDto } from "../types";

export default function RecipeCard({ recipe }: { recipe: RecipeResponseDto }) {
  const { user } = useAuth();
  const username = user?.username ?? null;
  const queryClient = useQueryClient();

  const favoriteMutation = useMutation({
    mutationFn: async () => {
      if (recipe.isFavorite) return removeFavorite(recipe.id);
      return addFavorite(recipe.id);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["userRecipes", username] });
      queryClient.invalidateQueries({ queryKey: ["favorites", username] });
    },
  });

  return (
    <article className="recipeCard">
      <div className="recipeCardContent">
        {recipe.imageUrl && (
          <img
            src={new URL(
              recipe.imageUrl!,
              import.meta.env.VITE_API_URL
            ).toString()}
            alt={recipe.title}
            className="recipeImage"
          />
        )}

        <div className="recipeDetails">
          <h3 className="recipeTitle">
            <Link to={`/app/recipes/${recipe.id}`} className="recipeTitleLink">
              {recipe.title}
            </Link>
          </h3>

          <p className="recipeDescription">{recipe.description ?? ""}</p>

          <div className="recipeFooter">
            <span className="recipeDate">
              Updated: {new Date(recipe.updatedAt).toLocaleString()}
            </span>

            <button
              onClick={() => favoriteMutation.mutate()}
              disabled={favoriteMutation.isPending}
              className={`favoriteButton ${
                recipe.isFavorite ? "favoriteActive" : "favoriteInactive"
              }`}
            >
              {favoriteMutation.isPending
                ? "..."
                : recipe.isFavorite
                ? "❤️"
                : "🤍"}
            </button>
          </div>
        </div>
      </div>
    </article>
  );
}
