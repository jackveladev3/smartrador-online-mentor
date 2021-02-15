<template>
  <v-list class="chat-list">
    <v-list-item dense>
      <v-list-item-title class="chat-list-sub-title body-2 green--text font-weight-bold">
        <v-icon small color="success">fas fa-inbox</v-icon>
        <span class="ml-1">依頼者一覧</span>
      </v-list-item-title>
    </v-list-item>

    <v-divider></v-divider>

    <div v-if="loading">
      <v-list-item v-for="i in 3" :key="i">
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
    </div>

    <div v-else>

      <div v-if="!items.length">
        <v-list-item>
          <v-list-item-title class="caption text-show">メンターの依頼がくるとこちらに表示されます</v-list-item-title>
        </v-list-item>
      </div>
      <div v-else>
        <div v-for="item in items" :key="item.id">
          <v-list-item
            dense
            class="py-3"
            @click="setRoom(item)"
            :class="selected === item.id ? 'green lighten-5' : ''"
          >
            <div class="mr-3">
              <v-badge
                bordered
                top
                left
                color="pink"
                :content="item.unreads"
                offset-x="15"
                offset-y="10"
                :value="item.unreads > 0"
              >
                <v-avatar size="40">
                  <img
                    :src="getAvatar(item.opponentId, item.opponent.photoId)"
                    :alt="item.opponent.initial"
                    v-if="item.opponent.photoFlag == '2'"
                    class="avatar"
                    :class="item.opponent.sex == '2' ?  'fm' : ''"
                  >
                  <v-icon v-else :color="item.opponent.sex == '2' ? '#c51515' : '#00672f'" large>fas fa-user-circle</v-icon>
                </v-avatar>
              </v-badge>
            </div>

            <v-list-item-content>
              <v-list-item-title class="text-show d-flex align-center justify-space-between">
                <span>{{item.opponent.initial}}さん</span>
                <span class="ml-2 success--text font-weight-bold" v-if="item.status > 3">契約中</span>
              </v-list-item-title>
              <v-list-item-subtitle class="caption">{{item.lastMessageId ? item.lastMessage.content : 'まずはリクエストを送信しましょう'}}</v-list-item-subtitle>
              <div class="d-flex align-center justify-space-between">
                <v-chip x-small color="orange" dark class="font-weight-bold" v-if="item.status == 2">リクエストの確認</v-chip>
                <v-chip x-small color="success" dark class="font-weight-bold" v-if="item.status == 3">メンタリング契約待ち</v-chip>
                <v-chip x-small color="orange" dark class="font-weight-bold" v-if="item.status == 4">ビデオチャットの日程調整</v-chip>
                <v-chip x-small color="success" dark class="font-weight-bold" v-if="item.status == 5 && !item.isReportable">メンタリング実施</v-chip>
                <v-chip x-small color="error" dark class="font-weight-bold" v-if="item.status == 5 && item.isReportable">活動報告の提出</v-chip>
                <v-chip x-small color="primary" dark class="font-weight-bold" v-if="item.status == 6">活動報告の確認待ち</v-chip>
                <v-chip x-small color="grey" dark class="font-weight-bold" v-if="item.status == -1">キャンセル</v-chip>
                <v-chip x-small color="grey" dark class="font-weight-bold" v-if="item.status == -2">辞退</v-chip>
                <v-chip x-small color="grey" dark class="font-weight-bold" v-if="item.status == -3">終了</v-chip>
                <div class="caption grey--text">{{getDate(item.updatedAt)}}</div>
              </div>
            </v-list-item-content>
          </v-list-item>

          <v-divider></v-divider>
        </div>
      </div>
    </div>
  </v-list>
</template>

<script>
export default {
  name: 'ChatList',
  props: ['sp', 'items', 'loading', 'selected'],
  computed: {
    user () {
      return this.$store.getters.user
    },
    avatar () {
      return this.$store.getters.avatar
    },
    env () {
      return this.$store.getters.env
    }
  },
  methods: {
    getAvatar (teacherId, photoId) {
      return `${this.env.VUE_APP_S3}/users/public/ap-northeast-1%3A${teacherId}/profile/${photoId}.medium.png`
    },
    setRoom (item) {
      if (this.selected !== item.id) {
        this.$router.push({
          query: {
            id: item.id
          }
        })
      }
    },
    getDate (utcString) {
      const dt = new Date(utcString)
      return `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()} ${dt.getHours()}:${dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes()}`
    }
  }
}
</script>

<style scoped lang="scss">
.chat-list {
  &-sub-title {
    text-align: center;
  }

  &-room {
    height: 100px;
    border-bottom: 1px solid rgba(0,0,0,0.1);
    padding: 10px;
    text-align: left;
    font-size: 12px;
    cursor: pointer;
    position: relative;

    &:hover {
      background-color: #f1f6ff;
    }
  }
}
</style>
