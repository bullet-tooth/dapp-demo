import Vue from 'vue'
import Router from 'vue-router'
import Dashboard from '@/components/Dashboard'
import NewPhones from '@/components/NewPhones'
import OldPhones from '@/components/OldPhones'
import AdminPanel from '@/components/AdminPanel'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'dashboard',
      component: Dashboard
    },
    {
      path: '/new',
      name: 'newPhones',
      component: NewPhones
    },
    {
      path: '/old',
      name: 'oldPhones',
      component: OldPhones
    },
    {
      path: '/admin',
      name: 'adminPanel',
      component: AdminPanel
    }
  ]
})
