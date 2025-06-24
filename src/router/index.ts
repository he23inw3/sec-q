import { createRouter, createWebHistory } from 'vue-router'
import HomePage from '../pages/HomePage.vue'

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
      component: () => import('../pages/QuizPage.vue')
    },
    {
      path: '/result/:category/:subcategory',
      name: 'result',
      component: () => import('../pages/ResultPage.vue')
    },
    {
      path: '/history',
      name: 'history',
      component: () => import('../pages/HistoryPage.vue')
    }
  ]
})

export default router