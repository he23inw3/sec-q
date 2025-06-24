<script setup lang="ts">
import { computed } from 'vue';
import type { QuizQuestion, QuizAnswer, ReviewAnswer } from '../types/quiz';

const props = defineProps<{
  questions: QuizQuestion[];
  originalAnswers: QuizAnswer[];
  reviewAnswers: ReviewAnswer[];
}>();

interface QuestionStat {
  id: number;
  originalCorrect: boolean;
  reviewCount: number;
  bestScore: boolean;
  improved: boolean;
}

const questionStats = computed((): QuestionStat[] => {
  return props.questions.map(question => {
    const originalAnswer = props.originalAnswers.find(a => a.questionId === question.id);
    const reviewAnswer = props.reviewAnswers.find(r => r.questionId === question.id);
    
    return {
      id: question.id,
      originalCorrect: originalAnswer?.isCorrect || false,
      reviewCount: reviewAnswer?.reviewAnswers.length || 0,
      bestScore: reviewAnswer?.bestScore || false,
      improved: !originalAnswer?.isCorrect && (reviewAnswer?.bestScore || false)
    };
  });
});

const totalReviews = computed(() => {
  return props.reviewAnswers.reduce((total, review) => total + review.reviewAnswers.length, 0);
});

const improvedQuestions = computed(() => {
  return questionStats.value.filter(q => q.improved).length;
});

const improvementRate = computed(() => {
  const incorrectQuestions = questionStats.value.filter(q => !q.originalCorrect).length;
  if (incorrectQuestions === 0) return 100;
  return Math.round((improvedQuestions.value / incorrectQuestions) * 100);
});

const averageAttempts = computed(() => {
  const reviewedQuestions = questionStats.value.filter(q => q.reviewCount > 0);
  if (reviewedQuestions.length === 0) return 0;
  const totalAttempts = reviewedQuestions.reduce((total, q) => total + q.reviewCount, 0);
  return Math.round((totalAttempts / reviewedQuestions.length) * 10) / 10;
});

function getQuestionStatusColor(question: QuestionStat): string {
  if (question.improved) return 'success';
  if (question.originalCorrect) return 'info';
  if (question.reviewCount > 0) return 'warning';
  return 'error';
}

function getQuestionStatusIcon(question: QuestionStat): string {
  if (question.improved) return 'mdi-trending-up';
  if (question.originalCorrect) return 'mdi-check';
  if (question.reviewCount > 0) return 'mdi-refresh';
  return 'mdi-close';
}

function getQuestionStatusText(question: QuestionStat): string {
  if (question.improved) return '復習で改善しました';
  if (question.originalCorrect) return '最初から正解でした';
  if (question.reviewCount > 0) return '復習中です';
  return '未復習です';
}
</script>

<template>
  <v-card class="review-statistics mb-6">
    <v-card-title class="text-h5 font-weight-bold primary text-white py-4 text-center">
      <v-icon class="mr-2">mdi-chart-line</v-icon>
      復習統計
    </v-card-title>

    <v-card-text class="pa-6">
      <v-row>
        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="text-center pa-4">
            <v-icon size="48" color="primary" class="mb-2">mdi-refresh</v-icon>
            <div class="text-h4 font-weight-bold">{{ totalReviews }}</div>
            <div class="text-body-2 text-grey-darken-1">総復習回数</div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="text-center pa-4">
            <v-icon size="48" color="success" class="mb-2">mdi-check-circle</v-icon>
            <div class="text-h4 font-weight-bold">{{ improvedQuestions }}</div>
            <div class="text-body-2 text-grey-darken-1">改善した問題</div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="text-center pa-4">
            <v-icon size="48" color="info" class="mb-2">mdi-percent</v-icon>
            <div class="text-h4 font-weight-bold">{{ improvementRate }}%</div>
            <div class="text-body-2 text-grey-darken-1">改善率</div>
          </v-card>
        </v-col>

        <v-col cols="12" sm="6" md="3">
          <v-card variant="outlined" class="text-center pa-4">
            <v-icon size="48" color="warning" class="mb-2">mdi-star</v-icon>
            <div class="text-h4 font-weight-bold">{{ averageAttempts }}</div>
            <div class="text-body-2 text-grey-darken-1">平均復習回数</div>
          </v-card>
        </v-col>
      </v-row>

      <v-divider class="my-6"></v-divider>

      <div class="text-h6 font-weight-bold mb-4">問題別復習状況</div>
      <v-list>
        <v-list-item
          v-for="(question, index) in questionStats"
          :key="question.id"
          :title="`問題 ${index + 1}`"
          :subtitle="getQuestionStatusText(question)"
        >
          <template v-slot:prepend>
            <v-avatar :color="getQuestionStatusColor(question)" size="small">
              <v-icon color="white" size="small">{{ getQuestionStatusIcon(question) }}</v-icon>
            </v-avatar>
          </template>
          <template v-slot:append>
            <v-chip
              :color="getQuestionStatusColor(question)"
              text-color="white"
              size="small"
            >
              {{ question.reviewCount }}回復習
            </v-chip>
          </template>
        </v-list-item>
      </v-list>
    </v-card-text>
  </v-card>
</template>

<style scoped>
.review-statistics {
  border-radius: 12px;
  overflow: hidden;
}

@media (max-width: 600px) {
  .text-h4 {
    font-size: 1.5rem !important;
  }
}
</style>