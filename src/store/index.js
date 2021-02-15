import Vue from 'vue'
import Vuex from 'vuex'
import api from './api'
import constant from './constant'

Vue.use(Vuex)

export default new Vuex.Store({
  state: {
    credentials: {},
    user: {},
    status: false,
    api,
    constant,
    env: process.env,
    avatar: '',
    notification: [],
    error: false
  },
  mutations: {
    onAuthStateChanged (state, credentials) {
      state.credentials = credentials
    },
    onUserStateChanged (state, user) {
      state.user = user
    },
    onLoginStatusChanged (state, status) {
      state.status = status
    },
    onAvatarStateChanged (state, avatarId) {
      state.avatar = `${state.env.VUE_APP_S3}/users/public/ap-northeast-1%3A${state.user.teacherId}/profile/${avatarId}.medium.png`
    },
    onNotificationStateChanged (state, data) {
      state.notification = data
    },
    onMovingChanged (state, data) {
      state.moving = data
    },
    onErrorChanged (state, data) {
      state.error = data
    }
  },
  getters: {
    credentials (state) {
      return state.credentials
    },
    user (state) {
      return state.user
    },
    isSignedIn (state) {
      return state.status
    },
    api (state) {
      return state.api
    },
    constant (state) {
      return state.constant
    },
    env (state) {
      return state.env
    },
    avatar (state) {
      return state.avatar
    },
    notification (state) {
      return state.notification
    },
    moving (state) {
      return state.moving
    },
    error (state) {
      return state.error
    }
  }
})
