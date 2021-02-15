import Vue from 'vue'
import VueRouter from 'vue-router'
import store from '@/store/index'
import cognito from '@/plugins/cognito'
import apig from '@/plugins/apig'
import Home from '../views/Home.vue'
import VideoChat from '../views/VideoChat.vue'

Vue.use(VueRouter)

const requireAuth = (to, from, next) => {
  store.commit('onMovingChanged', true)
  const additionalParams = {
    queryParams: {
      type: 'auth'
    }
  }

  const body = {
    email: store.getters.user.email,
    utm_source: to.query.utm_source || from.query.utm_source,
    gk: store.getters.user.gk
  }

  apig.patch('online', store.getters.api.LOGIN, {}, additionalParams, body)
    .then(response => {
      if (localStorage.app_version !== response.data.version) {
        localStorage.app_redirect = to.fullPath
        localStorage.app_version = response.data.version
        window.location.reload(true)
        return
      }

      store.commit('onUserStateChanged', {
        teacherId: response.data.teacherId,
        name: response.data.name,
        email: response.data.email,
        photoFlag: response.data.photoFlag,
        photoId: response.data.photoId,
        initial: response.data.initial,
        invitation_cd: response.data.invitation_cd,
        school: response.data.school,
        grade: response.data.grade,
        isCertified: response.data.isCertified || false
      })
      if (response.data.photoId) store.commit('onAvatarStateChanged', response.data.photoId)
      store.commit('onLoginStatusChanged', true)
      store.commit('onNotificationStateChanged', response.data.notification_cnt)

      if (localStorage.app_redirect) {
        const path = localStorage.app_redirect
        delete localStorage.app_redirect
        next(path)
      }

      if (from.query.redirect) {
        delete from.query.redirect
        next(from.query.redirect)
      } else next()
    })
    .catch((err) => {
      console.log(err)
      if (err && err.response) store.commit('onErrorChanged', err.response.data)
      forceLogout(to, from, next)
    })
}

const forceLogout = (to, from, next) => {
  store.commit('onLoginStatusChanged', false)
  store.commit('onMovingChanged', false)
  const query = Object.assign({}, to.query)
  if (from.query.utm_source === 'homescreen') query.utm_source = 'homescreen'
  query.redirect = to.fullPath

  next({
    path: '/logout',
    query
  })
}

const logout = (to, from, next) => {
  store.commit('onLoginStatusChanged', false)
  store.commit('onMovingChanged', false)
  cognito.logout()
  next({
    path: '/sign-in',
    query: to.query
  })
}

const checkAuth = (to, from, next) => {
  store.commit('onMovingChanged', false)
  cognito.isAuthenticated()
    .then(() => {
      next('/home')
    })
    .catch(() => {
      next()
    })
}

const routes = [
  {
    path: '/',
    redirect: 'home'
  },
  {
    path: '/home',
    name: 'Home',
    component: Home,
    beforeEnter: requireAuth
  },
  {
    path: '/sign-in',
    name: 'Login',
    // route level code-splitting
    // this generates a separate chunk (about.[hash].js) for this route
    // which is lazy-loaded when the route is visited.
    component: () => import(/* webpackChunkName: "about" */ '../views/SignIn'),
    beforeEnter: checkAuth
  },
  {
    path: '/chat',
    component: () => import('../views/Chat'),
    name: 'Chat',
    beforeEnter: requireAuth
  },
  {
    path: '/videochat/:conversationId',
    name: 'VideoChat',
    component: VideoChat,
    beforeEnter: requireAuth
  },
  {
    path: '/logout',
    beforeEnter: logout
  },
  {
    path: '/mypage',
    component: () => import('../views/Mypage'),
    name: 'Mypage',
    beforeEnter: requireAuth
  },
  { path: '*', redirect: '/home' }
]

const router = new VueRouter({
  mode: 'history',
  scrollBehavior (to, from, savedPosition) {
    if (savedPosition) {
      return savedPosition
    } else {
      return { x: 0, y: 0 }
    }
  },
  base: process.env.BASE_URL,
  routes
})

export default router
