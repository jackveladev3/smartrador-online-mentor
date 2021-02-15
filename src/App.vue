<template>
  <v-app>
    <v-app-bar app color="green darken-1" dark v-if="navState">
      <v-img
        alt="smartrador Logo"
        class="shrink mr-2 sr-logo"
        contain
        src="@/assets/logo.svg"
        transition="scale-transition"
        v-if="!loggedIn"
      />
      <v-app-bar-nav-icon
        v-else
        @click="overlay = !overlay"
      ></v-app-bar-nav-icon>

      <v-spacer v-if="!loggedIn"></v-spacer>
      <div v-else class="spacer d-flex justify-center">
        <v-img
          alt="smartrador Logo"
          class="shrink mr-2 sr-logo"
          contain
          src="@/assets/logo.svg"
          transition="scale-transition"
        />
      </div>

      <v-menu
        offset-y
        left
        bottom
        v-if="loggedIn"
        min-width="300px"
        max-height="250px"
      >
        <template v-slot:activator="{ on }">
          <v-btn icon v-on="on" @click="openBell">
            <v-badge color="pink" :value="notification > 0" dot>
              <v-icon>mdi-bell</v-icon>
            </v-badge>
          </v-btn>
        </template>

        <Notification ref="Notification" />
      </v-menu>
    </v-app-bar>

    <v-content>
      <router-view />
    </v-content>

    <SideMenu :overlay="overlay" @close="overlay = false" />

    <v-snackbar v-model="error" bottom color="error" :timeout="timeout">
      {{ error.message }}
      <v-btn dark text @click="clear">
        <v-icon>fas fa-times</v-icon>
      </v-btn>
    </v-snackbar>
  </v-app>
</template>

<script>
import SideMenu from '@/components/app-bar/SideMenu.vue'
import Notification from '@/components/app-bar/Notification.vue'

export default {
  name: 'App',
  components: {
    SideMenu,
    Notification
  },
  computed: {
    loggedIn () {
      return this.$store.getters.isSignedIn
    },
    user () {
      return this.$store.getters.user
    },
    avatar () {
      return this.$store.getters.avatar
    },
    env () {
      return this.$store.getters.env
    },
    error: {
      get: function () {
        return this.$store.getters.error
      },
      set: function () {}
    },
    notification () {
      return this.$store.getters.notification
    },
    navState () {
      return (
        this.$route.name !== 'VideoChat' &&
        !(this.sp && this.$route.name === 'Chat' && this.$route.query.id)
      )
    },
    sp () {
      return (
        this.userAgent.indexOf('iphone') > 0 ||
        (this.userAgent.indexOf('android') > 0 &&
          this.userAgent.indexOf('mobile') > 0)
      )
    }
  },
  data: () => ({
    overlay: false,
    timeout: 0,
    userAgent: window.navigator.userAgent.toLowerCase()
  }),
  methods: {
    clear () {
      this.$store.commit('onErrorChanged', false)
    },
    openBell () {
      if (this.$refs.Notification) this.$refs.Notification.onInit()
    }
  }
}
</script>

<style lang="scss">
#app {
  background-color: #f9f7f5;
}

.w-100 {
  width: 100vw;
}

.side-menu {
  width: 300px !important;
}

.avatar {
  background-color: #d3d3d3;
  border: 1px solid #00672f;
  border-radius: 50%;
}

.avatar.fm {
  border-color: #c51515;
}

.medal {
  width: 20px;
  height: auto;
  object-fit: cover;
}

.border-right {
  border-right: 1px solid rgba(0, 0, 0, 0.1);
}

.border-top {
  border-top: 1px solid rgba(0, 0, 0, 0.1);
}

.bg-origin {
  background: #f9f7f5;
}

.avatar.fm {
  border-color: #c51515;
}

.rounded {
  border-radius: 4px;
}

.rounded-50 {
  border-radius: 50%;
}

.pre-line {
  white-space: pre-line;
}

.text-origin {
  color: #212121;
  white-space: initial;
}

.sr-logo {
  width: 200px;
}

.text-show {
  text-overflow: inherit;
  white-space: inherit;
}

.h-100 {
  height: 100%;
}

.req-table {
  border-collapse: collapse;
  width: 100%;

  td {
    padding: 10px;
    color: #212121;
    white-space: pre-line;

    &.req-table-thread {
      white-space: nowrap;
    }
  }
}

.cursor-pointer {
  cursor: pointer;
}

.chip-origin {
  border-radius: 12px;
  font-size: 12px;
  height: 24px;
  align-items: center;
  display: inline-flex;
  line-height: 20px;
  padding: 0 12px;
  position: relative;
  white-space: nowrap;
  border: 1px solid #1976d2;
}

.position-fixed-top {
  position: fixed;
  top: 0;
  z-index: 10;
}

.position-fixed-bottom {
  position: fixed;
  bottom: 0;
  z-index: 10;
}

@media (max-width: 600px) {
  .sr-logo {
    width: 170px;
  }

  .req-table {
    td.req-table-thread {
      white-space: initial;
    }
  }
}
</style>
