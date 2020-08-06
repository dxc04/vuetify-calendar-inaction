import Vue from "vue";

import VueRouter, { RouteConfig } from "vue-router";
import Home from "../views/Home.vue";
import Login from '../views/Login.vue';
import Register from '../views/Register.vue';

import 'firebase/auth';
import { auth } from '@/firebase';
import store from "@/store";

Vue.use(VueRouter);


const routes: Array<RouteConfig> = [
  {
    path: "/",  
    name: "Home",
    component: Home,
    meta: {
      requiresAuth: true
    }
  },
  {
    path: '/login',
    name: 'login',
    component: Login,
    meta: {
      requiresAuth: false
    }
  },
  {
    path: '/register',
    name: 'register',
    component: Register,
    meta: {
      requiresAuth: true
    }
  },
];

const router = new VueRouter({
  mode: 'history',
  routes
});

router.beforeEach((to, from, next) => {
  const requiresAuth = to.matched.some(x => x.meta.requiresAuth)

  if (requiresAuth && !auth.currentUser) {
    console.log('dsa')
    next('/login')
  } else {
    store.dispatch('setUser', auth.currentUser);
    next()
  }
})

export default router;
