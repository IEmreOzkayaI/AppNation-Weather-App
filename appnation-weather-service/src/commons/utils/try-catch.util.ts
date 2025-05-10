export async function tryCatch<T>(promise: Promise<T>): Promise<[any | null, T | null]> {
  try {
    const data = await promise;
    return [null, data];
  } catch (error) {
    return [error as any, null];
  }
}
