const contexts = new Map<string, Map<string, unknown>>();
const contextVersions = new Map<string, number>();

function mutateVersion(key: string) {
  contextVersions.set(key, contextVersions.get(key)! + 1);
}

/**
 * Create a new context.
 * @returns The contextId
 */
export function createContext(): string {
  const key = crypto.randomUUID();
  contexts.set(key, new Map());
  contextVersions.set(key, 0);
  return key;
}

/**
 * Delete a context.
 * @param id The contextId to delete.
 * @returns `true` if the context was deleted
 */
export function deleteContext(id: string): boolean {
  contextVersions.delete(id);
  return contexts.delete(id);
}

function getContext(id: string): Map<string, unknown> {
  const context = contexts.get(id);
  if (!context) {
    throw new Error("Context is not found!");
  }
  return context;
}

export function contextClear(id: string) {
  getContext(id).clear();
  mutateVersion(id);
}

export function contextPut(id: string, key: string, value: unknown) {
  if (value === null || value === undefined) {
    getContext(id).delete(key);
  } else {
    getContext(id).set(key, value);
  }
  mutateVersion(id);
}

export function contextDelete(id: string, key: string): boolean {
  const result = getContext(id).delete(key);
  mutateVersion(id);
  return result;
}

export function contextGetNullable<T>(
  id: string,
  key: string,
): T | undefined | null {
  return getContext(id).get(key) as T | undefined | null;
}

export function contextGet<T>(id: string, key: string): T {
  const value = contextGetNullable<T>(id, key);
  if (value === undefined || value === null) {
    throw new Error(`Context-key (${id})["${key}"] is undefined or null!`);
  }
  return value;
}

export function getCombinedContext(ids: string[]): Record<string, unknown> {
  const obj: Record<string, unknown> = {};
  for (const id of ids) {
    for (const [key, value] of getContext(id)) {
      obj[key] = value;
    }
  }
  return obj;
}

export function createFilledContext(context: Record<string, unknown>): string {
  const id = createContext();
  for (const [key, value] of Object.entries(context)) {
    contextPut(id, key, value);
  }
  return id;
}
