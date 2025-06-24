import { ref } from 'vue';
import type { QuizData } from '../types/quiz';
import { loadQuizData, loadCategoryQuizData } from '../utils/jsonLoader';

export const currentQuizData = ref<QuizData | null>(null);

export async function loadQuiz(category: string, subcategory?: string): Promise<QuizData | null> {
  try {
    let data: QuizData;
    
    if (subcategory) {
      data = await loadQuizData(category, subcategory);
    } else {
      data = await loadCategoryQuizData(category);
    }
    
    if (!data || !data.questions || !Array.isArray(data.questions)) {
      throw new Error('Invalid quiz data structure');
    }
    
    currentQuizData.value = data;
    
    return data;
  } catch (error) {
    console.error(`Error loading quiz data for ${category}${subcategory ? `-${subcategory}` : ''}:`, error);
    currentQuizData.value = null;
    return null;
  }
}

export function getCurrentQuizData(): QuizData | null {
  return currentQuizData.value;
}

export function clearCurrentQuizData(): void {
  currentQuizData.value = null;
}

export async function quizExists(category: string, subcategory?: string): Promise<boolean> {
  try {
    if (subcategory) {
      await loadQuizData(category, subcategory);
    } else {
      await loadCategoryQuizData(category);
    }
    return true;
  } catch (error) {
    return false;
  }
}