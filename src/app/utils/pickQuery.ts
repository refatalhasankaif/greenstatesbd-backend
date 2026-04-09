export const getString = (value: unknown): string | undefined => {
  return typeof value === "string" ? value : undefined;
};