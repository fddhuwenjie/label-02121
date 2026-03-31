<template>
  <div>
    <div class="page-header">
      <div>
        <h1 class="page-title">图书管理</h1>
        <p class="page-subtitle">管理店铺所有图书信息</p>
      </div>
      <button class="add-btn" @click="openDialog()">
        <span>+</span> 添加图书
      </button>
    </div>

    <div class="tabs">
      <button :class="['tab-btn', { active: activeTab === 'books' }]" @click="activeTab = 'books'">图书列表</button>
      <button :class="['tab-btn', { active: activeTab === 'reviews' }]" @click="activeTab = 'reviews'">评价管理</button>
    </div>

    <div class="card">
      <div v-if="activeTab === 'books'">
        <div class="table-header">
          <div class="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input v-model="searchKey" placeholder="搜索图书..." />
          </div>
        </div>
        <div class="books-table">
          <div v-for="book in filteredBooks" :key="book.id" class="book-item">
            <div class="book-main">
              <img class="book-cover" :src="book.cover" :alt="book.title" />
              <div class="book-info">
                <span class="book-title">{{ book.title }}</span>
                <span class="book-author">{{ book.author }} · {{ book.category }}</span>
              </div>
            </div>
            <div class="book-price">¥{{ book.price.toFixed(2) }}</div>
            <div :class="['book-stock', { low: book.stock < 20 }]">
              <span class="stock-dot"></span>
              {{ book.stock }} 本
            </div>
            <div class="book-status">
              <span :class="['status-tag', book.status === '上架' ? 'active' : '']">{{ book.status }}</span>
            </div>
            <div class="book-actions">
              <button class="action-btn edit" @click="openDialog(book)">编辑</button>
              <button class="action-btn delete" @click="handleDelete(book.id)">删除</button>
            </div>
          </div>
        </div>
      </div>

      <div v-if="activeTab === 'reviews'">
        <div class="table-header">
          <div class="search-box">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
            </svg>
            <input v-model="reviewSearchKey" placeholder="搜索评价..." />
          </div>
        </div>
        <div v-if="filteredReviews.length === 0" class="empty-reviews">
          暂无评价
        </div>
        <div v-else class="reviews-table">
          <div v-for="review in filteredReviews" :key="review.id" class="review-item">
            <div class="review-main">
              <div class="book-info-mini">
                <span class="book-title-mini">{{ getBookTitle(review.bookId) }}</span>
                <span class="review-user">{{ review.username }}</span>
              </div>
              <div class="review-content">
                <StarRating :model-value="review.rating" />
                <p class="review-text">{{ review.content }}</p>
              </div>
            </div>
            <span class="review-time">{{ review.createTime }}</span>
            <div class="review-actions">
              <button class="action-btn delete" @click="handleDeleteReview(review.bookId, review.id)">删除</button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <el-dialog v-model="dialogVisible" :title="isEdit ? '编辑图书' : '添加图书'" width="560px">
      <el-form :model="form" label-position="top">
        <el-row :gutter="20">
          <el-col :span="8">
            <el-form-item label="封面图片">
              <div class="cover-upload">
                <div class="cover-preview" @click="triggerFileInput">
                  <img v-if="form.cover" :src="form.cover" alt="封面预览" />
                  <div v-else class="cover-placeholder">
                    <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/>
                      <circle cx="12" cy="13" r="4"/>
                    </svg>
                    <p>点击上传</p>
                  </div>
                  <div class="cover-overlay">
                    <span>更换封面</span>
                  </div>
                </div>
                <input ref="fileInputRef" type="file" accept="image/*" style="display: none" @change="handleFileUpload" />
                <el-input v-model="form.cover" placeholder="或输入图片URL" size="small" class="cover-url-input" />
                <el-button v-if="form.title && form.author" size="small" type="primary" plain @click="generateCover" class="gen-cover-btn">
                  自动生成封面
                </el-button>
              </div>
            </el-form-item>
          </el-col>
          <el-col :span="16">
            <el-form-item label="书名"><el-input v-model="form.title" placeholder="请输入书名" /></el-form-item>
            <el-form-item label="作者"><el-input v-model="form.author" placeholder="请输入作者" /></el-form-item>
            <el-row :gutter="16">
              <el-col :span="12">
                <el-form-item label="分类">
                  <el-select v-model="form.category" style="width: 100%">
                    <el-option v-for="c in adminStore.categories" :key="c" :label="c" :value="c" />
                  </el-select>
                </el-form-item>
              </el-col>
              <el-col :span="12">
                <el-form-item label="价格"><el-input-number v-model="form.price" :min="0" :precision="2" style="width: 100%" /></el-form-item>
              </el-col>
            </el-row>
            <el-form-item label="库存"><el-input-number v-model="form.stock" :min="0" style="width: 100%" /></el-form-item>
            <el-form-item label="简介"><el-input v-model="form.description" type="textarea" :rows="2" placeholder="请输入图书简介" /></el-form-item>
          </el-col>
        </el-row>
      </el-form>
      <template #footer>
        <el-button @click="dialogVisible = false">取消</el-button>
        <el-button type="primary" @click="handleSave">保存</el-button>
      </template>
    </el-dialog>
  </div>
</template>

<script setup>
import { ref, reactive, computed } from 'vue'
import { useAdminStore } from '../stores/admin'
import { ElMessage, ElMessageBox } from 'element-plus'
import { generateBookCover, getAllReviews, deleteBookReview } from '../shared/data'
import StarRating from '../components/StarRating.vue'

const adminStore = useAdminStore()
const dialogVisible = ref(false)
const isEdit = ref(false)
const editId = ref(null)
const searchKey = ref('')
const reviewSearchKey = ref('')
const activeTab = ref('books')
const fileInputRef = ref(null)
const form = reactive({ title: '', author: '', category: '技术', price: 0, stock: 0, cover: '', description: '' })

const allReviews = computed(() => getAllReviews())

const filteredReviews = computed(() => {
  if (!reviewSearchKey.value) return allReviews.value
  return allReviews.value.filter(r => 
    r.content.includes(reviewSearchKey.value) || 
    r.username.includes(reviewSearchKey.value) ||
    getBookTitle(r.bookId).includes(reviewSearchKey.value)
  )
})

const getBookTitle = (bookId) => {
  const book = adminStore.books.find(b => b.id === bookId)
  return book ? book.title : '未知图书'
}

const handleDeleteReview = (bookId, reviewId) => {
  ElMessageBox.confirm('确定要删除这条评价吗？', '提示', {
    confirmButtonText: '确定',
    cancelButtonText: '取消',
    type: 'warning'
  }).then(() => {
    deleteBookReview(bookId, reviewId)
    ElMessage.success('删除成功')
  }).catch(() => {})
}

const categoryColors = {
  '技术': '#3776ab',
  '科幻': '#0a0a23',
  '文学': '#8b0000',
  '历史': '#8b6914',
  '经济': '#2e8b57',
  '艺术': '#9932cc'
}

const filteredBooks = computed(() => {
  if (!searchKey.value) return adminStore.books
  return adminStore.books.filter(b => b.title.includes(searchKey.value) || b.author.includes(searchKey.value))
})

const openDialog = (book) => {
  if (book) {
    isEdit.value = true
    editId.value = book.id
    Object.assign(form, book)
  } else {
    isEdit.value = false
    editId.value = null
    Object.assign(form, { title: '', author: '', category: '技术', price: 0, stock: 0, cover: '', description: '' })
  }
  dialogVisible.value = true
}

const triggerFileInput = () => {
  fileInputRef.value?.click()
}

const handleFileUpload = (event) => {
  const file = event.target.files?.[0]
  if (!file) return
  
  if (!file.type.startsWith('image/')) {
    ElMessage.error('请上传图片文件')
    return
  }
  
  if (file.size > 2 * 1024 * 1024) {
    ElMessage.error('图片大小不能超过 2MB')
    return
  }
  
  const reader = new FileReader()
  reader.onload = (e) => {
    form.cover = e.target?.result
    ElMessage.success('封面上传成功')
  }
  reader.readAsDataURL(file)
  event.target.value = ''
}

const generateCover = () => {
  if (!form.title || !form.author) {
    ElMessage.warning('请先填写书名和作者')
    return
  }
  const color = categoryColors[form.category] || '#1a1a2e'
  form.cover = generateBookCover(form.title.replace(/\s+/g, ''), form.author, color)
  ElMessage.success('封面生成成功')
}

const handleSave = () => {
  if (!form.title?.trim()) {
    ElMessage.warning('请输入书名')
    return
  }
  if (!form.author?.trim()) {
    ElMessage.warning('请输入作者')
    return
  }
  
  if (!form.cover) {
    generateCover()
  }
  
  if (isEdit.value) {
    adminStore.updateBook(editId.value, { ...form })
    ElMessage.success('更新成功')
  } else {
    adminStore.addBook({ ...form })
    ElMessage.success('添加成功')
  }
  dialogVisible.value = false
}

const handleDelete = (id) => {
  ElMessageBox.confirm('确定删除该图书?', '提示', { type: 'warning' }).then(() => {
    adminStore.deleteBook(id)
    ElMessage.success('删除成功')
  }).catch(() => {})
}
</script>

<style scoped>
.page-header { display: flex; justify-content: space-between; align-items: flex-start; }
.add-btn { display: flex; align-items: center; gap: 8px; padding: 14px 28px; background: linear-gradient(135deg, #7c3aed, #ec4899); color: white; border: none; border-radius: 14px; font-size: 15px; font-weight: 600; cursor: pointer; transition: all 0.3s; box-shadow: 0 8px 20px rgba(124, 58, 237, 0.3); }
.add-btn:hover { transform: translateY(-2px); box-shadow: 0 12px 28px rgba(124, 58, 237, 0.4); }
.add-btn span { font-size: 20px; }

.tabs {
  display: flex;
  gap: 8px;
  margin-bottom: 24px;
  background: #f4f4f8;
  padding: 6px;
  border-radius: 12px;
  width: fit-content;
}

.tab-btn {
  padding: 12px 24px;
  border: none;
  background: transparent;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 600;
  color: #6b7280;
  cursor: pointer;
  transition: all 0.2s;
}

.tab-btn:hover {
  color: #1a1a2e;
}

.tab-btn.active {
  background: white;
  color: #1a1a2e;
  box-shadow: 0 2px 8px rgba(0,0,0,0.08);
}

.table-header { margin-bottom: 24px; }
.search-box { display: flex; align-items: center; gap: 12px; background: #f4f4f8; border-radius: 12px; padding: 0 18px; max-width: 320px; }
.search-box span { font-size: 18px; }
.search-box input { flex: 1; border: none; background: transparent; padding: 14px 0; font-size: 14px; }
.search-box input:focus { outline: none; }

.book-item { display: flex; align-items: center; gap: 20px; padding: 20px; background: #f9fafb; border-radius: 16px; margin-bottom: 12px; transition: all 0.2s; }
.book-item:hover { background: #f3f4f6; transform: translateX(4px); }
.book-main { display: flex; align-items: center; gap: 16px; flex: 1; min-width: 280px; }
.book-cover { width: 50px; height: 70px; object-fit: cover; border-radius: 6px; box-shadow: 0 2px 8px rgba(0,0,0,0.1); }
.book-info { display: flex; flex-direction: column; }
.book-title { font-weight: 700; color: #1a1a2e; font-size: 15px; }
.book-author { font-size: 13px; color: #6b7280; margin-top: 2px; }
.book-price { font-weight: 700; color: #7c3aed; font-size: 16px; min-width: 80px; }
.book-stock { display: flex; align-items: center; gap: 8px; font-size: 14px; color: #1a1a2e; min-width: 80px; }
.book-stock.low { color: #ef4444; }
.stock-dot { width: 8px; height: 8px; border-radius: 50%; background: #10b981; }
.book-stock.low .stock-dot { background: #ef4444; }
.book-status { min-width: 80px; }
.status-tag { padding: 6px 14px; border-radius: 20px; font-size: 12px; font-weight: 600; background: #f1f5f9; color: #64748b; }
.status-tag.active { background: #d1fae5; color: #059669; }
.book-actions { display: flex; gap: 8px; }
.action-btn { padding: 8px 16px; border: none; border-radius: 8px; font-size: 13px; font-weight: 500; cursor: pointer; transition: all 0.2s; }
.action-btn.edit { background: #ede9fe; color: #7c3aed; }
.action-btn.edit:hover { background: #7c3aed; color: white; }
.action-btn.delete { background: #fee2e2; color: #ef4444; }
.action-btn.delete:hover { background: #ef4444; color: white; }

.empty-reviews {
  text-align: center;
  padding: 60px 0;
  color: #6b7280;
  font-size: 14px;
}

.reviews-table {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.review-item {
  display: flex;
  align-items: center;
  gap: 20px;
  padding: 20px;
  background: #f9fafb;
  border-radius: 16px;
  transition: all 0.2s;
}

.review-item:hover {
  background: #f3f4f6;
  transform: translateX(4px);
}

.review-main {
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.book-info-mini {
  display: flex;
  align-items: center;
  gap: 12px;
}

.book-title-mini {
  font-weight: 700;
  color: #1a1a2e;
  font-size: 15px;
}

.review-user {
  font-size: 13px;
  color: #6b7280;
}

.review-content {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.review-text {
  margin: 0;
  color: #4b5563;
  font-size: 14px;
  line-height: 1.6;
}

.review-time {
  font-size: 12px;
  color: #9ca3af;
  min-width: 140px;
  text-align: right;
}

.review-actions {
  display: flex;
  gap: 8px;
}

:deep(.el-dialog) { border-radius: 20px !important; }
:deep(.el-dialog__header) { padding: 24px 24px 0 !important; }
:deep(.el-dialog__title) { font-weight: 700 !important; font-size: 18px !important; }
:deep(.el-dialog__body) { padding: 24px !important; }

.cover-upload { display: flex; flex-direction: column; gap: 12px; }
.cover-preview { 
  width: 140px; 
  height: 196px; 
  border-radius: 12px; 
  overflow: hidden; 
  cursor: pointer; 
  position: relative;
  background: #f4f4f8;
  border: 2px dashed #e5e7eb;
  transition: all 0.3s;
}
.cover-preview:hover { border-color: #7c3aed; }
.cover-preview img { width: 100%; height: 100%; object-fit: cover; }
.cover-placeholder { 
  width: 100%; 
  height: 100%; 
  display: flex; 
  flex-direction: column; 
  align-items: center; 
  justify-content: center; 
  color: #9ca3af;
}
.cover-placeholder svg { margin-bottom: 8px; color: #9ca3af; }
.cover-placeholder p { font-size: 12px; margin: 0; }
.cover-overlay {
  position: absolute;
  inset: 0;
  background: rgba(0,0,0,0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  opacity: 0;
  transition: opacity 0.3s;
}
.cover-preview:hover .cover-overlay { opacity: 1; }
.cover-overlay span { color: white; font-size: 13px; font-weight: 500; }
.cover-url-input { margin-top: 4px; }
.gen-cover-btn { width: 100%; margin-top: 4px; }
</style>
