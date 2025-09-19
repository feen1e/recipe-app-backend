import type { InputJsonValue } from "@prisma/client/runtime/library";

export function parseArrayFromJson(array): string[] {
  return Array.isArray(array)
    ? (array as string[])
    : typeof array === "string"
      ? (JSON.parse(array) as string[])
      : [];
}

export function parseArrayToJson(array: string[]): InputJsonValue {
  return Array.isArray(array)
    ? JSON.stringify(array)
    : typeof array === "string"
      ? JSON.stringify([array])
      : JSON.stringify([]);
}
