export interface LoadJsonOptions {
  cache?: boolean;
}

const jsonCache = new Map<string, any>();

export async function loadJson<T = any>(
  filename: string, 
  options: LoadJsonOptions = { cache: true }
): Promise<T> {
  if (options.cache && jsonCache.has(filename)) {
    return jsonCache.get(filename) as T;
  }

  try {
    const response = await fetch(`/${filename}`);
    
    if (!response.ok) {
      throw new Error(`Failed to load ${filename}: ${response.status} ${response.statusText}`);
    }
    
    const data = await response.json() as T;
    
    if (options.cache) {
      jsonCache.set(filename, data);
    }
    
    return data;
  } catch (error) {
    console.error(`Error loading JSON file ${filename}:`, error);
    throw error;
  }
}

export async function loadQuizData(category: string, subcategory: string) {
  const filename = `quizzes/${category}-${subcategory}.json`;
  return loadJson(filename);
}

export async function loadCategoryQuizData(category: string) {
  const filename = `quizzes/${category}.json`;
  return loadJson(filename);
}

export function clearJsonCache(): void {
  jsonCache.clear();
}

export function removeFromCache(filename: string): void {
  jsonCache.delete(filename);
}