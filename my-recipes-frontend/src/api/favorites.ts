import api from "./client";

export const getUserFavorites = (username: string) =>
  api.get(`/favorites/${username}`);

export const addFavorite = (recipeId: string) =>
  api.post(`/favorites/${recipeId}`);

export const removeFavorite = (recipeId: string) =>
  api.delete(`/favorites/${recipeId}`);
