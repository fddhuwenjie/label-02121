<template>
  <div class="container">
    <div v-if="book" class="detail-page">
      <div class="detail-grid">
        <div class="detail-cover">
          <div class="cover-wrapper">
            <img class="cover-img" :src="book.cover" :alt="book.title" />
          </div>
        </div>
        <div class="detail-info">
          <span class="detail-category">{{ book.category }}</span>
          <h1>{{ book.title }}</h1>
          <p class="detail-author">作者：{{ book.author }}</p>
          
          <div class="detail-price">
            <span class="price-label">价格</span>
            <span class="price-value">¥{{ book.price.toFixed(2) }}</span>
          </div>

          <p class="detail-desc">{{ book.description }}</p>

          <div class="detail-meta">
            <div class="meta-item">
              <span class="meta-label">库存</span>
              <span :class="['meta-value', { 'low-stock': book.stock < 20 }]">
                {{ book.stock }} 本
                <span v-if="book.stock < 20" class="stock-warn">库存紧张</span>
              </span>
            </div>
          </div>

          <div class="detail-actions">
            <div class="quantity-selector">
              <button class="qty-btn" @click="quantity > 1 && quantity--">−</button>
              <span class="qty-value">{{ quantity }}</span>
              <button class="qty-btn" @click="quantity < book.stock && quantity++">+</button>
            </div>
            <button class="btn btn-primary add-cart-btn" :disabled="book.stock === 0" @click="addToCart">
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                <circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/>
                <path d="M1 1h4l2.68 13.39a2 2 0 0 0 2 1.61h9.72a2 2 0 0 0 2-1.61L23 6H6"/>
              </svg>
              {{ book.stock === 0 ? '暂无库存' : '加入购物车' }}
            </button>
          </div>
        </div>
      </div>

      <div class="reviews-section">
        <h2 class="reviews-title">用户评价</h2>
        
        <div v-if="userStore.isLoggedIn" class="review-form">
          <h3 class="form-title">发表评价</h3>
          <div class="form-group">
            <label class="form-label">评分</label>
            <StarRating v-model="newRating" interactive />
          </div>
          <div class="form-group">
            <label class="form-label">评价内容</label>
            <textarea v-model="newContent" class="review-textarea" placeholder="请输入您的评价..." rows="4"></textarea>
          </div>
          <button class="btn btn-primary submit-btn" @click="submitReview">提交评价</button>
        </div>

        <div v-if="reviews.length === 0" class="no-reviews">
          暂无评价，欢迎发表第一条评价
        </div>
        <div v-else class="reviews-list">
          <div v-for="review in reviews" :key="review.id" class="review-item">
            <div class="review-header">
              <div class="review-user">
                <div class="user-avatar">{{ review.username.charAt(0).toUpperCase() }}</div>
                <span class="username">{{ review.username }}</span>
              </div>
              <StarRating :model-value="review.rating" />
            </div>
            <p class="review-content">{{ review.content }}</p>
            <span class="review-time">{{ review.createTime }}</span>
          </div>
        </div>
      </div>
    </div>
    <div v-else class="not-found">
      <svg class="not-found-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/>
        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>
      </svg>
      <p>图书不存在</p>
      <router-link to="/" class="btn btn-primary">返回首页</router-link>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, inject } from 'vue'
import { useRoute } from 'vue-router'
import { useBooksStore } from '../stores/books'
import { useCartStore } from '../stores/cart'
import { useUserStore } from '../stores/user'
import { getBookReviews, addBookReview } from '../shared/data'
import StarRating from '../components/StarRating.vue'

const route = useRoute()
const booksStore = useBooksStore()
const cartStore = useCartStore()
const userStore = useUserStore()
const toast = inject('toast')
const openLoginModal = inject('openLoginModal')

const book = computed(() => booksStore.getBookById(route.params.id))
const quantity = ref(1)
const newRating = ref(0)
const newContent = ref('')
const reviews = ref([])

const loadReviews = () => {
  reviews.value = getBookReviews(route.params.id)
}

const submitReview = () => {
  if (newRating.value === 0) {
    toast('请选择评分', 'error')
    return
  }
  if (!newContent.value.trim()) {
    toast('请输入评价内容', 'error')
    return
  }
  const review = {
    id: Date.now().toString(),
    userId: userStore.user.id,
    username: userStore.user.username,
    rating: newRating.value,
    content: newContent.value.trim(),
    createTime: new Date().toLocaleString('zh-CN')
  }
  addBookReview(route.params.id, review)
  newRating.value = 0
  newContent.value = ''
  loadReviews()
  toast('评价提交成功', 'success')
}

loadReviews()

const addToCart = () => {
  if (!userStore.isLoggedIn) {
    toast('请先登录', 'error')
    openLoginModal()
    return
  }
  if (book.value.stock < quantity.value) {
    toast('库存不足', 'error')
    return
  }
  for (let i = 0; i < quantity.value; i++) cartStore.addToCart(book.value)
  toast(`《${book.value.title}》x${quantity.value} 已加入购物车`, 'cart')
}
</script>

<style scoped>
.detail-page {
  padding: 40px 0;
}

.detail-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 80px;
  align-items: start;
}

.cover-wrapper {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
  border-radius: 30px;
  padding: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 20px 60px rgba(0,0,0,0.1);
}

.cover-img {
  width: 100%;
  max-width: 300px;
  height: auto;
  border-radius: 12px;
  box-shadow: 0 10px 40px rgba(0,0,0,0.2);
}

.detail-category {
  display: inline-block;
  font-size: 12px;
  color: #e94560;
  font-weight: 700;
  text-transform: uppercase;
  letter-spacing: 2px;
  margin-bottom: 16px;
}

.detail-info h1 {
  font-size: 42px;
  font-weight: 800;
  color: #1a1a2e;
  line-height: 1.2;
  margin-bottom: 12px;
  letter-spacing: -1px;
}

.detail-author {
  font-size: 18px;
  color: #6c757d;
  margin-bottom: 32px;
}

.detail-price {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 24px;
  margin-bottom: 32px;
}

.price-label {
  display: block;
  font-size: 14px;
  color: #6c757d;
  margin-bottom: 8px;
}

.price-value {
  font-size: 36px;
  font-weight: 800;
  color: #e94560;
}

.detail-desc {
  font-size: 16px;
  line-height: 1.8;
  color: #495057;
  margin-bottom: 32px;
  padding: 24px;
  background: #f8f9fa;
  border-radius: 16px;
}

.detail-meta {
  display: flex;
  gap: 40px;
  margin-bottom: 40px;
}

.meta-item {
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.meta-label {
  font-size: 14px;
  color: #6c757d;
}

.meta-value {
  font-size: 18px;
  font-weight: 700;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 8px;
}

.meta-value.low-stock {
  color: #e94560;
}

.stock-warn {
  font-size: 12px;
  background: #fee2e2;
  color: #e94560;
  padding: 4px 10px;
  border-radius: 12px;
}

.detail-actions {
  display: flex;
  gap: 20px;
  align-items: center;
}

.quantity-selector {
  display: flex;
  align-items: center;
  background: #f8f9fa;
  border-radius: 50px;
  padding: 8px;
}

.qty-btn {
  width: 48px;
  height: 48px;
  border: none;
  background: white;
  border-radius: 50%;
  font-size: 20px;
  cursor: pointer;
  transition: all 0.3s;
  box-shadow: 0 2px 10px rgba(0,0,0,0.1);
}

.qty-btn:hover {
  background: #1a1a2e;
  color: white;
}

.qty-value {
  font-size: 20px;
  font-weight: 700;
  min-width: 60px;
  text-align: center;
}

.add-cart-btn {
  flex: 1;
  padding: 20px 40px;
  font-size: 16px;
}

.add-cart-btn:disabled {
  background: #ccc;
  cursor: not-allowed;
}

.add-cart-btn:disabled:hover {
  transform: none;
  box-shadow: none;
}

.reviews-section {
  margin-top: 80px;
  padding-top: 40px;
  border-top: 1px solid #e9ecef;
}

.reviews-title {
  font-size: 28px;
  font-weight: 700;
  color: #1a1a2e;
  margin-bottom: 32px;
}

.review-form {
  background: #f8f9fa;
  border-radius: 16px;
  padding: 32px;
  margin-bottom: 40px;
}

.form-title {
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 20px;
}

.form-label {
  display: block;
  font-size: 14px;
  font-weight: 600;
  color: #495057;
  margin-bottom: 12px;
}

.review-textarea {
  width: 100%;
  padding: 16px;
  border: 2px solid #e9ecef;
  border-radius: 12px;
  font-size: 14px;
  resize: none;
  font-family: inherit;
  transition: all 0.3s;
}

.review-textarea:focus {
  outline: none;
  border-color: #1a1a2e;
}

.submit-btn {
  padding: 14px 40px;
}

.no-reviews {
  text-align: center;
  padding: 60px 0;
  color: #6c757d;
  font-size: 16px;
}

.reviews-list {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.review-item {
  background: white;
  border: 1px solid #e9ecef;
  border-radius: 16px;
  padding: 24px;
}

.review-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
}

.review-user {
  display: flex;
  align-items: center;
  gap: 12px;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 16px;
}

.username {
  font-weight: 600;
  color: #1a1a2e;
}

.review-content {
  color: #495057;
  line-height: 1.8;
  margin-bottom: 12px;
}

.review-time {
  font-size: 12px;
  color: #6c757d;
}

.not-found {
  text-align: center;
  padding: 120px 0;
}

.not-found-icon {
  width: 80px;
  height: 80px;
  margin: 0 auto 24px;
  color: #6c757d;
}

.not-found p {
  font-size: 24px;
  color: #6c757d;
  margin-bottom: 32px;
}

@media (max-width: 768px) {
  .detail-grid {
    grid-template-columns: 1fr;
    gap: 40px;
  }
  .cover-img { max-width: 200px; }
  .detail-info h1 { font-size: 28px; }
}
</style>
