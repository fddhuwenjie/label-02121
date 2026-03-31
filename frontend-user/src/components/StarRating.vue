<template>
  <div class="star-rating" :class="{ interactive }">
    <div class="stars-container">
      <div class="stars-background">
        <div v-for="i in 5" :key="i" class="star" @click="interactive && setRating(i)" @mouseenter="interactive && setHover(i)" @mouseleave="interactive && setHover(0)"></div>
      </div>
      <div class="stars-foreground" :style="{ width: `${fillPercent}%` }">
        <div v-for="i in 5" :key="i" class="star"></div>
      </div>
    </div>
    <span v-if="showCount && count !== undefined" class="review-count">({{ count }})</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  },
  interactive: {
    type: Boolean,
    default: false
  },
  showCount: {
    type: Boolean,
    default: false
  },
  count: {
    type: Number,
    default: 0
  }
})

const emit = defineEmits(['update:modelValue'])

const hoverRating = ref(0)

const fillPercent = computed(() => {
  const rating = props.interactive ? (hoverRating.value || props.modelValue) : props.modelValue
  return (rating / 5) * 100
})

const setRating = (value) => {
  emit('update:modelValue', value)
}

const setHover = (value) => {
  hoverRating.value = value
}
</script>

<style scoped>
.star-rating {
  display: flex;
  align-items: center;
  gap: 6px;
}

.stars-container {
  position: relative;
  display: inline-flex;
  width: 100px;
  height: 20px;
}

.stars-background,
.stars-foreground {
  display: flex;
  position: absolute;
  top: 0;
  left: 0;
  height: 100%;
}

.stars-background {
  width: 100%;
}

.stars-foreground {
  overflow: hidden;
}

.star {
  position: relative;
  width: 20px;
  height: 20px;
  cursor: pointer;
  background-color: #d1d5db;
  clip-path: polygon(
    50% 0%,
    61% 35%,
    98% 35%,
    68% 57%,
    79% 91%,
    50% 70%,
    21% 91%,
    32% 57%,
    2% 35%,
    39% 35%
  );
}

.stars-foreground .star {
  background-color: #fbbf24;
}

.interactive .star:hover {
  background-color: #f59e0b;
}

.review-count {
  font-size: 12px;
  color: #6c757d;
}
</style>
