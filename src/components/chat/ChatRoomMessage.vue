<template>
  <div class="chat" id="chat" v-chat-scroll>
    <div v-if="loading">
      <div v-for="i in 5" :key="i">
        <v-skeleton-loader
          type="list-item-avatar-three-line"
          class="mx-auto"
        ></v-skeleton-loader>
        <v-divider></v-divider>
      </div>
    </div>
    <div
      v-for="(message, i) in sortedItems"
      :key="message.id"
      :id="message.id"
      class="message text-left"
      :style="i === 0 ? 'margin-top:20px;' : ''"
    >

      <div
        v-if="diffDate(i)"
        class="date grey--text text--darken-1 d-flex justify-center"
      >
        {{ diffDate(i) }}
      </div>

      <v-sheet class="d-flex pa-3">
        <div class="mr-3" v-if="message.ownerType !== 'TEACHER'">
          <v-img
            class="shrink rounded-50"
            contain
            :src="getAvatar(user.teacherId, user.photoId)"
            width="30px"
            min-width="30px"
            height="30px"
            v-if="message.ownerType==='TEACHER' && user.photoFlag === '2'"
          />
          <v-icon
            v-if="(message.ownerType==='TEACHER' && user.photoFlag === '0') || message.ownerType==='PARENT'"
            :color="(message.ownerType==='TEACHER' && user.sex == '2') || (message.ownerType==='PARENT' && user.sex === '2') ? '#c51515' : '#00672f'"
            size="30px"
          >
            fas fa-user-circle
          </v-icon>
          <v-img
            class="shrink"
            contain
            src="@/assets/favicon.png"
            width="30px"
            min-width="30px"
            height="30px"
            v-if="message.ownerType==='SMARTRADOR'"
          />
        </div>
        <div
          class="flex-grow-1"
          :class="{
            'd-flex flex-column align-end': message.ownerType === 'TEACHER'
          }"
        >
          <div style="width:fit-content;">
            <p>
              <span class="caption font-weight-bold mr-2" v-if="message.ownerType==='TEACHER'">{{user.initial}}</span>
              <span class="caption font-weight-bold mr-2" v-if="message.ownerType==='PARENT'">{{room.opponent.initial}}</span>
              <span class="caption font-weight-bold" v-if="message.ownerType==='SMARTRADOR'">スマートレーダー運営事務局</span>
              <span class="float-right grey--text text--darken-1 caption">
                {{ getDate(message.createdAt) }}
              </span>
            </p>
            <div
              class="text"
              :class="{
                'green darken-1 white--text': message.ownerType === 'TEACHER',
                'primary white--text': message.ownerType === 'PARENT',
                'grey lighten-4': message.ownerType === 'SMARTRADOR'
              }"
            >
              {{ message.content }}
            </div>
            <div class="grey--text text--darken-1 caption mt-3" v-if="message.ownerType === 'TEACHER'">
              {{ (message.readedAt ? '既読' : '未読') }}
            </div>
          </div>

          <RequestTable :request="room.request[message.requestId]" v-if="room.request && message.requestId" class="mt-5" />

          <div class="mt-5" v-if="room.request && message.requestId">
            <v-btn text color="success" class="px-0" to="/mypage">
              報酬はマイページをチェック<v-icon size="14px" class="ml-2">fas fa-chevron-right</v-icon>
            </v-btn>
          </div>

          <div v-if="room.request && message.requestId">
            <v-btn text color="primary" class="px-0" href="https://prd-inc.kibe.la/shared/entries/f4365b4a-ea70-4e0f-a2fb-e9f2b8d1f91e" target="_blank">
              メンタリングについて詳しく<v-icon size="14px" class="ml-2">fas fa-external-link-alt</v-icon>
            </v-btn>
          </div>

          <ReviewTable :request="room.request[message.review]" :sp="sp" v-if="room.request && message.review" class="mt-5" />

        </div>
      </v-sheet>
    </div>
  </div>
</template>

<script>
import RequestTable from '@/components/share/RequestTable'
import ReviewTable from '@/components/share/ReviewTable'
import * as messageService from '@/service/messages'

export default {
  name: 'ChatRoomMessage',
  props: ['room', 'sp'],
  components: { RequestTable, ReviewTable },
  computed: {
    user () {
      return this.$store.getters.user
    },
    env () {
      return this.$store.getters.env
    },
    constant () {
      return this.$store.getters.constant
    },
    api () {
      return this.$store.getters.api
    },
    sortedItems () {
      const items = [...this.items]
      return items.sort((a, b) => {
        return (new Date(a.createdAt) < new Date(b.createdAt)) ? -1 : (new Date(a.createdAt) > new Date(b.createdAt)) ? 1 : 0
      })
    }
  },
  data () {
    return {
      subscription: null,
      subscriptionReaded: null,
      items: [],
      content: '',
      pagination: {
        nextToken: null
      },
      loading: false
    }
  },
  methods: {
    getAvatar (teacherId, photoId) {
      return `${this.env.VUE_APP_S3}/users/public/ap-northeast-1%3A${teacherId}/profile/${photoId}.medium.png`
    },
    async getMessages () {
      let isNext = false
      this.pagination.loading = true
      if (this.pagination.nextToken) isNext = true

      const { items, nextToken } = await this.getMessageList(this.pagination.nextToken)

      if (isNext) this.items.push(...items)
      else this.items = items
      this.pagination.nextToken = nextToken
      this.pagination.loading = false

      if (!this.pagination.loading && this.pagination.nextToken) return await this.getMessages()
      else {
        await this.readMessages()
        this.$emit('read')
      }
    },
    async getMessageList (after, count = 20) {
      const roomsResponse = await messageService.getMessageList(this.room.id, after, count)

      return {
        items: roomsResponse.items,
        nextToken: roomsResponse.nextToken
      }
    },
    async readMessages () {
      for (const i in this.items) {
        if (!this.items[i]) continue

        if (this.items[i] && this.items[i].ownerType !== 'TEACHER' && !this.items[i].readedAt) {
          await messageService.updateMessage({ id: this.items[i].id })
          this.items[i].readedAt = new Date()
        }
      }
    },
    diffDate (i) {
      const dt = new Date(this.sortedItems[i].createdAt)

      if (!i) return `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()}`

      const preDt = new Date(this.sortedItems[i - 1].createdAt)

      if (!(dt.getFullYear() === preDt.getFullYear() &&
            dt.getMonth() === preDt.getMonth() &&
            dt.getDate() === preDt.getDate())
      ) {
        return `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()}`
      }
    },
    getDate (utcString) {
      const dt = new Date(utcString)
      return `${dt.getHours()}:${dt.getMinutes() < 10 ? '0' + dt.getMinutes() : dt.getMinutes()}`
    },
    postMessage () {
      setTimeout(() => {
        document.getElementById(this.sortedItems[this.sortedItems.length - 1].id).scrollIntoView()
      })
    }
  },
  async created () {
    this.loading = true

    // messageの取得
    await this.getMessages()

    // messageのsubscribe
    const observable = await messageService.onMessage(this.room.id)
    this.subscription = observable.subscribe({
      next: async nextData => {
        if (!nextData.value.data) {
          return
        }

        // console.log('onMessage')
        if (this.items.findIndex(item => item.id === nextData.value.data.onMessage.id) === -1) {
          this.items = [...this.items, nextData.value.data.onMessage]
        }
      },
      error: error => {
        console.error(error)
      }
    })

    // 既読のsubscribe
    const observableReaded = await messageService.OnMessageUpdateReaded(this.room.id, this.user.teacherId)
    this.subscriptionReaded = observableReaded.subscribe({
      next: async nextData => {
        if (!nextData.value.data || !nextData.value.data.onMessageUpdateReaded) return

        // console.log('onMessageReaded', nextData.value.data)
        if (this.items.findIndex(item => item.id === nextData.value.data.onMessageUpdateReaded.id) !== -1) {
          this.items[this.items.findIndex(item => item.id === nextData.value.data.onMessageUpdateReaded.id)].readedAt = nextData.value.data.onMessageUpdateReaded.readedAt
        }
      },
      error: error => {
        console.error(error)
      }
    })

    this.loading = false

    this.$nextTick(function () {
      if (this.sortedItems.length) document.getElementById(this.sortedItems[this.sortedItems.length - 1].id).scrollIntoView()
    })
  },
  watch: {
    sortedItems (newData) {
      this.$nextTick(function () {
        document.getElementById(newData[newData.length - 1].id).scrollIntoView()
      })
    }
  }
}
</script>

<style scoped lang="scss">
  .chat {
    overflow: auto;
    height: 100%;
    -webkit-overflow-scrolling : touch;
  }

  .message {
    font-size: 14px;
    min-height: 50px;
    padding: 14px 0;
    position: relative;
  }

  .date {
    position: absolute;
    top: -14px;
    background: #ffffff;
    padding: 2px 4px;
    margin-left: calc(50% - 50px);
    width: 100px;
  }

  .text {
    white-space: pre-line;
    font-size: 14px;
    padding: 4px 8px;
    width: fit-content;
    border-radius: 8px;
  }
</style>
