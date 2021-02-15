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
    <v-card v-if="contract">

      <v-toolbar dark color="error" height="56px" max-height="56px">
        <v-toolbar-title>メンタリング契約を終了する</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon dark @click="$emit('close')">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text class="pt-4">

        <div>
          <p class="text-origin body-1">メンタリング契約の終了についての注意事項</p>
          <div class="d-flex align-center mb-2 red--text" v-if="contract.cancelDate">
            <v-icon small color="error" class="mr-2">fas fa-exclamation-triangle</v-icon>本日終了手続きをすると、{{contract.cancelDate}}にメンタリング契約が解約されます
          </div>
          <div class="d-flex align-center mb-2 red--text" v-else>
            <v-icon small color="error" class="mr-2">fas fa-exclamation-triangle</v-icon>終了手続きをすると、メンタリング契約が解約され依頼者とチャットやビデオチャットができなくなります
          </div>
          <div class="d-flex align-center mb-2 red--text">
            <v-icon small color="error" class="mr-2">fas fa-exclamation-triangle</v-icon>必ず依頼者に合意をとってから終了してください
          </div>
          <div class="d-flex align-center mb-2 red--text">
            <v-icon small color="error" class="mr-2">fas fa-exclamation-triangle</v-icon>依頼者の合意をとっていない場合、トラブルになるケースがあります
          </div>
          <div class="d-flex align-center mb-2 red--text" v-if="contract.cancelDate">
            <v-icon small color="error" class="mr-2">fas fa-exclamation-triangle</v-icon>一度解約すると取り消すことができませんのでご了承ください
          </div>
        </div>

        <v-divider class="pb-5"></v-divider>

        <p class="body-2 text-origin">
          本当に{{contract.parent}}さんとのメンタリング契約を終了しますか？<br>
          終了する場合は理由を入力の上、「終了する」ボタンを押してください
        </p>

        <v-textarea
          v-model="reason"
          label="理由を教えてください"
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
          終了しない
        </v-btn>

        <v-btn
          color="error"
          text
          :loading="loading"
          @click="cancel"
        >
          終了する
        </v-btn>
      </v-card-actions>
    </v-card>
  </v-dialog>

</template>

<script>
import * as shareService from '@/service/share'

export default {
  name: 'ContractCancel',
  props: ['dialog', 'contract', 'sp'],
  computed: {
    api () {
      return this.$store.getters.api
    },
    user () {
      return this.$store.getters.user
    }
  },
  data () {
    return {
      loading: false,
      reason: ''
    }
  },
  methods: {
    cancel () {
      this.loading = true
      this.$apig.patch('online', this.api.CONTACT, {
        conversationId: this.contract.conversationId
      },
      {
        queryParams: {
          type: 'finish-mentor'
        }
      }, {
        reason: this.reason,
        parentId: this.contract.parentId
      })
        .then(response => {
          const content =
              'メンターがメンタリング契約の終了手続きを行いました。\n' +
              'メンタリング契約の終了予定日は' + response.data.cancelDate + 'です。\n\n' +
              '【理由】\n' +
              this.reason
          shareService.sendSrMessage(this.contract.conversationId, this.contract.parentId, this.user.teacherId, content)
            .then(() => {
              this.$emit('cancel')
              this.reason = ''
              this.loading = false
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
