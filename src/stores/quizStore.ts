import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import type { QuizAnswer, QuizResult, QuizData } from '../types/quiz';
import { loadQuiz } from '../data/quizData';

export const useQuizStore = defineStore('quiz', () => {
  // State
  const currentCategory = ref('');
  const currentSubcategory = ref('');
  const currentQuestionIndex = ref(0);
  const answers = ref<QuizAnswer[]>([]);
  const startTime = ref(0);
  const endTime = ref(0);
  const quizData = ref<QuizData | null>(null);
  const currentResult = ref<QuizResult | null>(null);

  // Getters
  const currentQuestion = computed(() => 
    quizData.value?.questions[currentQuestionIndex.value] ?? null
  );

  const isLastQuestion = computed(() => 
    !quizData.value || currentQuestionIndex.value === quizData.value.questions.length - 1
  );

  const isQuizCompleted = computed(() => 
    quizData.value ? answers.value.length === quizData.value.questions.length : false
  );

  const canProceedToNext = computed(() => {
    const currentQuestionId = currentQuestion.value?.id;
    return currentQuestionId ? answers.value.some(answer => answer.questionId === currentQuestionId) : false;
  });

  const result = computed(() => {
    if (currentResult.value) return currentResult.value;
    if (!quizData.value || !isQuizCompleted.value) return null;

    const correctAnswers = answers.value.filter(answer => answer.isCorrect).length;
    const totalQuestions = quizData.value.questions.length;
    const score = Math.round((correctAnswers / totalQuestions) * 100);
    
    // Calculate time taken with validation
    const timeTaken = Math.max(0, 
      startTime.value > 0 && endTime.value > 0 && endTime.value > startTime.value
        ? endTime.value - startTime.value
        : startTime.value > 0 ? Date.now() - startTime.value : 0
    );

    return {
      id: Date.now().toString(),
      category: currentCategory.value,
      subcategory: currentSubcategory.value,
      date: new Date().toISOString(),
      score,
      totalQuestions,
      answers: [...answers.value],
      timeTaken
    } as QuizResult;
  });

  // Actions
  async function startQuiz(category: string, subcategory: string) {
    const data = await loadQuiz(category, subcategory);
    
    if (!data) {
      throw new Error(`Failed to load quiz data for ${category}-${subcategory}`);
    }
    
    // Reset state
    quizData.value = data;
    currentCategory.value = category;
    currentSubcategory.value = subcategory;
    currentQuestionIndex.value = 0;
    answers.value = [];
    startTime.value = Date.now();
    endTime.value = 0;
    currentResult.value = null;
  }

  function answerQuestion(selectedOption: number) {
    const question = currentQuestion.value;
    if (!question) return;

    const isCorrect = selectedOption === question.correctAnswer;
    
    // Remove existing answer and add new one
    answers.value = answers.value.filter(answer => answer.questionId !== question.id);
    answers.value.push({
      questionId: question.id,
      selectedOption,
      isCorrect
    });
  }

  function nextQuestion() {
    if (!canProceedToNext.value) {
      console.warn('Cannot proceed: Current question not answered');
      return false;
    }

    if (isLastQuestion.value) {
      endTime.value = Date.now();
      return true; // Quiz completed
    }
    
    currentQuestionIndex.value++;
    return false; // Not completed yet
  }

  function updateResult(updatedResult: QuizResult) {
    currentResult.value = updatedResult;
  }

  function resetQuiz() {
    currentCategory.value = '';
    currentSubcategory.value = '';
    currentQuestionIndex.value = 0;
    answers.value = [];
    startTime.value = 0;
    endTime.value = 0;
    quizData.value = null;
    currentResult.value = null;
  }

  return {
    // State
    currentCategory,
    currentSubcategory,
    currentQuestionIndex,
    answers,
    quizData,
    startTime,
    endTime,
    
    // Getters
    currentQuestion,
    isLastQuestion,
    isQuizCompleted,
    canProceedToNext,
    result,
    
    // Actions
    startQuiz,
    answerQuestion,
    nextQuestion,
    updateResult,
    resetQuiz
  };
});