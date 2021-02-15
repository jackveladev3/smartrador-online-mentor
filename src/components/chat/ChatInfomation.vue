<template>
  <div class="h-100" :style="sp ? 'padding-top: 56px;' : ''">
    <v-toolbar
      :flat="!sp"
      :class="sp ? 'position-fixed-top' : ''"
      height="56px"
      max-height="56px"
      width="100%"
    >
      <v-btn icon @click="$emit('close')">
        <v-icon>fas fa-chevron-left</v-icon>
      </v-btn>

      <v-toolbar-title class="body-1">詳細</v-toolbar-title>

    </v-toolbar>

    <v-divider v-if="!sp"></v-divider>

    <v-tabs grow background-color="white" color="success" v-model="tab">

      <v-tab>契約</v-tab>
      <v-tab>画像</v-tab>

      <v-tab-item class="height bg-origin">
        <div
          v-for="(item, i) in request"
          :key="i"
          class="ma-3 pa-3 white rounded elevation-2 cursor-pointer"
        >
          <div class="d-flex align-center justify-space-between" @click="item.isOpen = !item.isOpen">
            {{getDate(item.createDate)}}
            <v-icon size="14px" class="rotate" :class="item.isOpen ? 'active' : ''">fas fa-chevron-right</v-icon>
          </div>
          <div v-if="item.isOpen" class="mt-3">

            <v-divider v-if="item.date"></v-divider>

            <div class="body-2 my-2" v-if="item.date">
              <v-icon color="primary" size="14px" class="mr-2">fas fa-calendar-day</v-icon><b>ビデオチャットの日程</b>
              <p class="body-2 mt-2 mb-0">{{item.date.replace(/-/g, '/')}} {{item.time}}</p>
            </div>

            <v-divider v-if="item.reportDate"></v-divider>

            <div class="body-2 my-2" v-if="item.reportDate">
              <v-icon color="error" size="14px" class="mr-2">far fa-file-alt</v-icon><b>活動報告の提出期限</b>
              <div class="d-flex align-center justify-space-between mt-2">
                <p class="body-2 mb-0">{{getDate(item.reportDate)}}</p>
                <v-btn text small color="success" @click="$emit('report', item.requestId)"><v-icon size="14px" class="mr-2">far fa-file-alt</v-icon>開く</v-btn>
              </div>
            </div>

            <v-divider></v-divider>

            <div class="body-2 my-2">
              <v-icon color="success" size="14px" class="mr-2">fas fa-flag-checkered</v-icon><b>ゴール</b>
              <p class="body-2 mt-2 mb-0">{{constant.MENTOR_OBJECTIVE[item.objective - 1].text}}</p>
            </div>

            <v-divider></v-divider>

            <div class="body-2 my-2">
              <v-icon color="success" size="14px" class="mr-2">fas fa-check-square</v-icon><b>目標</b>
              <p class="body-2 mt-2 mb-0">{{item.objective_text}}</p>
            </div>

            <v-divider></v-divider>

            <div class="body-2 my-2">
              <v-icon color="success" size="14px" class="mr-2">fas fa-list</v-icon><b>メンターにお願いしたいこと</b>
              <div>
                <v-chip
                  class="mt-2 mr-2"
                  v-for="(item, i) in item.support"
                  :key="i"
                  small
                  outlined
                  color="primary"
                >
                  {{item}}
                </v-chip>
              </div>
            </div>

            <v-divider></v-divider>

            <div class="body-2 my-2">
              <v-icon color="success" size="14px" class="mr-2">fas fa-info-circle</v-icon><b>現状</b>
              <p class="body-2 mt-2 mb-0">{{item.current}}</p>
            </div>

            <v-divider></v-divider>

            <div class="body-2 my-2">
              <v-icon color="success" size="14px" class="mr-2">fas fa-tachometer-alt</v-icon><b>希望するチャットの返信速度</b>
              <p class="body-2 mt-2 mb-0">{{constant.MENTOR_CHAT[item.chat - 1].text}}</p>
            </div>

            <v-divider></v-divider>

            <div class="body-2 my-2">
              <v-icon color="success" size="14px" class="mr-2">fas fa-video</v-icon><b>希望するビデオチャットの頻度</b>
              <p class="body-2 mt-2 mb-0">{{constant.MENTOR_VIDEO[item.video - 1].text}}</p>
            </div>
          </div>
        </div>
      </v-tab-item>

    </v-tabs>

  </div>
</template>

<script>
export default {
  name: 'ChatInfomation',
  props: ['room', 'sp', 'tabParent'],
  computed: {
    constant () {
      return this.$store.getters.constant
    },
    api () {
      return this.$store.getters.api
    },
    env () {
      return this.$store.getters.env
    }
  },
  data () {
    return {
      loading: false,
      tab: this.tabParent || 0,
      selected: '',
      request: [],
      mentor: {}
    }
  },
  created () {
    window.scrollTo(0, 0)
    this.setRequest()
  },
  methods: {
    getDate (utcString) {
      const dt = new Date(utcString)
      return `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()}`
    },
    setRequest () {
      this.request = []
      if (this.room.request) {
        const request = []
        for (const requestId in this.room.request) {
          request.push({
            requestId,
            ...this.room.request[requestId],
            isOpen: false
          })
        }

        this.request = request.sort(function (a, b) {
          if (a.createDate > b.createDate) return -1
          if (a.createDate < b.createDate) return 1
          return 0
        })

        this.request[0].isOpen = true
      }
    },
    getAvatar (teacherId, photoId) {
      return `${this.env.VUE_APP_S3}/users/public/ap-northeast-1%3A${teacherId}/profile/${photoId}.medium.png`
    }
  },
  watch: {
    $route () {
      this.setRequest()
    }
  }
}
</script>

<style scoped lang="scss">
  .rotate {
    transition: all 200ms ease-in;

    &.active{
      transform: rotate(90deg);
      transition-timing-function: ease-out;
    }
  }

  .height {
    height: calc(100vh - 210px);
    overflow: auto;
  }

  .icon {
    width: 15px;
  }

  .intro {
    color: #212121;
    white-space: pre-line;
    font-size: 14px;
  }

  @media (max-width:600px) {
    .height {
      height: auto;
    }
  }
</style>
