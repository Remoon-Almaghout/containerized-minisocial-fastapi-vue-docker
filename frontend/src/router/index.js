import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Feed from '../views/Feed.vue'
import Profile from '../views/Profile.vue'
import NotFound from '../views/NotFound.vue'

const routes = [
  { path: '/', redirect: '/feed' },
  { path: '/login', component: Login, meta: { public: true } },
  { path: '/register', component: Register, meta: { public: true } },
  { path: '/feed', component: Feed, meta: { public: true } },
  { path: '/profile/:id', component: Profile, meta: { public: true } },
  { path: '/:pathMatch(.*)*', component: NotFound, meta: { public: true } },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})
router.beforeEach((to) => {
  const token = localStorage.getItem('access_token')

  if (!to.meta.public && !token) {
    return { path: '/login' }
  }

  if ((to.path === '/login' || to.path === '/register') && token) {
    return { path: '/feed' }
  }
})

export default router
