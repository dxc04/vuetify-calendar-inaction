import Vue from 'vue'
import Vuex from 'vuex'
import { auth } from '@/firebase'
import router from '../router/index';

Vue.use(Vuex)

export default new Vuex.Store({

  state: {
    user: null,
    status: null,
    error: null

  },
  mutations: {

    setUser (state, payload) {
      state.user = payload
    },

    removeUser (state) {
      state.user = null
    },

    setStatus (state, payload) {
      state.status = payload
    },

    setError (state, payload) {
      state.error = payload
    }

  },
  actions: {
    signUpAction ({ commit }, payload) {
      commit('setStatus', 'loading')
      auth.createUserWithEmailAndPassword(payload.email, payload.password)
        .then((response) => {
          alert('Success, `${response.user.email registered!}`')
          // response will have user
          // user will have uid will be updated to the state
          // commit('setUser', response.user.uid)
          commit('setStatus', 'success')
          commit('setError', null)
        })
        .catch((error) => {
          commit('setStatus', 'failure')
          commit('setError', error.message)
        })
    },

    signInAction ({ commit }, payload) {
      auth.signInWithEmailAndPassword(payload.email, payload.password)
        .then((response) => {
          commit('setUser', auth.currentUser)
          commit('setStatus', 'success')
          commit('setError', null)

          if (router.currentRoute.path === '/login') {
            router.push('/')
          }
        })
        .catch((error) => {
          commit('setStatus', 'failure')
          commit('setError', error.message)
        })
    },

    signOutAction ({ commit }) {
      auth.signOut()
        .then((response) => {
          commit('setUser', null)
          commit('setStatus', 'success')
          commit('setError', null)
          router.push('/login')
        })
        .catch((error) => {
          commit('setStatus', 'failure')
          commit('setError', error.message)
        })
    },

    setUser({commit}, user) {
      commit('setUser', user)
    }
  },

  getters: {

    status (state) {
      return state.status
    },

    user (state) {
      return state.user
    },

    error (state) {
      return state.error
    }
  }
})