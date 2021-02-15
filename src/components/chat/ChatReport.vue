<template>
  <div>

    <v-dialog
      v-model="dialog"
      max-width="720px"
      scrollable
      @click:outside="$emit('close')"
      :fullscreen="sp"
      :hide-overlay="sp"
      :transition="sp ? 'dialog-bottom-transition' : 'dialog-transition'"
    >
      <v-card v-if="room && room.requestId">

        <v-toolbar dark color="orange" height="56px" max-height="56px">
          <v-toolbar-title>活動報告</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon dark @click="$emit('close')">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>

        <v-card-text class="pt-4">

          <p class="body-2 text-origin" v-if="!request.reportedAt">
            適宜、活動報告の更新を行い、<span class="red--text">{{room.startDate}}から{{room.endDate}}の間に</span>提出をお願いします。<br>
            活動報告を依頼者が確認すると報酬が確定します。必ず期限内に活動報告を提出してください。
          </p>

          <p class="body-2 text-origin" v-if="request.reportedAt">
            {{getDate(request.reportedAt)}}に提出しました
          </p>

          <v-textarea
            v-model="report.support[i]"
            :label="item"
            rows="5"
            required
            outlined
            v-for="(item, i) in request.support"
            :key="i"
          ></v-textarea>

          <v-textarea
            v-model="report.wordToParent"
            label="保護者に一言"
            rows="3"
            required
            outlined
          ></v-textarea>

          <v-textarea
            v-model="report.wordToStudent"
            label="生徒に一言"
            rows="3"
            required
            outlined
          ></v-textarea>

          <div v-if="request.reviewedAt">
            <b>レビュー</b>
            <ReviewTable :request="request" :sp="sp" class="mt-5" />
          </div>

        </v-card-text>

        <v-card-actions class="border-top" v-if="!request.reviewedAt">
          <v-spacer></v-spacer>

          <v-btn
            color="grey darken-1"
            text
            :disabled="loading.report"
            :loading="loading.draft"
            @click="updateReport('draft')"
            v-if="room.status === 4 || room.status === 5"
          >
            下書き
          </v-btn>

          <v-btn
            color="orange darken-3"
            text
            :loading="loading.report"
            :disabled="!room.isReportable || loading.draft"
            @click="updateReport('report')"
            v-if="room.status === 4 || room.status === 5"
          >
            提出する
          </v-btn>

          <v-btn
            color="orange darken-3"
            text
            :loading="loading.updateReport"
            @click="updateReport('updateReport')"
            v-if="room.status === 6"
          >
            更新する
          </v-btn>
        </v-card-actions>
      </v-card>
    </v-dialog>

    <v-snackbar
      v-model="done"
      bottom
      color="success"
      :timeout="timeout"
    >
      <span><v-icon size="14px" color="white" class="mr-2">fas fa-check</v-icon>活動報告を更新しました</span>
    </v-snackbar>

    <v-snackbar
      v-model="error"
      bottom
      color="error"
      :timeout="timeout"
    >
      <span>全て入力してください</span>
    </v-snackbar>

  </div>
</template>

<script>
import * as shareService from '@/service/share'
import ReviewTable from '@/components/share/ReviewTable'

export default {
  name: 'ChatReport',
  props: ['room', 'sp', 'dialog'],
  components: { ReviewTable },
  computed: {
    user () {
      return this.$store.getters.user
    },
    api () {
      return this.$store.getters.api
    }
  },
  data () {
    return {
      loading: {
        draft: false,
        report: false,
        updateReport: false
      },
      request: {},
      report: {
        support: [],
        wordToParent: '',
        wordToStudent: ''
      },
      timeout: 2000,
      done: false,
      error: false
    }
  },
  methods: {
    updateReport (key) {
      if (key !== 'draft' &&
          (this.request.support.length !== this.report.support.length ||
            !this.report.wordToParent ||
            !this.report.wordToStudent
          )
      ) {
        this.error = true
        return
      }
      this.loading[key] = true
      this.$apig.patch('online', this.api.CONTACT, {
        conversationId: this.room.id
      },
      {
        queryParams: {
          type: key
        }
      }, {
        report: this.report,
        parentId: this.room.opponentId,
        requestId: this.room.requestId
      })
        .then(() => {
          if (key !== 'report') {
            this.done = true
            this.loading[key] = false
            return
          }

          const content =
              'メンターから活動報告が届きました！\n' +
              (!this.room.willEnd
                ? '依頼者は活動報告を確認してレビュー・翌月のリクエスト内容を送信しましょう。\n'
                : (`依頼者は${this.room.willEnd}にレビューの送信をお願いします。\n` +
                '本メンタリング契約はレビューの送信をもって終了となりチャットのやりとりができなくなりますのでご了承ください。\n')
              ) +
              '\n' +
              '【メンタリングの流れ】\n' +
              '(1) リクエストの送信[依頼者]\n' +
              '(2) リクエスト内容の確認[メンター]\n' +
              '(3) メンタリング契約[依頼者]\n' +
              '(4) 今月のビデオチャットの日程調整[依頼者]\n' +
              '(5) 今月の活動報告の提出[メンター]\n' +
              '(6) 今月のレビュー・翌月のリクエスト内容の送信[依頼者] ◀︎ 現在\n' +
              '(7) 翌月のリクエスト内容の確認[メンター]\n' +
              'メンタリング契約は毎月自動で更新され、(4)~(7)の繰り返しとなります。'
          shareService.sendSrMessage(this.room.id, this.user.teacherId, this.room.opponentId, content)
            .then(() => {
              this.$emit('report')
            })
        })
        .catch(err => {
          this.$store.commit('onErrorChanged', err.response.data)
          this.loading[key] = false
        })
    },
    getDate (utcString) {
      const dt = new Date(utcString)
      return `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()}`
    }
  }
}
</script>
