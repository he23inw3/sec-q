import { ref } from 'vue';
import type { QuizCategory } from '../types/quiz';

export const categories = ref<QuizCategory[]>([]);

export async function loadCategories() {
  try {
    const response = await fetch('/categories.json');
    const data = await response.json();
    categories.value = data.categories;
  } catch (error) {
    console.error('Error loading categories:', error);
    categories.value = [];
  }
}