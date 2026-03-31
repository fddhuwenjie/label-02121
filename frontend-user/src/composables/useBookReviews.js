import { storage } from '../utils/storage'
import { STORAGE_KEYS } from '../shared/data'

export const useBookReviews = () => {
  const getBookReviews = (bookId) => {
    const key = `${STORAGE_KEYS.REVIEWS}${bookId}`
    return storage.get(key, [])
  }

  const getBookRating = (bookId) => {
    const reviews = getBookReviews(bookId)
    if (reviews.length === 0) return { average: 0, count: 0 }
    
    const total = reviews.reduce((sum, review) => sum + review.rating, 0)
    const average = (total / reviews.length).toFixed(1)
    return { average: parseFloat(average), count: reviews.length }
  }

  return {
    getBookReviews,
    getBookRating
  }
}
