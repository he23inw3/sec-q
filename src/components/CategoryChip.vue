<script setup lang="ts">
import { computed } from 'vue';
import { categories } from '../data/categories';

const props = defineProps<{
  categoryId: string;
  subcategoryId?: string;
  size?: 'small' | 'default' | 'large';
}>();

const category = computed(() => {
  return categories.value.find(c => c.id === props.categoryId);
});

const subcategory = computed(() => {
  if (!props.subcategoryId || !category.value) return null;
  return category.value.subcategories.find(s => s.id === props.subcategoryId);
});

const displayText = computed(() => {
  if (subcategory.value) {
    return `${category.value?.name} > ${subcategory.value.name}`;
  }
  return category.value?.name || props.categoryId;
});
</script>

<template>
  <v-chip
    :color="subcategory?.color || category?.color || 'primary'"
    text-color="white"
    :size="size"
  >
    <v-icon v-if="subcategory?.icon || category?.icon" start>
      {{ subcategory?.icon || category?.icon }}
    </v-icon>
    {{ displayText }}
  </v-chip>
</template>