<script setup lang="ts">
import { computed } from 'vue';

const props = defineProps<{
  score: number;
}>();

const scoreColor = computed(() => {
  if (props.score >= 80) return 'success';
  if (props.score >= 60) return 'info';
  if (props.score >= 40) return 'warning';
  return 'error';
});

const scoreMessage = computed(() => {
  if (props.score >= 80) return '素晴らしい！';
  if (props.score >= 60) return '良く頑張りました！';
  if (props.score >= 40) return 'もう少し頑張りましょう！';
  return 'もっと勉強しましょう！';
});
</script>

<template>
  <div class="score-display">
    <v-sheet
      :color="scoreColor"
      class="pa-4 rounded-circle d-inline-flex justify-center align-center"
      width="150"
      height="150"
    >
      <div class="text-h3 font-weight-bold text-white">{{ score }}%</div>
    </v-sheet>
    <h3 class="text-h6 mt-3">{{ scoreMessage }}</h3>
  </div>
</template>

<style scoped>
.score-display {
  text-align: center;
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