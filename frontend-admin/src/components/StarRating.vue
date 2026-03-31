<template>
  <div class="star-rating" :class="{ editable }">
    <span 
      v-for="star in 5" 
      :key="star"
      class="star"
      :class="{ active: star <= currentRating, hover: editable && star <= hoverRating }"
      @mouseenter="editable && (hoverRating = star)"
      @mouseleave="editable && (hoverRating = 0)"
      @click="editable && (currentRating = star)"
    ></span>
    <span v-if="showValue" class="rating-value">{{ currentRating }}</span>
  </div>
</template>

<script setup>
import { ref, watch } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  editable: {
    type: Boolean,
    default: false
  },
  showValue: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['update:modelValue'])

const currentRating = ref(props.modelValue)
const hoverRating = ref(0)

watch(() => props.modelValue, (newVal) => {
  currentRating.value = newVal
})

watch(currentRating, (newVal) => {
  emit('update:modelValue', newVal)
})
</script>

<style scoped>
.star-rating {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.star {
  cursor: default;
  position: relative;
  display: inline-block;
  width: 24px;
  height: 24px;
  transition: transform 0.2s;
}

.star::before,
.star::after {
  content: '';
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background: #d1d5db;
  transition: background 0.2s;
  clip-path: polygon(50% 0%, 61% 35%, 98% 35%, 68% 57%, 79% 91%, 50% 70%, 21% 91%, 32% 57%, 2% 35%, 39% 35%);
}

.star-rating.editable .star {
  cursor: pointer;
}

.star.active::before,
.star.active::after,
.star.hover::before,
.star.hover::after {
  background: #f59e0b;
}

.star-rating.editable .star:hover {
  transform: scale(1.15);
}

.rating-value {
  margin-left: 8px;
  font-weight: 600;
  color: #374151;
}
</style>
