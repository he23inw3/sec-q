<script setup lang="ts">
import { ref, computed } from 'vue';
import type { QuizQuestion, QuizAnswer, ReviewAnswer } from '../types/quiz';

const props = defineProps<{
  question: QuizQuestion;
  questionNumber: number;
  originalAnswer: QuizAnswer;
  reviewAnswer?: ReviewAnswer;
}>();

const emit = defineEmits<{
  (e: 'review-answer', questionId: number, selectedOption: number): void;
}>();

const isReviewMode = ref(false);
const selectedReviewOption = ref<number | null>(null);
const reviewPanel = ref<number[]>([]);

const hasBestScore = computed(() => props.reviewAnswer?.bestScore ?? false);
const isOriginalCorrect = computed(() => props.originalAnswer.isCorrect);

const cardColor = computed(() => 
  hasBestScore.value || isOriginalCorrect.value ? 'success-lighten-5' : 'error-lighten-5'
);

const statusColor = computed(() => 
  hasBestScore.value ? 'success' : (isOriginalCorrect.value ? 'success' : 'error')
);

const statusIcon = computed(() => 
  hasBestScore.value ? 'mdi-star' : (isOriginalCorrect.value ? 'mdi-check-circle' : 'mdi-close-circle')
);

const statusText = computed(() => 
  hasBestScore.value ? '復習で正解' : (isOriginalCorrect.value ? '正解' : '不正解')
);

function getOptionIcon(index: number, selectedOption: number, isCorrect: boolean): string {
  if (props.question.correctAnswer === index) return 'mdi-check-circle';
  if (selectedOption === index && !isCorrect) return 'mdi-close-circle';
  return 'mdi-circle-outline';
}

function getOptionClass(index: number, selectedOption: number, isCorrect: boolean): string {
  if (props.question.correctAnswer === index) return 'text-success';
  if (selectedOption === index && !isCorrect) return 'text-error';
  return '';
}

function startReview() {
  isReviewMode.value = true;
  selectedReviewOption.value = null;
}

function cancelReview() {
  isReviewMode.value = false;
  selectedReviewOption.value = null;
}

function submitReview() {
  if (selectedReviewOption.value !== null) {
    emit('review-answer', props.question.id, selectedReviewOption.value);
    isReviewMode.value = false;
    selectedReviewOption.value = null;
  }
}
</script>

<template>
  <v-card class="review-question-card mb-4" :color="cardColor" variant="outlined">
    <v-card-title class="d-flex align-center justify-space-between">
      <div class="d-flex align-center">
        <v-icon :color="statusColor" class="mr-2">{{ statusIcon }}</v-icon>
        <span class="text-h6">問題 {{ questionNumber }}</span>
      </div>
      <v-chip :color="statusColor" text-color="white" size="small">
        {{ statusText }}
      </v-chip>
    </v-card-title>

    <v-card-text class="pa-4">
      <h3 class="text-body-1 font-weight-bold mb-4">{{ question.question }}</h3>

      <div class="mb-4">
        <h4 class="text-subtitle-1 font-weight-bold mb-2">
          <v-icon class="mr-1" size="small">mdi-history</v-icon>
          最初の回答
        </h4>
        <v-list density="compact" class="bg-transparent">
          <v-list-item
            v-for="(option, index) in question.options"
            :key="`original-${index}`"
            :prepend-icon="getOptionIcon(index, originalAnswer.selectedOption, originalAnswer.isCorrect)"
            :title="option"
            :class="getOptionClass(index, originalAnswer.selectedOption, originalAnswer.isCorrect)"
            density="compact"
          >
            <template v-slot:append>
              <v-chip
                v-if="index === originalAnswer.selectedOption"
                :color="originalAnswer.isCorrect ? 'success' : 'error'"
                text-color="white"
                size="x-small"
              >
                あなたの回答
              </v-chip>
              <v-chip
                v-else-if="index === question.correctAnswer"
                color="success"
                text-color="white"
                size="x-small"
              >
                正解
              </v-chip>
            </template>
          </v-list-item>
        </v-list>
      </div>

      <div v-if="reviewAnswer?.reviewAnswers.length" class="mb-4">
        <h4 class="text-subtitle-1 font-weight-bold mb-2">
          <v-icon class="mr-1" size="small">mdi-refresh</v-icon>
          復習の履歴 ({{ reviewAnswer.reviewAnswers.length }}回)
        </h4>
        <v-expansion-panels v-model="reviewPanel" multiple variant="accordion">
          <v-expansion-panel
            v-for="(review, reviewIndex) in reviewAnswer.reviewAnswers"
            :key="`review-${reviewIndex}`"
            :title="`復習 ${reviewIndex + 1}回目 - ${review.isCorrect ? '正解' : '不正解'}`"
            :bg-color="review.isCorrect ? 'success-lighten-5' : 'error-lighten-5'"
          >
            <v-expansion-panel-text>
              <v-list density="compact" class="bg-transparent">
                <v-list-item
                  v-for="(option, index) in question.options"
                  :key="`review-${reviewIndex}-${index}`"
                  :prepend-icon="getOptionIcon(index, review.selectedOption, review.isCorrect)"
                  :title="option"
                  :class="getOptionClass(index, review.selectedOption, review.isCorrect)"
                  density="compact"
                >
                  <template v-slot:append>
                    <v-chip
                      v-if="index === review.selectedOption"
                      :color="review.isCorrect ? 'success' : 'error'"
                      text-color="white"
                      size="x-small"
                    >
                      復習回答
                    </v-chip>
                  </template>
                </v-list-item>
              </v-list>
            </v-expansion-panel-text>
          </v-expansion-panel>
        </v-expansion-panels>
      </div>

      <div v-if="isReviewMode" class="mb-4">
        <h4 class="text-subtitle-1 font-weight-bold mb-2">
          <v-icon class="mr-1" size="small">mdi-pencil</v-icon>
          もう一度解答してください
        </h4>
        <v-radio-group v-model="selectedReviewOption" class="mt-2">
          <v-radio
            v-for="(option, index) in question.options"
            :key="`review-option-${index}`"
            :value="index"
            :label="option"
            color="primary"
            class="mb-2"
          ></v-radio>
        </v-radio-group>
      </div>

      <v-card class="mt-4 pa-3" variant="outlined" color="info">
        <v-card-text>
          <div class="d-flex align-center mb-2">
            <v-icon color="info" class="mr-2">mdi-lightbulb-outline</v-icon>
            <strong>解説</strong>
          </div>
          <p class="text-body-2 mb-0">{{ question.explanation }}</p>
        </v-card-text>
      </v-card>
    </v-card-text>

    <v-divider></v-divider>

    <v-card-actions class="pa-4">
      <v-spacer></v-spacer>
      <v-btn
        v-if="!isReviewMode"
        color="primary"
        prepend-icon="mdi-refresh"
        @click="startReview"
      >
        もう一度解く
      </v-btn>
      <template v-else>
        <v-btn color="grey" variant="text" @click="cancelReview">
          キャンセル
        </v-btn>
        <v-btn
          color="primary"
          :disabled="selectedReviewOption === null"
          @click="submitReview"
        >
          回答する
        </v-btn>
      </template>
    </v-card-actions>
  </v-card>
</template>

<style scoped>
.review-question-card {
  border-radius: 12px;
  overflow: hidden;
}

.review-question-card :deep(.v-expansion-panel-title) {
  font-size: 0.875rem;
}

@media (max-width: 600px) {
  .review-question-card :deep(.v-card-title) {
    flex-direction: column;
    align-items: flex-start;
    gap: 0.5rem;
  }
}
</style>