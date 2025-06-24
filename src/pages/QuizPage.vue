<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuizStore } from '../stores/quizStore';
import QuizCard from '../components/QuizCard.vue';

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();

const showDebugInfo = ref(false);
const isLoading = ref(false);
const loadError = ref('');

const currentCategory = computed(() => route.params.category as string);
const currentSubcategory = computed(() => route.params.subcategory as string);
const currentQuestion = computed(() => quizStore.currentQuestion);
const currentQuestionIndex = computed(() => quizStore.currentQuestionIndex);
const totalQuestions = computed(() => quizStore.quizData?.questions.length || 0);
const isLastQuestion = computed(() => quizStore.isLastQuestion);
const canProceedToNext = computed(() => quizStore.canProceedToNext);
const isQuizCompleted = computed(() => quizStore.isQuizCompleted);
const answeredCount = computed(() => quizStore.answers.length);

onMounted(async () => {
  if (!quizStore.currentCategory || 
      quizStore.currentCategory !== currentCategory.value ||
      quizStore.currentSubcategory !== currentSubcategory.value) {
    
    isLoading.value = true;
    loadError.value = '';
    
    try {
      await quizStore.startQuiz(currentCategory.value, currentSubcategory.value);
    } catch (error) {
      loadError.value = error instanceof Error ? error.message : 'Unknown error occurred';
    } finally {
      isLoading.value = false;
    }
  }
});

function handleAnswer(selectedOption: number) {
  quizStore.answerQuestion(selectedOption);
}

function handleNext() {
  const completed = quizStore.nextQuestion();
  
  if (completed && isQuizCompleted.value) {
    router.push(`/result/${currentCategory.value}/${currentSubcategory.value}`);
  }
}

function handleComplete() {
  if (isQuizCompleted.value && quizStore.result) {
    router.push(`/result/${currentCategory.value}/${currentSubcategory.value}`);
  } else {
    console.warn('Quiz completion attempted but quiz is not actually completed');
  }
}

function goToHome() {
  quizStore.resetQuiz();
  router.push('/');
}
</script>

<template>
  <div class="quiz-view">
    <v-container class="py-8">
      <v-row justify="center">
        <v-col cols="12">
          <quiz-card
            v-if="currentQuestion"
            :category-id="currentCategory"
            :subcategory-id="currentSubcategory"
            :question="currentQuestion"
            :current-question="currentQuestionIndex + 1"
            :total-questions="totalQuestions"
            :is-last-question="isLastQuestion"
            :can-proceed-to-next="canProceedToNext"
            :is-quiz-completed="isQuizCompleted"
            @answer="handleAnswer"
            @next="handleNext"
            @complete="handleComplete"
          />
          
          <div v-else-if="isLoading" class="text-center pa-8">
            <v-progress-circular
              indeterminate
              color="primary"
              size="64"
            ></v-progress-circular>
            <p class="text-h6 mt-4">クイズを読み込み中...</p>
          </div>

          <div v-else-if="loadError" class="text-center pa-8">
            <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
            <h3 class="text-h5 mb-4">クイズの読み込みに失敗しました</h3>
            <p class="text-body-1 mb-4">{{ loadError }}</p>
            <v-btn
              color="primary"
              prepend-icon="mdi-home"
              @click="goToHome"
            >
              ホームに戻る
            </v-btn>
          </div>
        </v-col>
      </v-row>
    </v-container>

    <!-- Debug Information (remove in production) -->
    <v-card v-if="showDebugInfo" class="ma-4 pa-4" color="grey-lighten-4">
      <v-card-title>デバッグ情報</v-card-title>
      <v-card-text>
        <p>現在の問題: {{ currentQuestionIndex + 1 }} / {{ totalQuestions }}</p>
        <p>回答済み問題数: {{ answeredCount }}</p>
        <p>最終問題: {{ isLastQuestion ? 'はい' : 'いいえ' }}</p>
        <p>進行可能: {{ canProceedToNext ? 'はい' : 'いいえ' }}</p>
        <p>クイズ完了: {{ isQuizCompleted ? 'はい' : 'いいえ' }}</p>
      </v-card-text>
    </v-card>
  </div>
</template>

<style scoped>
.quiz-view {
  min-height: 100vh;
  display: flex;
  align-items: center;
  padding: 1rem;
}
</style>