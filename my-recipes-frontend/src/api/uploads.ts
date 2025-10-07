import api from "./client";

export interface FileUploadResponse {
  filename: string;
  url: string;
}

/**
 * Upload a file to /uploads/:type
 * @param type "avatars" | "recipes"
 * @param file File to upload
 */
export async function uploadFile(
  type: "avatars" | "recipes",
  file: File
): Promise<FileUploadResponse> {
  const formData = new FormData();
  formData.append("file", file);

  const { data } = await api.post<FileUploadResponse>(
    `/uploads/${type}`,
    formData,
    {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    }
  );

  return data;
}
