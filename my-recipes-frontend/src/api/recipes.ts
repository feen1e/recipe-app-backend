import api from "./client";

export const getAllRecipes = () => api.get("/recipes");
export const getLatestRecipes = (cursor?: string, limit = 10) =>
  api.get("/recipes/latest", { params: { cursor, limit } });

export const getUserRecipes = (username: string) =>
  api.get(`/recipes/user/${username}`);

export const getRecipeById = (id: string) => api.get(`/recipes/${id}`);

export const createRecipe = (data: unknown) => api.post("/recipes", data);

export const updateRecipe = (id: string, data: unknown) =>
  api.patch(`/recipes/${id}`, data);

export const deleteRecipe = (id: string) => api.delete(`/recipes/${id}`);

export const discoverRecipes = (limit = 10) =>
  api.get("/recipes/discover", { params: { limit } });
