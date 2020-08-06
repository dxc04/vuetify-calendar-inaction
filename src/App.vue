<template>
<div id="app">
  <v-app id="inspire">
    <v-navigation-drawer v-model="drawer" app v-if="isLoggedIn">
      <v-list dense>
        <v-list-item link to="/">
          <v-list-item-action>
            <v-icon>mdi-home</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Home</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link to="/register">
          <v-list-item-action>
            <v-icon>mdi-account-plus</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Register</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
        <v-list-item link @click="logout">
          <v-list-item-action>
            <v-icon>mdi-account-arrow-right</v-icon>
          </v-list-item-action>
          <v-list-item-content>
            <v-list-item-title>Logout</v-list-item-title>
          </v-list-item-content>
        </v-list-item>
      </v-list>
    </v-navigation-drawer>

    <v-app-bar
      app
      color="indigo"
      dark
    >
      <v-app-bar-nav-icon @click.stop="drawer = !drawer" v-if="isLoggedIn"></v-app-bar-nav-icon>
      <v-toolbar-title>Booko</v-toolbar-title>
    </v-app-bar>

    <v-main>
        <router-view v-on:update-drawer="updateDrawer" />
    </v-main>
    <v-footer
      color="indigo"
      app
    >
      <span class="white--text">&copy; {{ new Date().getFullYear() }}</span>
    </v-footer>
  </v-app>
</div>
</template>

<script>
import Vue from "vue";
import { auth } from '@/firebase'
export default Vue.extend({
  name: "App",
  
  data: () => ({
    drawer: false
  }),
  mounted() {

  },
  computed: {
    userLogedIn () {
      return this.$store.getters.user;
    },

    isLoggedIn() {
      return this.userLogedIn ? true : false;
    }
  },
  methods: {
    updateDrawer(state) {
      this.drawer = state;
    },
    logout() {
      this.$store.dispatch('signOutAction')
    }
  }
});
</script>

