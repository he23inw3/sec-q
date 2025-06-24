import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'
import QuizPage from '../pages/QuizPage.vue'
import ResultPage from '../pages/ResultPage.vue'
import HistoryPage from '../pages/HistoryPage.vue'

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: HomePage
    },
    {
      path: '/quiz/:category/:subcategory',
      name: 'quiz',
      component: () => QuizPage
    },
    {
      path: '/result/:category/:subcategory',
      name: 'result',
      component: () => ResultPage
    },
    {
      path: '/history',
      name: 'history',
      component: () => HistoryPage
    }
  ]
})

export default router