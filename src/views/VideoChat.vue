<template>

  <v-container fluid fill-height>

    <v-dialog
      v-model="loading"
      hide-overlay
      persistent
      width="300"
    >
      <v-card
        color="white"
        dark
      >
        <v-card-text class="py-3">
          <v-progress-linear
            indeterminate
            color="success"
            class="mb-0"
          ></v-progress-linear>
        </v-card-text>
      </v-card>
    </v-dialog>

    <DeviceCheck
      @close="deviceChecked"
      :stream="myStream"
      :media-err="mediaErr"
      v-if="!readyToCall"
    />

    <v-card
      height="200px"
      width="267px"
      class="myvideo"
      v-if="readyToCall && !loading"
    >
      <MyVideo :video="myStream" :ready-for-make-call="readyToCall"></MyVideo>
    </v-card>

    <v-card
      height="200px"
      width="267px"
      class="theirvideo"
      v-if="readyToCall && !loading && theirStream && showWhiteBoard"
    >
      <TheirVideo :option="option"></TheirVideo>
    </v-card>

    <v-card
      id="lesson-main"
      class="mx-auto d-flex flex-column bg-chat"
      height="100%"
      min-width="100%"
    >

      <v-img
        alt="smartrador Logo"
        class="shrink sr-logo"
        contain
        src="@/assets/logo.svg"
        transition="scale-transition"
      />

      <v-container fluid fill-height class="d-flex justify-center" v-if="readyToCall && !loading">
        <div v-if="!theirStream" class="d-flex align-center justify-center flex-column">
          <v-img
            class="shrink avatar elevation-4"
            contain
            width="100px"
            height="100px"
            cover
            :src="parent.avatar"
            transition="scale-transition"
            :class="parent.sex == '2' ? 'fm' : ''"
            v-if="parent.photoFlag === '2'"
          />
          <v-icon v-else :color="parent.sex == '2' ? '#c51515' : '#00672f'" size="100px">fas fa-user-circle</v-icon>
          <p class="mt-10 mb-3 white--text font-weight-bold">{{parent.initial}}さんの参加を待っています</p>
          <v-progress-linear
            indeterminate
            color="white"
          ></v-progress-linear>
        </div>
        <TheirVideo
          :width="'640'"
          :height="'480'"
          :option="option"
          v-show="theirStream && !showWhiteBoard"
          class="fullvideo"
        ></TheirVideo>
        <WhiteBoard :option="option" v-show="showWhiteBoard"></WhiteBoard>
      </v-container>

      <v-card-actions class="justify-center my-5" v-if="readyToCall && !loading">
        <v-btn
          @click="showWhiteBoard=!showWhiteBoard"
          :color="showWhiteBoard ? 'success' : 'white'"
          fab
          large
          v-if="showWhiteBoard"
        >
          <v-icon :color="!showWhiteBoard ? 'success' : 'white'">fas fa-chalkboard</v-icon>
        </v-btn>
        <div class="mx-5" v-if="showWhiteBoard"></div>
        <v-btn
          @click="close=true"
          color="error"
          fab
          large
        >
          <v-icon>fas fa-phone-slash</v-icon>
        </v-btn>
      </v-card-actions>

    </v-card>

    <v-snackbar
      v-model="close"
      bottom
      color="white"
      :timeout="0"
    >
      <div class="red--text">通話を終了しますか？</div>
      <div>
        <v-btn
          @click="endCall(true)"
          color="error"
          text
        >
          はい
        </v-btn>
        <v-btn
          @click="close=false"
          color="grey darken-1"
          text
          class="ml-0"
        >
          いいえ
        </v-btn>
      </div>
    </v-snackbar>

    <v-snackbar
      v-model="leave"
      bottom
      color="white"
      :timeout="timeout"
    >
      <span class="red--text">{{parent.initial}}さんとの通話が終了しました</span>
    </v-snackbar>

  </v-container>

</template>

<script>
import Peer from 'skyway-js'
import MyVideo from '@/components/videochat/MyVideo'
import TheirVideo from '@/components/videochat/TheirVideo'
import WhiteBoard from '@/components/videochat/WhiteBoard'
import DeviceCheck from '@/components/share/DeviceCheck'

export default {
  name: 'VideoChat',
  components: {
    MyVideo,
    TheirVideo,
    WhiteBoard,
    DeviceCheck
  },
  computed: {
    constant () {
      return this.$store.getters.constant
    },
    api () {
      return this.$store.getters.api
    },
    user () {
      return this.$store.getters.user
    },
    option () {
      return {
        video: this.theirStream
      }
    }
  },
  data: () => {
    return {
      dialogOptions: {
        width: 360,
        buttonPin: false,
        buttonClose: false,
        left: window.innerWidth - 360
      },
      myStream: undefined,
      theirStream: undefined,
      peer: undefined,
      peerName: null,
      peerCallTo: null,
      existingCall: undefined,
      showWhiteBoard: false,
      readyToCall: false,
      mediaErr: null,
      loading: false,
      parent: {},
      leave: false,
      timeout: 3000,
      close: false
    }
  },
  async created () {
    const self = this

    if (this.myStream) this.myStream.getTracks().forEach(track => track.stop())
    await navigator.mediaDevices.getUserMedia({
      video: true,
      audio: true
    }).then(function (stream) {
      self.myStream = stream
      self.mediaErr = null
    }).catch(function (err) {
      console.log(err)
      self.mediaErr = err
    })
  },
  methods: {
    async fetchData () {
      this.loading = true
      this.$apig.get('online', this.api.CONTACT, {
        conversationId: this.$route.params.conversationId
      },
      {
        queryParams: {
          type: 'videochat-mentor'
        }
      }, {})
        .then(response => {
          this.parent = response.data.parent
          this.peerName = response.data.peerName
          this.peerCallTo = response.data.peerCallTo
          this.initRTC()
          this.loading = false
        })
        .catch(err => {
          this.$store.commit('onErrorChanged', err.response.data)
        })
    },
    async initRTC () {
      const self = this
      this.peer = new Peer(this.peerName, { key: this.constant.SKYWAY_JS.API_KEY })
      this.peer.on('open', function () {
        self.makeCall()
      })
      this.peer.on('error', function (err) {
        if (err.type === 'peer-unavailable') {
          // 接続先が不在の場合の処理を書く
          setTimeout(self.makeCall, 20000)
          return
        }

        self.$store.commit('onErrorChanged', { message: `${err.type}: ${err.message}` })
      })

      this.peer.on('call', function (call) {
        call.answer(self.myStream)
        self.setupCallHandler(call)
      })
    },
    addVideo (call, stream) {
      this.theirStream = stream
    },
    removeVideo () {
      this.leave = true
      this.theirStream = undefined
    },
    setupCallHandler (call) {
      const self = this
      if (this.existingCall) {
        this.existingCall.close()
      }

      this.existingCall = call
      call.on('stream', function (stream) {
        self.addVideo(call, stream)
      })
      call.on('close', function () {
        self.removeVideo()
      })
      call.on('error', error => {
        console.log(`${error.type}: ${error.message}`)
      })
    },
    makeCall () {
      if (this.existingCall && this.existingCall.open) {
        console.log('call opened')
        return
      }
      const call = this.peer.call(this.peerCallTo, this.myStream)
      this.setupCallHandler(call)
    },
    endCall (isOwn) {
      if (this.existingCall) this.existingCall.close()
      if (isOwn) window.close()
    },
    async deviceChecked () {
      this.loading = true
      this.readyToCall = true
      await this.fetchData()
    }
  },
  beforeDestroy () {
    if (this.existingCall) this.endCall()
  }
}
</script>

<style scoped>
  .sr-logo {
    position: absolute;
    top: 10px;
    left: 10px;
    opacity: 0.8;
  }

  .bg-chat {
    background: linear-gradient(0,#00b05030,#00B050);
  }

  .myvideo {
    position: absolute;
    bottom: 30px;
    right: 30px;
    z-index: 5;
  }

  .theirvideo {
    position: absolute;
    bottom: 260px;
    right: 30px;
    z-index: 5;
  }

  .fullvideo {
    border-radius: 4px;
    box-shadow: 0px 3px 1px -2px rgba(0, 0, 0, 0.2), 0px 2px 2px 0px rgba(0, 0, 0, 0.14), 0px 1px 5px 0px rgba(0, 0, 0, 0.12);
    width: auto;
  }
</style>
