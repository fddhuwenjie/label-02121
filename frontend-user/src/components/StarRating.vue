<template>
  <div class="star-rating" :class="{ interactive: modelValue !== undefined }">
    <div v-for="star in 5" :key="star" class="star" :class="{
      filled: getStarState(star) === 'filled',
      half: getStarState(star) === 'half',
      hovered: hoverStar >= star && modelValue !== undefined
    }" @mouseenter="handleMouseEnter(star)" @mouseleave="handleMouseLeave" @click="handleClick(star)">
      <div class="star-shape"></div>
    </div>
    <span v-if="showValue && rating > 0" class="rating-value">{{ rating.toFixed(1) }}</span>
    <span v-if="showCount && count !== undefined" class="review-count">({{ count }}条评价)</span>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'

const props = defineProps({
  modelValue: { type: Number, default: undefined },
  rating: { type: Number, default: 0 },
  showValue: { type: Boolean, default: false },
  showCount: { type: Boolean, default: false },
  count: { type: Number, default: undefined }
})

const emit = defineEmits(['update:modelValue'])

const hoverStar = ref(0)

const getStarState = (star) => {
  const currentRating = hoverStar.value || props.rating || props.modelValue || 0
  if (star <= Math.floor(currentRating)) return 'filled'
  if (star - 0.5 <= currentRating) return 'half'
  return 'empty'
}

const handleMouseEnter = (star) => {
  if (props.modelValue !== undefined) {
    hoverStar.value = star
  }
}

const handleMouseLeave = () => {
  hoverStar.value = 0
}

const handleClick = (star) => {
  if (props.modelValue !== undefined) {
    emit('update:modelValue', star)
  }
}
</script>

<style scoped>
.star-rating {
  display: flex;
  align-items: center;
  gap: 2px;
}

.star-rating.interactive {
  cursor: pointer;
}

.star {
  position: relative;
  width: 20px;
  height: 20px;
  overflow: hidden;
}

.star-shape {
  width: 100%;
  height: 100%;
  background: #ddd;
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
  transition: background 0.2s;
}

.star.filled .star-shape {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.star.half .star-shape {
  background: linear-gradient(90deg, #fbbf24 50%, #ddd 50%);
}

.star.hovered .star-shape {
  background: linear-gradient(135deg, #fcd34d, #fbbf24);
  transform: scale(1.1);
}

.rating-value {
  margin-left: 8px;
  font-size: 14px;
  font-weight: 700;
  color: #f59e0b;
}

.review-count {
  margin-left: 4px;
  font-size: 12px;
  color: #6c757d;
}
</style>
