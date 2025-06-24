<script setup lang="ts">
import { ref, computed } from 'vue';
import { useRouter } from 'vue-router';
import { useQuizStore } from '../stores/quizStore';
import { useHistoryStore } from '../stores/historyStore';
import { categories } from '../data/categories';
import type { QuizResult, QuizCategory } from '../types/quiz';

const router = useRouter();
const quizStore = useQuizStore();
const historyStore = useHistoryStore();

const categoryDialog = ref(false);
const selectedCategory = ref<QuizCategory | null>(null);

const recentHistory = computed(() => {
  return historyStore.quizHistory.slice(0, 3);
});

function selectCategory(category: QuizCategory) {
  selectedCategory.value = category;
  categoryDialog.value = true;
}

async function startQuiz(categoryId: string, subcategoryId: string) {
  console.log('categoryId:', categoryId);
  console.log('subcategoryId:', subcategoryId);
  console.log('router.push path:', `/quiz/${categoryId}/${subcategoryId}`);
  
  quizStore.startQuiz(categoryId, subcategoryId);
  await router.push(`/quiz/${categoryId}/${subcategoryId}`);
  categoryDialog.value = false;
}

function getCategoryName(categoryId: string): string {
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.name : categoryId;
}

function getSubcategoryName(categoryId: string, subcategoryId: string): string {
  const category = categories.value.find(c => c.id === categoryId);
  if (!category) return subcategoryId;
  
  const subcategory = category.subcategories.find(s => s.id === subcategoryId);
  return subcategory ? subcategory.name : subcategoryId;
}

function getCategoryIcon(categoryId: string): string {
  const category = categories.value.find(c => c.id === categoryId);
  return category ? category.icon : 'mdi-help-circle';
}

function formatDate(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('ja-JP', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function getCorrectCount(result: QuizResult): number {
  return result.answers.filter(answer => answer.isCorrect).length;
}

function getScoreColor(score: number): string {
  if (score >= 80) return 'success';
  if (score >= 60) return 'info';
  if (score >= 40) return 'warning';
  return 'error';
}
</script>

<template>
  <div class="home">
    <v-container class="py-8">
      <v-row justify="center">
        <v-col cols="12" sm="11" md="10" lg="8">
          <div class="text-h5 font-weight-bold mb-4 text-center">
            カテゴリを選択
          </div>
        </v-col>
      </v-row>

      <v-row justify="center">
        <v-col v-for="category in categories" :key="category.id" cols="12" sm="6" md="4" lg="3">
          <v-hover v-slot="{ isHovering, props }">
            <v-card
              v-bind="props"
              :color="isHovering ? category.color : ''"
              :class="{ 'on-hover': isHovering }"
              class="category-card"
              @click="selectCategory(category)"
            >
              <v-card-title class="d-flex align-center justify-center">
                <v-icon :color="isHovering ? 'white' : category.color" size="36" class="mr-3">
                  {{ category.icon }}
                </v-icon>
                <span :class="{ 'text-white': isHovering }">{{ category.name }}</span>
              </v-card-title>
              <v-card-text :class="{ 'text-white': isHovering }" class="text-center">
                {{ category.description }}
              </v-card-text>
              <v-card-actions class="justify-center">
                <v-btn
                  variant="tonal"
                  :color="isHovering ? 'white' : category.color"
                  :class="{ 'text-primary': isHovering }"
                >
                  サブカテゴリを選択
                </v-btn>
              </v-card-actions>
            </v-card>
          </v-hover>
        </v-col>
      </v-row>

      <v-row v-if="historyStore.quizHistory.length > 0" class="mt-8" justify="center">
        <v-col cols="12" sm="11" md="10" lg="8">
          <div class="d-flex justify-space-between align-center mb-4">
            <span class="text-h5 font-weight-bold">最近の履歴</span>
            <v-btn
              color="secondary"
              variant="text"
              prepend-icon="mdi-history"
              to="/history"
            >
              全ての履歴を見る
            </v-btn>
          </div>
          
          <v-card>
            <v-list lines="two">
              <v-list-item
                v-for="(result, index) in recentHistory"
                :key="result.id"
                :title="`${getCategoryName(result.category)} > ${getSubcategoryName(result.category, result.subcategory)} - スコア: ${result.score}%`"
                :subtitle="`${formatDate(result.date)} - 正解数: ${getCorrectCount(result)}/${result.totalQuestions}`"
                :prepend-icon="getCategoryIcon(result.category)"
                :color="index === 0 ? 'secondary' : ''"
                :variant="index === 0 ? 'flat' : 'text'"
              >
                <template v-slot:append>
                  <v-chip
                    :color="getScoreColor(result.score)"
                    text-color="white"
                    size="small"
                  >
                    {{ result.score }}%
                  </v-chip>
                </template>
              </v-list-item>
            </v-list>
          </v-card>
        </v-col>
      </v-row>
    </v-container>

    <v-dialog v-model="categoryDialog" max-width="800">
      <v-card v-if="selectedCategory">
        <v-card-title class="text-h5 d-flex align-center">
          <v-icon :color="selectedCategory.color" class="mr-3">{{ selectedCategory.icon }}</v-icon>
          {{ selectedCategory.name }} - サブカテゴリを選択
        </v-card-title>
        
        <v-card-text class="pa-6">
          <v-row>
            <v-col v-for="subcategory in selectedCategory.subcategories" :key="subcategory.id" cols="12" sm="6" md="4">
              <v-hover v-slot="{ isHovering, props }">
                <v-card
                  v-bind="props"
                  :color="isHovering ? subcategory.color : ''"
                  :class="{ 'on-hover': isHovering }"
                  class="subcategory-card"
                  @click="startQuiz(selectedCategory.id, subcategory.id)"
                >
                  <v-card-title class="d-flex align-center justify-center">
                    <v-icon :color="isHovering ? 'white' : subcategory.color" size="24" class="mr-2">
                      {{ subcategory.icon }}
                    </v-icon>
                    <span :class="{ 'text-white': isHovering }" class="text-body-1">{{ subcategory.name }}</span>
                  </v-card-title>
                  <v-card-text :class="{ 'text-white': isHovering }" class="text-center text-caption">
                    {{ subcategory.description }}
                  </v-card-text>
                  <v-card-actions class="justify-center">
                    <v-btn
                      variant="tonal"
                      :color="isHovering ? 'white' : subcategory.color"
                      :class="{ 'text-primary': isHovering }"
                      size="small"
                    >
                      開始
                    </v-btn>
                  </v-card-actions>
                </v-card>
              </v-hover>
            </v-col>
          </v-row>
        </v-card-text>

        <v-card-actions>
          <v-spacer></v-spacer>
          <v-btn color="grey-darken-1" variant="text" @click="categoryDialog = false">
            キャンセル
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>
  </div>
</template>

<style scoped>
.home {
  min-height: 100vh;
  padding: 1rem;
}

.category-card, .subcategory-card {
  transition: all 0.3s ease;
  height: 100%;
  display: flex;
  flex-direction: column;
  cursor: pointer;
}

.category-card.on-hover, .subcategory-card.on-hover {
  transform: translateY(-5px);
}

.category-card :deep(.v-card-title),
.subcategory-card :deep(.v-card-title) {
  flex-wrap: wrap;
  text-align: center;
}

.category-card :deep(.v-card-text),
.subcategory-card :deep(.v-card-text) {
  flex-grow: 1;
}

.category-card :deep(.v-card-actions),
.subcategory-card :deep(.v-card-actions) {
  padding: 1rem;
}

.subcategory-card {
  min-height: 180px;
}

@media (max-width: 600px) {
  .category-card :deep(.v-card-title),
  .subcategory-card :deep(.v-card-title) {
    font-size: 1.25rem;
  }

  .category-card :deep(.v-card-text),
  .subcategory-card :deep(.v-card-text) {
    font-size: 0.875rem;
  }
}
</style>