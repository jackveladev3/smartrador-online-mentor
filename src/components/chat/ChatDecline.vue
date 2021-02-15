<template>

  <v-dialog
    v-model="dialog"
    max-width="720px"
    scrollable
    @click:outside="$emit('close')"
    :fullscreen="sp"
    :hide-overlay="sp"
    :transition="sp ? 'dialog-bottom-transition' : 'dialog-transition'"
  >
    <v-card v-if="room">

      <v-toolbar dark color="error" height="56px" max-height="56px">
        <v-toolbar-title>リクエストを辞退する</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon dark @click="$emit('close')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text class="pt-4">

        <p class="body-2 text-origin">
          本当に{{room.opponent.initial}}さんからのリクエストを辞退しますか？<br>
          <br>
          リクエストを辞退すると、<span class="pink--text">チャットのやりとりができなくなります</span>のでご了承ください。
        </p>

        <v-textarea
          v-model="reason"
          label="辞退する理由を教えてください"
          auto-grow
          required
          outlined
        ></v-textarea>

        <p class="body-2">理由は依頼者に公開されます</p>

      </v-card-text>

      <v-card-actions class="border-top">
        <v-spacer></v-spacer>

        <v-btn
          color="grey darken-3"
          text
          :disabled="loading"
          @click="$emit('close')"
        >
          いいえ
        </v-btn>

        <v-btn
          color="error"
          text
          :loading="loading"
          @click="decline"
        >
          はい
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
import * as shareService from '@/service/share'

export default {
  name: 'ChatDecline',
  props: ['room', 'sp', 'dialog'],
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
      loading: false,
      reason: ''
    }
  },
  methods: {
    decline () {
      this.loading = true
      this.$apig.patch('online', this.api.CONTACT, {
        conversationId: this.room.id
      },
      {
        queryParams: {
          type: 'decline'
        }
      }, {
        reason: this.reason,
        parentId: this.room.opponentId
      })
        .then(() => {
          const content =
              'メンターがリクエストを辞退したため、チャットが終了しました。\n\n' +
              '【理由】\n' +
              this.reason
          shareService.sendSrMessage(this.room.id, this.user.teacherId, this.room.opponentId, content)
            .then(() => {
              this.$emit('decline')
            })
        })
        .catch(err => {
          this.$store.commit('onErrorChanged', err.response.data)
          this.loading = false
        })
    }
  }
}
</script>
