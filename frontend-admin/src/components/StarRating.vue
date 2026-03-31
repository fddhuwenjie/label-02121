<template>
  <div class="star-rating">
    <div class="stars-container">
      <div class="stars-background">
        <div v-for="i in 5" :key="i" class="star"></div>
      </div>
      <div class="stars-foreground" :style="{ width: `${fillPercent}%` }">
        <div v-for="i in 5" :key="i" class="star"></div>
      </div>
    </div>
  </div>
</template>

<script setup>
import { computed } from 'vue'

const props = defineProps({
  modelValue: {
    type: Number,
    default: 0
  }
})

const fillPercent = computed(() => {
  return (props.modelValue / 5) * 100
})
</script>

<style scoped>
.star-rating {
  display: flex;
  align-items: center;
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
</style>
