<template>
  <div class="star-rating">
    <div v-for="star in 5" :key="star" class="star" :class="{
      filled: getStarState(star) === 'filled',
      half: getStarState(star) === 'half'
    }">
      <div class="star-shape"></div>
    </div>
    <span v-if="showValue && rating > 0" class="rating-value">{{ rating.toFixed(1) }}</span>
  </div>
</template>

<script setup>
const props = defineProps({
  rating: { type: Number, default: 0 },
  showValue: { type: Boolean, default: false }
})

const getStarState = (star) => {
  const currentRating = props.rating || 0
  if (star <= Math.floor(currentRating)) return 'filled'
  if (star - 0.5 <= currentRating) return 'half'
  return 'empty'
}
</script>

<style scoped>
.star-rating {
  display: flex;
  align-items: center;
  gap: 2px;
}

.star {
  position: relative;
  width: 16px;
  height: 16px;
  overflow: hidden;
}

.star-shape {
  width: 100%;
  height: 100%;
  background: #e5e7eb;
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

.star.filled .star-shape {
  background: linear-gradient(135deg, #fbbf24, #f59e0b);
}

.star.half .star-shape {
  background: linear-gradient(90deg, #fbbf24 50%, #e5e7eb 50%);
}

.rating-value {
  margin-left: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #f59e0b;
}
</style>
