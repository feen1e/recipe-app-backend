import api from "./client";

export const getCollections = () => api.get("/collections");

export const getUserCollections = (username: string) =>
  api.get(`/collections/user/${username}`);

export const getCollectionById = (id: string) => api.get(`/collections/${id}`);

export const createCollection = (data: { name: string }) => {
  const token = localStorage.getItem("token");
  return api.post("/collections", data, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
};

export const updateCollection = (id: string, data: unknown) =>
  api.patch(`/collections/${id}`, data);

export const deleteCollection = (id: string) =>
  api.delete(`/collections/${id}`);

export const addRecipeToCollection = (collectionId: string, recipeId: string) =>
  api.post(`/collections/${collectionId}/recipes`, { recipeId });

export const removeRecipeFromCollection = (
  collectionId: string,
  recipeId: string
) => api.delete(`/collections/${collectionId}/recipes/${recipeId}`);
