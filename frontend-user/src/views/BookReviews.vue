<template>
  <div class="reviews-section">
    <div class="reviews-header">
      <h3>用户评价</h3>
      <div class="reviews-summary">
        <StarRating :rating="averageRating" showValue />
        <span class="review-count">{{ reviews.length }} 条评价</span>
      </div>
    </div>

    <div v-if="userStore.isLoggedIn" class="review-form">
      <h4>发表评价</h4>
      <div class="form-group">
        <label>评分</label>
        <div class="rating-selector">
          <StarRating v-model="newReview.rating" />
          <span class="rating-text">{{ ratingText }}</span>
        </div>
      </div>
      <div class="form-group">
        <label>评论内容</label>
        <textarea v-model="newReview.content" placeholder="分享你的阅读体验..." rows="4" maxlength="500"></textarea>
        <span class="char-count">{{ newReview.content.length }}/500</span>
      </div>
      <button class="submit-btn" :disabled="!canSubmit" @click="submitReview">提交评价</button>
    </div>
    <div v-else class="login-prompt">
      <p>请先登录后发表评价</p>
      <button class="login-btn" @click="openLoginModal()">立即登录</button>
    </div>

    <div class="reviews-list">
      <div v-if="reviews.length === 0" class="empty-reviews">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <p>暂无评价，快来抢沙发吧！</p>
      </div>
      <div v-for="review in reviews" :key="review.id" class="review-item">
        <div class="review-header">
          <div class="review-avatar">{{ review.username?.charAt(0) || 'U' }}</div>
          <div class="review-info">
            <span class="review-username">{{ review.username || '匿名用户' }}</span>
            <StarRating :rating="review.rating" />
          </div>
          <span class="review-time">{{ review.createTime }}</span>
        </div>
        <p class="review-content">{{ review.content }}</p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject, watch, onMounted } from 'vue'
import { useUserStore } from '../stores/user'
import { getBookReviews, addBookReview, getBookAverageRating } from '../shared/data'
import StarRating from '../components/StarRating.vue'

const props = defineProps({
  bookId: { type: [Number, String], required: true }
})

const userStore = useUserStore()
const toast = inject('toast')
const openLoginModal = inject('openLoginModal')

const reviews = ref([])
const newReview = ref({
  rating: 0,
  content: ''
})

const loadReviews = () => {
  reviews.value = getBookReviews(props.bookId)
}

const averageRating = computed(() => getBookAverageRating(props.bookId))

const ratingText = computed(() => {
  const r = newReview.value.rating
  if (r === 1) return '很差'
  if (r === 2) return '较差'
  if (r === 3) return '一般'
  if (r === 4) return '不错'
  if (r === 5) return '很棒'
  return '请选择评分'
})

const canSubmit = computed(() => {
  return newReview.value.rating > 0 && newReview.value.content.trim().length > 0
})

const submitReview = () => {
  if (!canSubmit.value) {
    toast('请选择评分并填写评价内容', 'error')
    return
  }
  
  addBookReview(props.bookId, {
    rating: newReview.value.rating,
    content: newReview.value.content.trim(),
    userId: userStore.user?.id,
    username: userStore.user?.username
  })
  
  toast('评价提交成功', 'success')
  newReview.value = { rating: 0, content: '' }
  loadReviews()
}

watch(() => props.bookId, () => {
  loadReviews()
})

onMounted(() => {
  loadReviews()
})
</script>

<style scoped>
.reviews-section {
  margin-top: 60px;
  padding-top: 40px;
  border-top: 1px solid #e9ecef;
}

.reviews-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 32px;
}

.reviews-header h3 {
  font-size: 24px;
  font-weight: 700;
  color: #1a1a2e;
}

.reviews-summary {
  display: flex;
  align-items: center;
  gap: 12px;
}

.review-count {
  font-size: 14px;
  color: #6c757d;
}

.review-form {
  background: #f8f9fa;
  border-radius: 20px;
  padding: 24px;
  margin-bottom: 32px;
}

.review-form h4 {
  font-size: 16px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 20px;
}

.form-group {
  margin-bottom: 20px;
}

.form-group label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 12px;
}

.rating-selector {
  display: flex;
  align-items: center;
  gap: 12px;
}

.rating-text {
  font-size: 14px;
  color: #6c757d;
}

.form-group textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 14px;
  resize: none;
  transition: border-color 0.3s;
  background: white;
  box-sizing: border-box;
}

.form-group textarea:focus {
  outline: none;
  border-color: #e94560;
}

.char-count {
  display: block;
  text-align: right;
  font-size: 12px;
  color: #6c757d;
  margin-top: 8px;
}

.submit-btn {
  padding: 12px 32px;
  background: linear-gradient(135deg, #e94560, #ff6b6b);
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.submit-btn:hover:not(:disabled) {
  transform: translateY(-2px);
  box-shadow: 0 8px 20px rgba(233, 69, 96, 0.3);
}

.submit-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.login-prompt {
  background: #f8f9fa;
  border-radius: 20px;
  padding: 32px;
  text-align: center;
  margin-bottom: 32px;
}

.login-prompt p {
  color: #6c757d;
  margin-bottom: 16px;
}

.login-btn {
  padding: 10px 28px;
  background: #e94560;
  color: white;
  border: none;
  border-radius: 50px;
  font-size: 14px;
  font-weight: 600;
  cursor: pointer;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.empty-reviews {
  text-align: center;
  padding: 60px 20px;
  color: #6c757d;
}

.empty-reviews svg {
  width: 64px;
  height: 64px;
  margin-bottom: 16px;
  color: #dee2e6;
}

.review-item {
  padding: 24px;
  background: white;
  border-radius: 16px;
  box-shadow: 0 2px 12px rgba(0,0,0,0.04);
}

.review-header {
  display: flex;
  align-items: center;
  gap: 16px;
  margin-bottom: 16px;
}

.review-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea, #764ba2);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.review-info {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.review-username {
  font-weight: 600;
  color: #1a1a2e;
  font-size: 14px;
}

.review-time {
  font-size: 12px;
  color: #adb5bd;
}

.review-content {
  color: #495057;
  line-height: 1.7;
  font-size: 14px;
  margin: 0;
}
</style>
