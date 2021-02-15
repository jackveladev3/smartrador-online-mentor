<template>
  <div>
    <v-list v-if="loading">
      <v-list-item to="/" v-for="i in 3" :key="i">
        <v-list-item-avatar>
          <v-skeleton-loader
            type="avatar"
            class="mx-auto"
          ></v-skeleton-loader>
        </v-list-item-avatar>

        <v-list-item-content>
          <v-skeleton-loader
            type="sentences"
            class="mx-auto"
          ></v-skeleton-loader>
        </v-list-item-content>
      </v-list-item>
    </v-list>
    <v-list
      v-if="!loading && list.length"
      max-width="300px"
    >
      <v-list-item
        dense
        v-for="item in list"
        :key="item.notificationId"
        :class="!item.readFlag ? 'light-green lighten-5' : ''"
        @click="onMove(item)"
      >

        <v-list-item-avatar>
          <img :src="getAvatar(item.teacherId, item.photoId)" alt="item.name" v-if="item.photoFlag == '2'">
          <img :src="item.photoId" alt="item.name" v-else-if="item.photoFlag">
          <v-icon v-else large>fas fa-user-circle</v-icon>
        </v-list-item-avatar>

        <v-list-item-content v-if="item.category === 2 || item.category === 13">
          <v-list-item-title class="text-show">{{item.name}}さんがコメントしました</v-list-item-title>
          <v-list-item-subtitle class="caption">{{item.questionTitle}}</v-list-item-subtitle>
          <v-list-item-subtitle class="caption">{{item.date}}</v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-content v-if="item.category === 3">
          <v-list-item-title class="text-show">{{item.name}}さんからリクエストが届きました</v-list-item-title>
          <v-list-item-subtitle class="caption">{{item.date}}</v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-content v-if="item.category === 6">
          <v-list-item-title class="text-show">{{item.name}}さんとメンタリング契約が成立しました</v-list-item-title>
          <v-list-item-subtitle class="caption">{{item.date}}</v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-content v-if="item.category === 7">
          <v-list-item-title class="text-show">{{item.name}}さんがリクエストを取り下げました</v-list-item-title>
          <v-list-item-subtitle class="caption">{{item.date}}</v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-content v-if="item.category === 8">
          <v-list-item-title class="text-show">{{item.name}}さんがビデオチャットの日程を設定しました</v-list-item-title>
          <v-list-item-subtitle class="caption">{{item.date}}</v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-content v-if="item.category === 10">
          <v-list-item-title class="text-show">{{item.name}}さんが翌月のリクエスト内容を送信しました</v-list-item-title>
          <v-list-item-subtitle class="caption">{{item.date}}</v-list-item-subtitle>
        </v-list-item-content>

        <v-list-item-content v-if="item.category === 11">
          <v-list-item-title class="text-show">{{item.name}}さんがメンタリング契約の終了手続きをしました</v-list-item-title>
          <v-list-item-subtitle class="caption">{{item.date}}</v-list-item-subtitle>
        </v-list-item-content>

      </v-list-item>
    </v-list>

    <v-list
      v-if="!loading && !list.length"
      max-width="300px"
    >
      <v-list-item class="body-2" dense>通知がくるとこちらに表示されます</v-list-item>
    </v-list>

    <v-divider></v-divider>

  </div>
</template>

<script>
export default {
  name: 'Notification',
  computed: {
    user () {
      return this.$store.getters.user
    },
    env () {
      return this.$store.getters.env
    },
    api () {
      return this.$store.getters.api
    }
  },
  data () {
    return {
      fav: false,
      loading: false,
      list: []
    }
  },
  created () {
    this.onInit()
  },
  methods: {
    onInit () {
      this.loading = true

      this.$apig.get('online', this.api.NOTIFICATION, {
        notificationId: 'list'
      }, {
        queryParams: {
          type: 'list'
        }
      }, {})
        .then(response => {
          this.list = response.data.list
          this.$store.commit('onNotificationStateChanged', 0)

          this.loading = false
        })
        .catch(err => {
          console.log(err.response.data)
          this.$store.commit('onErrorChanged', err.response.data)
          this.loading = false
        })
    },
    getAvatar (teacherId, photoId) {
      return `${this.env.VUE_APP_S3}/users/public/ap-northeast-1%3A${teacherId}/profile/${photoId}.medium.png`
    },
    onMove (item) {
      const query = { ...this.$route.query }

      switch (item.category) {
        case 2:
        case 13:
          delete query.id
          delete query.cat
          this.$router.push({
            path: `/home?id=${item.questionId}`,
            query
          }, () => {})
          break
        case 3:
        case 6:
        case 7:
        case 8:
        case 10:
        case 11:
          delete query.id
          this.$router.push({
            path: `/chat?id=${item.conversationId}`,
            query
          }, () => {})
          break
      }
    }
  }
}
</script>

<style lang="scss" scoped>
  .text-show {
    text-overflow: inherit;
    white-space: inherit;
  }
</style>
