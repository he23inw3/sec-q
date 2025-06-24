import { defineStore } from 'pinia';
import { ref, watch } from 'vue';
import type { QuizResult, QuizAnswer } from '../types/quiz';

export const useHistoryStore = defineStore('history', () => {
  const quizHistory = ref<QuizResult[]>([]);

  const storedHistory = localStorage.getItem('quizHistory');
  if (storedHistory) {
    quizHistory.value = JSON.parse(storedHistory);
  }

  watch(
    quizHistory,
    (newHistory) => {
      localStorage.setItem('quizHistory', JSON.stringify(newHistory));
    },
    { deep: true }
  );

  // Actions
  function addResult(result: QuizResult) {
    quizHistory.value.unshift(result);
    
    if (quizHistory.value.length > 20) {
      quizHistory.value = quizHistory.value.slice(0, 20);
    }
  }

  function addReviewAnswer(resultId: string, questionId: number, selectedOption: number, correctAnswer: number) {
    const result = quizHistory.value.find(r => r.id === resultId);
    if (!result) return;

    if (!result.reviewAnswers) {
      result.reviewAnswers = [];
    }

    let reviewAnswer = result.reviewAnswers.find(r => r.questionId === questionId);
    if (!reviewAnswer) {
      const originalAnswer = result.answers.find(a => a.questionId === questionId);
      if (!originalAnswer) return;

      reviewAnswer = {
        questionId,
        originalAnswer,
        reviewAnswers: [],
        bestScore: false
      };
      result.reviewAnswers.push(reviewAnswer);
    }

    const newReviewAnswer: QuizAnswer = {
      questionId,
      selectedOption,
      isCorrect: selectedOption === correctAnswer
    };
    reviewAnswer.reviewAnswers.push(newReviewAnswer);

    if (newReviewAnswer.isCorrect && !reviewAnswer.originalAnswer.isCorrect) {
      reviewAnswer.bestScore = true;
    }
  }

  function clearHistory() {
    quizHistory.value = [];
  }

  function getResultById(id: string) {
    return quizHistory.value.find(result => result.id === id);
  }

  function getResultsByCategory(category: string) {
    return quizHistory.value.filter(result => result.category === category);
  }

  return {
    quizHistory,
    addResult,
    addReviewAnswer,
    clearHistory,
    getResultById,
    getResultsByCategory
  };
});