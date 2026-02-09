export type ActionState = {
  error?: string | Record<string, string[] | undefined> | null;
  success?: boolean;
  message?: string | null;
};
