import { createRouter, createWebHistory } from 'vue-router'
const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    { path: '/', component: () => import('../components/pages/LoginPage.vue')},
    { path: '/admin', component: () => import('../components/pages/AdminPage.vue'),
      children: [
        { path: 'users', component: () => import('../components/pages/UsersPage.vue')},
        { path: 'products', component: () => import('../components/pages/ProductsPage.vue')},
        { path: 'categories', component: () => import('../components/pages/CategoriesPage.vue')},
        // { path: 'sales', component: () => import('../components/pages/SalesPage.vue')},
        // { path: 'installation', component: () => import('../components/pages/InstallationPage.vue')},

      ]
    }
  ]
})

export default router
