<script setup lang="ts">
import { ref, computed } from 'vue';
import type { QuizQuestion } from '../types/quiz';
import CategoryChip from './CategoryChip.vue';

const props = defineProps<{
  categoryId: string;
  subcategoryId: string;
  question: QuizQuestion;
  currentQuestion: number;
  totalQuestions: number;
  isLastQuestion: boolean;
  canProceedToNext: boolean;
  isQuizCompleted: boolean;
}>();

const emit = defineEmits<{
  (e: 'answer', option: number): void;
  (e: 'next'): void;
  (e: 'complete'): void;
}>();

const selectedOption = ref<number | null>(null);
const answered = ref(false);
const showIncompleteWarning = ref(false);

const isCorrect = computed(() => selectedOption.value === props.question.correctAnswer);

function handleAnswer() {
  if (selectedOption.value === null) return;
  
  answered.value = true;
  emit('answer', selectedOption.value);
}

function handleNext() {
  if (!props.canProceedToNext) {
    showIncompleteWarning.value = true;
    return;
  }

  if (props.isLastQuestion && props.isQuizCompleted) {
    emit('complete');
  } else if (!props.isLastQuestion) {
    emit('next');
  } else {
    showIncompleteWarning.value = true;
    return;
  }
  
  // Reset for next question
  answered.value = false;
  selectedOption.value = null;
}

function getOptionColor(index: number): string {
  if (!answered.value) return 'primary';
  
  if (props.question.correctAnswer === index) return 'success';
  if (selectedOption.value === index && !isCorrect.value) return 'error';
  
  return 'primary';
}
</script>

<template>
  <v-card class="quiz-card">
    <v-card-title class="text-center pa-4">
      <div class="d-flex justify-center align-center flex-wrap gap-4">
        <category-chip
          :category-id="categoryId"
          :subcategory-id="subcategoryId"
          size="large"
        />
        <span class="text-body-1">{{ currentQuestion }} / {{ totalQuestions }}</span>
      </div>
    </v-card-title>

    <v-progress-linear
      :model-value="(currentQuestion / totalQuestions) * 100"
      color="primary"
      height="8"
    ></v-progress-linear>

    <v-card-text class="pa-4 pa-sm-6">
      <transition name="slide-fade" mode="out-in">
        <div :key="question.id" class="quiz-content">
          <h2 class="text-h5 mb-6 question-text">{{ question.question }}</h2>

          <v-radio-group v-model="selectedOption" class="mt-4 options-container" :disabled="answered">
            <transition-group name="bounce">
              <v-radio
                v-for="(option, index) in question.options"
                :key="index"
                :value="index"
                :label="option"
                :color="getOptionColor(index)"
                :disabled="answered"
                class="option-radio"
                :class="{ 'selected-option': selectedOption === index && answered }"
              ></v-radio>
            </transition-group>
          </v-radio-group>

          <v-expand-transition>
            <div v-if="answered" class="explanation">
              <div class="text-h6 mb-3">
                {{ isCorrect ? '正解です！' : '不正解です。' }}
              </div>
              <p class="text-body-1">{{ question.explanation }}</p>
            </div>
          </v-expand-transition>
        </div>
      </transition>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="pa-4 pa-sm-6">
      <div class="d-flex justify-center w-100">
        <v-btn
          v-if="!answered"
          color="primary"
          size="large"
          min-width="200"
          :disabled="selectedOption === null"
          @click="handleAnswer"
        >
          回答する
        </v-btn>
        <v-btn
          v-else
          color="primary"
          size="large"
          min-width="200"
          @click="handleNext"
        >
          {{ isLastQuestion ? '結果を見る' : '次の問題へ' }}
        </v-btn>
      </div>
    </v-card-actions>

    <v-snackbar
      v-model="showIncompleteWarning"
      color="warning"
      timeout="4000"
      location="top"
    >
      すべての問題に回答してから結果画面に進んでください。
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="showIncompleteWarning = false">
          閉じる
        </v-btn>
      </template>
    </v-snackbar>
  </v-card>
</template>

<style scoped>
.quiz-card {
  border-radius: 12px;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.1);
  width: 100%;
  margin: 0 auto;
}

.quiz-content {
  width: 100%;
  max-width: 720px;
  margin: 0 auto;
  padding: 1rem;
}

.question-text {
  font-size: 1.25rem;
  line-height: 1.6;
  letter-spacing: 0.01em;
  color: rgba(var(--v-theme-on-surface), 0.87);
  margin-bottom: 2rem;
  text-align: center;
}

.options-container {
  width: 100%;
  max-width: 600px;
  margin: 0 auto;
}

.option-radio {
  border-radius: 8px;
  transition: all 0.3s ease;
  padding: 0.75rem;
  margin-bottom: 0.75rem;
  background-color: rgba(var(--v-theme-surface), 0.8);
}

.option-radio :deep(.v-label) {
  width: 100%;
  text-align: center;
  padding: 0.5rem;
  font-size: 1rem;
  line-height: 1.5;
}

.option-radio:hover:not(.v-radio--disabled) {
  background-color: rgba(var(--v-theme-surface), 0.9);
  transform: translateY(-2px);
}

.selected-option {
  background-color: rgba(var(--v-theme-surface), 1);
}

.explanation {
  background-color: rgb(var(--v-theme-surface));
  border-left: 4px solid rgb(var(--v-theme-primary));
  padding: 1.5rem;
  border-radius: 8px;
  margin: 2rem auto;
  max-width: 600px;
  text-align: center;
}

@media (min-width: 600px) {
  .quiz-content {
    padding: 1.5rem;
  }

  .question-text {
    font-size: 1.5rem;
    margin-bottom: 2.5rem;
  }

  .option-radio {
    padding: 1rem;
    margin-bottom: 1rem;
  }

  .explanation {
    padding: 2rem;
    margin: 2.5rem auto;
  }
}

@media (min-width: 960px) {
  .quiz-content {
    padding: 2rem;
  }

  .question-text {
    font-size: 1.75rem;
    margin-bottom: 3rem;
  }

  .option-radio {
    padding: 1.25rem;
    margin-bottom: 1.25rem;
  }

  .option-radio :deep(.v-label) {
    font-size: 1.125rem;
  }

  .explanation {
    padding: 2.5rem;
    margin: 3rem auto;
  }
}
</style>