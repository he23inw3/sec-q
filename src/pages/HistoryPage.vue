<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useHistoryStore } from '../stores/historyStore';
import { useQuizStore } from '../stores/quizStore';
import { categories } from '../data/categories';
import type { QuizResult } from '../types/quiz';

const router = useRouter();
const historyStore = useHistoryStore();
const quizStore = useQuizStore();

const clearDialog = ref(false);
const selectedCategory = ref('');
const sortOption = ref('date-desc');

const quizHistory = computed(() => historyStore.quizHistory);

const categoryOptions = computed(() => {
  const uniqueCategories = [...new Set(quizHistory.value.map(result => result.category))];
  return uniqueCategories.map(categoryId => {
    const categoryInfo = categories.value.find(c => c.id === categoryId);
    return {
      title: categoryInfo?.name || categoryId,
      value: categoryId,
    };
  });
});

const sortOptions = [
  { title: '日付（新しい順）', value: 'date-desc' },
  { title: '日付（古い順）', value: 'date-asc' },
  { title: 'スコア（高い順）', value: 'score-desc' },
  { title: 'スコア（低い順）', value: 'score-asc' },
];

const filteredHistory = computed(() => {
  let results = selectedCategory.value 
    ? quizHistory.value.filter(result => result.category === selectedCategory.value)
    : [...quizHistory.value];
  
  const sortFunctions = {
    'date-desc': (a: QuizResult, b: QuizResult) => new Date(b.date).getTime() - new Date(a.date).getTime(),
    'date-asc': (a: QuizResult, b: QuizResult) => new Date(a.date).getTime() - new Date(b.date).getTime(),
    'score-desc': (a: QuizResult, b: QuizResult) => b.score - a.score,
    'score-asc': (a: QuizResult, b: QuizResult) => a.score - b.score,
  };
  
  return results.sort(sortFunctions[sortOption.value as keyof typeof sortFunctions]);
});

const formatDate = (dateString: string) => 
  new Date(dateString).toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });

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

const getCategoryName = (categoryId: string) => 
  categories.value.find(c => c.id === categoryId)?.name || categoryId;

const getSubcategoryName = (categoryId: string, subcategoryId: string) => {
  const category = categories.value.find(c => c.id === categoryId);
  return category?.subcategories.find(s => s.id === subcategoryId)?.name || subcategoryId;
};

const getCategoryColor = (categoryId: string) => 
  categories.value.find(c => c.id === categoryId)?.color || 'primary';

const getCorrectCount = (result: QuizResult) => 
  result.answers.filter(answer => answer.isCorrect).length;

const getReviewCount = (result: QuizResult) => 
  result.reviewAnswers?.reduce((total, review) => total + review.reviewAnswers.length, 0) || 0;

const getScoreColor = (score: number) => {
  if (score >= 80) return 'success';
  if (score >= 60) return 'info';
  if (score >= 40) return 'warning';
  return 'error';
};

function clearHistory() {
  historyStore.clearHistory();
  clearDialog.value = false;
}

function viewResult(result: QuizResult) {
  quizStore.updateResult(result);
  router.push(`/result/${result.category}/${result.subcategory}`);
}

function retryQuiz(category: string, subcategory: string) {
  quizStore.startQuiz(category, subcategory);
  router.push(`/quiz/${category}/${subcategory}`);
}
</script>

<template>
  <div class="history-view">
    <v-container class="py-8">
      <v-row justify="center">
        <v-col cols="12">
          <v-card>
            <v-card-title class="text-h4 font-weight-bold primary text-white py-4 text-center">
              クイズ履歴
            </v-card-title>

            <v-card-text class="pa-6">
              <v-row v-if="quizHistory.length > 0" justify="center">
                <v-col cols="12" sm="6" md="4">
                  <v-select
                    v-model="selectedCategory"
                    :items="categoryOptions"
                    label="カテゴリでフィルター"
                    variant="outlined"
                    clearable
                    prepend-icon="mdi-filter"
                  ></v-select>
                </v-col>
                
                <v-col cols="12" sm="6" md="4">
                  <v-select
                    v-model="sortOption"
                    :items="sortOptions"
                    label="並び替え"
                    variant="outlined"
                    prepend-icon="mdi-sort"
                  ></v-select>
                </v-col>

                <v-col cols="12" class="d-flex justify-end">
                  <v-btn
                    color="error"
                    prepend-icon="mdi-delete"
                    variant="outlined"
                    @click="clearDialog = true"
                    :disabled="quizHistory.length === 0"
                  >
                    履歴をクリア
                  </v-btn>
                </v-col>
              </v-row>

              <div class="mt-4">
                <v-table v-if="filteredHistory.length > 0">
                  <thead>
                    <tr>
                      <th class="text-center">日時</th>
                      <th class="text-center">カテゴリ</th>
                      <th class="text-center">スコア</th>
                      <th class="text-center">正解数</th>
                      <th class="text-center">復習回数</th>
                      <th class="text-center">所要時間</th>
                      <th class="text-center">アクション</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="result in filteredHistory" :key="result.id">
                      <td class="text-center">{{ formatDate(result.date) }}</td>
                      <td class="text-center">
                        <v-chip
                          :color="getCategoryColor(result.category)"
                          text-color="white"
                          size="small"
                        >
                          {{ getCategoryName(result.category) }} > {{ getSubcategoryName(result.category, result.subcategory) }}
                        </v-chip>
                      </td>
                      <td class="text-center">
                        <v-chip
                          :color="getScoreColor(result.score)"
                          text-color="white"
                          size="small"
                        >
                          {{ result.score }}%
                        </v-chip>
                      </td>
                      <td class="text-center">{{ getCorrectCount(result) }} / {{ result.totalQuestions }}</td>
                      <td class="text-center">
                        <v-chip
                          v-if="getReviewCount(result) > 0"
                          color="info"
                          text-color="white"
                          size="small"
                        >
                          {{ getReviewCount(result) }}回
                        </v-chip>
                        <span v-else class="text-grey">-</span>
                      </td>
                      <td class="text-center">{{ formatTime(result.timeTaken) }}</td>
                      <td class="text-center">
                        <v-btn
                          icon="mdi-eye"
                          color="info"
                          size="small"
                          variant="text"
                          @click="viewResult(result)"
                          title="結果を確認する"
                          class="mr-1"
                        ></v-btn>
                        <v-btn
                          icon="mdi-refresh"
                          color="primary"
                          size="small"
                          variant="text"
                          @click="retryQuiz(result.category, result.subcategory)"
                          title="もう一度挑戦する"
                        ></v-btn>
                      </td>
                    </tr>
                  </tbody>
                </v-table>

                <div v-else class="text-center pa-8">
                  <v-icon size="64" color="grey-lighten-1" class="mb-4">mdi-history</v-icon>
                  <h3 class="text-h5 text-grey-darken-1">
                    {{ quizHistory.length === 0 ? '履歴がありません' : '該当する履歴がありません' }}
                  </h3>
                  <p class="text-body-1 text-grey-darken-1 mt-2">
                    {{ quizHistory.length === 0 
                      ? 'クイズに挑戦して履歴を作成しましょう！' 
                      : 'フィルターを変更して他の履歴を探してみてください。' }}
                  </p>
                  <v-btn
                    v-if="quizHistory.length === 0"
                    color="primary"
                    class="mt-4"
                    prepend-icon="mdi-play"
                    to="/"
                  >
                    クイズを始める
                  </v-btn>
                </div>
              </div>
            </v-card-text>

            <v-divider v-if="quizHistory.length > 0"></v-divider>

            <v-card-actions v-if="quizHistory.length > 0" class="pa-4 justify-center">
              <v-btn prepend-icon="mdi-home" variant="text" to="/">
                ホームに戻る
              </v-btn>
            </v-card-actions>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="clearDialog" max-width="500">
      <v-card>
        <v-card-title class="text-h5">履歴を削除しますか？</v-card-title>
        <v-card-text>
          この操作は取り消せません。すべてのクイズ履歴が削除されます。
        </v-card-text>
        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="clearDialog = false">
            キャンセル
          </v-btn>
          <v-btn color="error" variant="flat" @click="clearHistory">
            削除する
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.history-view {
  min-height: 100vh;
  padding: 1rem;
}

@media (max-width: 600px) {
  .v-table {
    font-size: 0.875rem;
  }

  .v-chip {
    font-size: 0.75rem;
  }
}
</style>