import Vue from 'vue'
import VueRouter from 'vue-router'
import Search from '../views/Search.vue'
import Login from '../views/Login.vue'
import Nav from '../views/Nav.vue'
import Details from '../views/Details.vue'

Vue.use(VueRouter)

const routes = [
  {
    path: '/login',
    name: 'login',
    component: Login
  },
  {
    path: '/mvm',
    name: 'nav',
    component: Nav,
    children: [
      {
        path: '/search',
        name: 'search',
        component: Search
      },
      {
        path: '/details/:id',
        name: 'details',
        component: Details,
        props: true,
      },
    ]
  },
]

const router = new VueRouter({
  routes
})

router.beforeEach((to, from, next) => {
  // redirect to login page if not logged in and trying to access a restricted page
  const publicPages = ['/login'];
  const authRequired = !publicPages.includes(to.path);
  const loggedIn = localStorage.getItem('user');

  if (authRequired && !loggedIn) {
    return next('/login');
  }

  next();
})

router.push("search")

export default router
