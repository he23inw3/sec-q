<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useQuizStore } from '../stores/quizStore';
import { useHistoryStore } from '../stores/historyStore';
import { categories } from '../data/categories';
import type { QuizAnswer, ReviewAnswer } from '../types/quiz';
import ReviewQuestionCard from '../components/ReviewQuestionCard.vue';
import ReviewStatistics from '../components/ReviewStatistics.vue';

const route = useRoute();
const router = useRouter();
const quizStore = useQuizStore();
const historyStore = useHistoryStore();

const reviewSnackbar = ref(false);
const reviewSnackbarText = ref('');
const reviewSnackbarColor = ref('success');

const currentCategory = computed(() => route.params.category as string);
const currentSubcategory = computed(() => route.params.subcategory as string);
const quizResult = computed(() => quizStore.result);
const answers = computed(() => quizStore.answers);
const quizData = computed(() => quizStore.quizData);

const categoryInfo = computed(() => 
  categories.value.find(c => c.id === currentCategory.value)
);

const subcategoryInfo = computed(() => 
  categoryInfo.value?.subcategories.find(s => s.id === currentSubcategory.value)
);

const categoryName = computed(() => categoryInfo.value?.name || '');
const subcategoryName = computed(() => subcategoryInfo.value?.name || '');
const correctAnswers = computed(() => answers.value.filter(a => a.isCorrect).length);
const hasReviewAnswers = computed(() => (quizResult.value?.reviewAnswers?.length || 0) > 0);

onMounted(() => {
  if (!quizResult.value || !quizStore.isQuizCompleted) {
    console.warn('No valid quiz result found, redirecting to home');
    router.push('/');
    return;
  }
  
  historyStore.addResult(quizResult.value);
});

const getScoreColor = (score: number) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'info';
  if (score >= 40) return 'warning';
  return 'error';
};

const getScoreMessage = (score: number) => {
  if (score >= 80) return '素晴らしい！';
  if (score >= 60) return '良く頑張りました！';
  if (score >= 40) return 'もう少し頑張りましょう！';
  return 'もっと勉強しましょう！';
};

const formatTime = (ms: number) => {
  if (!ms || ms < 0) return '0分 0秒';

  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) return `${hours}時間 ${minutes}分 ${seconds}秒`;
  if (minutes > 0) return `${minutes}分 ${seconds}秒`;
  return `${seconds}秒`;
};

const formatDate = (dateString: string) => {
  if (!dateString) return '';
  
  return new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
};

const getOriginalAnswer = (questionId: number): QuizAnswer => 
  answers.value.find(a => a.questionId === questionId) || {
    questionId,
    selectedOption: -1,
    isCorrect: false
  };

const getReviewAnswer = (questionId: number): ReviewAnswer | undefined => 
  quizResult.value?.reviewAnswers?.find(r => r.questionId === questionId);

function handleReviewAnswer(questionId: number, selectedOption: number) {
  if (!quizResult.value || !quizData.value) return;

  const question = quizData.value.questions.find(q => q.id === questionId);
  if (!question) return;

  const isCorrect = selectedOption === question.correctAnswer;
  
  historyStore.addReviewAnswer(quizResult.value.id, questionId, selectedOption, question.correctAnswer);

  reviewSnackbarColor.value = isCorrect ? 'success' : 'error';
  reviewSnackbarText.value = isCorrect 
    ? '正解です！よく頑張りました！' 
    : '不正解です。解説を確認して再度挑戦してみてください。';
  reviewSnackbar.value = true;

  const updatedResult = historyStore.getResultById(quizResult.value.id);
  if (updatedResult) {
    quizStore.updateResult(updatedResult);
  }
}

async function goToHome() {
  quizStore.resetQuiz();
  await router.push('/');
}

async function retryQuiz() {
  quizStore.startQuiz(currentCategory.value, currentSubcategory.value);
  await router.push(`/quiz/${currentCategory.value}/${currentSubcategory.value}`);
}
</script>

<template>
  <div class="result-view">
    <v-container class="py-8">
      <v-row justify="center">
        <v-col cols="12">
          <v-card v-if="quizResult">
            <v-card-title class="text-h4 font-weight-bold primary text-white py-4 text-center">
              クイズ結果
            </v-card-title>

            <v-card-text class="pa-6">
              <v-row justify="center" class="mb-6">
                <v-col cols="12" sm="6" class="text-center">
                  <v-sheet
                    :color="getScoreColor(quizResult.score)"
                    class="pa-4 rounded-circle d-inline-flex justify-center align-center"
                    width="150"
                    height="150"
                  >
                    <div class="text-h3 font-weight-bold text-white">{{ quizResult.score }}%</div>
                  </v-sheet>
                  <h3 class="text-h6 mt-3">{{ getScoreMessage(quizResult.score) }}</h3>
                </v-col>

                <v-col cols="12" sm="6">
                  <v-list density="compact" class="bg-transparent">
                    <v-list-item prepend-icon="mdi-book">
                      <template v-slot:title>
                        <span class="font-weight-bold">カテゴリ:</span> {{ categoryName }} > {{ subcategoryName }}
                      </template>
                    </v-list-item>
                    
                    <v-list-item prepend-icon="mdi-check-circle">
                      <template v-slot:title>
                        <span class="font-weight-bold">正解数:</span> 
                        {{ correctAnswers }} / {{ quizResult.totalQuestions }}
                      </template>
                    </v-list-item>
                    
                    <v-list-item prepend-icon="mdi-clock-outline">
                      <template v-slot:title>
                        <span class="font-weight-bold">所要時間:</span> 
                        {{ formatTime(quizResult.timeTaken) }}
                      </template>
                    </v-list-item>
                    
                    <v-list-item prepend-icon="mdi-calendar">
                      <template v-slot:title>
                        <span class="font-weight-bold">日時:</span> 
                        {{ formatDate(quizResult.date) }}
                      </template>
                    </v-list-item>
                  </v-list>
                </v-col>
              </v-row>

              <v-divider class="mb-6"></v-divider>

              <!-- Review Statistics -->
              <review-statistics
                v-if="quizResult && quizData && hasReviewAnswers"
                :questions="quizData.questions"
                :original-answers="quizResult.answers"
                :review-answers="quizResult.reviewAnswers || []"
              />

              <h3 class="text-h5 mb-4 text-center">問題の詳細と復習</h3>

              <div v-if="quizData" class="questions-container">
                <review-question-card
                  v-for="(question, index) in quizData.questions"
                  :key="question.id"
                  :question="question"
                  :question-number="index + 1"
                  :original-answer="getOriginalAnswer(question.id)"
                  :review-answer="getReviewAnswer(question.id)"
                  @review-answer="handleReviewAnswer"
                />
              </div>
            </v-card-text>

            <v-divider></v-divider>

            <v-card-actions class="pa-4 justify-center">
              <v-btn prepend-icon="mdi-home" variant="text" @click="goToHome" class="mx-2">
                ホームに戻る
              </v-btn>
              
              <v-btn color="primary" prepend-icon="mdi-reload" @click="retryQuiz" class="mx-2">
                もう一度挑戦する
              </v-btn>
            </v-card-actions>
          </v-card>

          <!-- Error state -->
          <v-card v-else>
            <v-card-title class="text-h4 font-weight-bold error text-white py-4 text-center">
              エラー
            </v-card-title>
            <v-card-text class="pa-6 text-center">
              <v-icon size="64" color="error" class="mb-4">mdi-alert-circle</v-icon>
              <h3 class="text-h5 mb-4">クイズ結果が見つかりません</h3>
              <p class="text-body-1 mb-4">
                クイズが完了していないか、データが正しく保存されていません。
              </p>
              <v-btn color="primary" prepend-icon="mdi-home" @click="goToHome">
                ホームに戻る
              </v-btn>
            </v-card-text>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <!-- Review Success Snackbar -->
    <v-snackbar
      v-model="reviewSnackbar"
      :color="reviewSnackbarColor"
      timeout="3000"
      location="top"
    >
      {{ reviewSnackbarText }}
      <template v-slot:actions>
        <v-btn color="white" variant="text" @click="reviewSnackbar = false">
          閉じる
        </v-btn>
      </template>
    </v-snackbar>
  </div>
</template>

<style scoped>
.result-view {
  min-height: 100vh;
  padding: 1rem;
}

.questions-container {
  max-width: 900px;
  margin: 0 auto;
}

@media (max-width: 600px) {
  .v-sheet {
    width: 120px !important;
    height: 120px !important;
  }

  .text-h3 {
    font-size: 1.75rem !important;
  }
}
</style>