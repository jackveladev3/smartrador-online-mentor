<template>

  <div>

    <div v-if="room" class="h-100">

      <v-row no-gutters class="h-100">

        <v-col class="d-flex flex-column h-100 border-right" :class="sp ? 'sp-offset' : ''" v-if="!(sp && isInfo)">

          <v-toolbar
            :flat="!sp"
            :class="sp ? 'position-fixed-top' : ''"
            height="56px"
            max-height="56px"
            width="100%"
            v-if="!isInfo"
          >
            <v-btn icon @click="back">
              <v-icon>fas fa-chevron-left</v-icon>
            </v-btn>

            <v-spacer></v-spacer>

            <v-btn text small :to="'/videochat/' + $route.query.id" target="_blank" color="primary" :disabled="room.status < 4">
              <v-icon small class="mr-1">fas fa-video</v-icon>ビデオチャット<span v-if="sp">(PCのみ)</span>
            </v-btn>
            <v-btn icon @click="isInfo=!isInfo" :color="isInfo ? '' : 'success'" v-if="sp">
              <v-icon>fas fa-bars</v-icon>
            </v-btn>
            <v-btn text small @click="openInfo(0)" color="success darken-1" v-if="!sp">
              <v-icon small class="mr-1">far fa-file-alt</v-icon>契約
            </v-btn>
            <v-btn text small @click="openInfo(1)" color="teal darken-3" v-if="!sp">
              <v-icon small class="mr-1">fas fa-images</v-icon>画像
            </v-btn>
          </v-toolbar>

          <v-divider v-if="!isInfo"></v-divider>

          <v-sheet :class="!sp ? 'flex-grow-1 overflow-auto' : ''">

            <v-sheet
              tile
              height="80px"
              class="d-flex align-center justify-space-between pa-3"
            >

              <div class="d-flex align-center">

                <v-img
                  class="shrink mr-3 avatar"
                  :class="room.opponent.sex == '2' ? 'fm' : ''"
                  cover
                  :src="getAvatar(room.opponentId, room.opponent.photoId)"
                  width="50px"
                  height="50px"
                  v-if="room.opponent.photoFlag == '2'"
                />

                <v-icon v-else class="mr-3" :color="room.opponent.sex == '2' ? '#c51515' : '#00672f'" large>fas fa-user-circle</v-icon>

                <div class="mr-3">
                  <p class="mb-0 text-no-wrap">{{room.opponent.initial}}さん</p>
                </div>

              </div>

            </v-sheet>

            <v-divider></v-divider>

            <div v-if="loadingList || loading">

              <div v-for="i in 5" :key="i">
                <v-skeleton-loader
                  type="list-item-avatar-three-line"
                  class="mx-auto"
                ></v-skeleton-loader>
                <v-divider></v-divider>
              </div>

            </div>

            <div v-if="!loadingList && !loading && room.lastMessageId">
              <ChatRoomMessage
                :room="room"
                :sp="sp"
                ref="ChatRoomMessage"
                @read="$emit('read')"
              />
            </div>

          </v-sheet>

          <ChatPostMessage
            v-if="!loadingList && !loading && room.lastMessageId && room.status > 1"
            :room="room"
            :sp="sp"
            @postMessage="postMessage"
            @accept="accept"
            @decline="decline=true"
            @report="openReport(requestId)"
            :class="sp ? 'position-fixed-bottom w-100' : ''"
          />

        </v-col>

        <v-col cols="12" md="4" v-if="isInfo" class="bg-origin">

          <ChatInfomation
            ref="ChatInformation"
            :room="room"
            :sp="sp"
            :tabParent="tab"
            @close="isInfo=false"
            @report="openReport"
          />

        </v-col>

      </v-row>

    </div>

    <ChatDecline
      :sp="sp"
      :room="room"
      :dialog="decline"
      @close="decline=false"
      @decline="$emit('decline');decline=false;"
    />

    <ChatReport
      ref="ChatReport"
      :sp="sp"
      :room="room"
      :dialog="report"
      @close="report=false"
      @report="$emit('report');report=false;"
    />

  </div>

</template>

<script>
import ChatRoomMessage from './ChatRoomMessage'
import ChatPostMessage from './ChatPostMessage'
import ChatInfomation from './ChatInfomation'
import ChatDecline from './ChatDecline'
import ChatReport from './ChatReport'

export default {
  name: 'ChatRoom',
  props: ['id', 'room', 'sp', 'loadingList'],
  components: {
    ChatRoomMessage,
    ChatPostMessage,
    ChatInfomation,
    ChatDecline,
    ChatReport
  },
  computed: {
    env () {
      return this.$store.getters.env
    }
  },
  data () {
    return {
      loading: true,
      isInfo: false,
      decline: false,
      report: false,
      tab: 0
    }
  },
  methods: {
    getAvatar (teacherId, photoId) {
      return `${this.env.VUE_APP_S3}/users/public/ap-northeast-1%3A${teacherId}/profile/${photoId}.medium.png`
    },
    postMessage () {
      this.$refs.ChatRoomMessage.postMessage()
    },
    back () {
      this.$router.push({ path: '/chat' })
    },
    accept () {
      this.$emit('accept')
    },
    openReport (requestId = this.room.requestId) {
      this.$refs.ChatReport.request = this.room.request[requestId]
      if (this.room.request[requestId].report) this.$refs.ChatReport.report = this.room.request[requestId].report
      this.report = true
    },
    openInfo (tab) {
      this.tab = tab
      this.isInfo = true
    }
  },
  created () {
    this.loading = true
    setTimeout(() => { this.loading = false }, 300)
  },
  watch: {
    room (val, oldVal) {
      if (oldVal && val.id === oldVal.id) return
      this.loading = true
      if (!val.lastMessageId) setTimeout(() => { this.loading = false }, 300)
      else setTimeout(() => { this.loading = false }, 100)
    }
  }
}
</script>

<style scoped>
.sp-offset {
  padding: 56px 0 151px;
}
</style>
