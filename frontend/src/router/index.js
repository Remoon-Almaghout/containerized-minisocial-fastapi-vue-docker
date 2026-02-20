import { createRouter, createWebHistory } from 'vue-router'

import Login from '../views/Login.vue'
import Register from '../views/Register.vue'
import Feed from '../views/Feed.vue'
import Profile from '../views/Profile.vue'

const routes = [
  { path: '/', redirect: '/feed' },
  { path: '/login', component: Login },
  { path: '/register', component: Register },
  { path: '/feed', component: Feed },
  { path: '/profile/:id', component: Profile },
]

const router = createRouter({
  history: createWebHistory(),
  routes,
})
router.beforeEach((to) => {
  const publicPages = ['/login', '/register', '/feed']
  const isPublic = publicPages.includes(to.path) || to.path.startsWith('/profile/')

  const token = localStorage.getItem('access_token')

  // Nur nicht-public Seiten erfordern Login
  if (!isPublic && !token) {
    return { path: '/login' }
  }

  // Wenn eingeloggt, nicht zurück zu login/register
  if ((to.path === '/login' || to.path === '/register') && token) {
    return { path: '/feed' }
  }
})

export default router
