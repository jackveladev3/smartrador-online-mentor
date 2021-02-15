<template>
  <div>

    <v-divider></v-divider>

    <div class="px-3 py-2 border-top white" v-if="room.status === 2">
      <v-btn color="orange lighten-1" dark small dense @click="accept" :loading="loading.accept" class="font-weight-bold">メンタリングを承諾する</v-btn>
      <v-btn color="grey" small dense text :disabled="loading.accept" @click="$emit('decline')">辞退する</v-btn>
    </div>

    <div class="px-3 py-2 border-top white" v-if="room.status === 5 || room.status === 6">
      <v-btn color="orange lighten-1" dark small dense @click="$emit('report')" class="font-weight-bold">活動報告を書く</v-btn>
    </div>

    <div class="pa-3 green lighten-5" style="position:relative;">

      <v-textarea
        v-model="message"
        label="メッセージを入力してください"
        solo
        hide-details
        :auto-grow="sp"
        :rows="sp ? 3 : 5"
      ></v-textarea>

      <v-btn icon color="success" class="file" @click="isFile=!isFile">
        <v-icon size="20px">fas fa-paperclip</v-icon>
      </v-btn>

      <v-btn icon color="success" class="send" @click="sendMessage" :loading="loading.message">
        <v-icon size="20px">fas fa-paper-plane</v-icon>
      </v-btn>

    </div>

    <v-dialog
      v-model="isFile"
      max-width="375px"
      scrollable
    >
      <v-card>
        <v-toolbar dark color="success" height="56px" max-height="56px">
          <v-toolbar-title>画像の共有方法</v-toolbar-title>
          <v-spacer></v-spacer>
          <v-toolbar-items>
            <v-btn icon dark @click="isFile=false">
              <v-icon>mdi-close</v-icon>
            </v-btn>
          </v-toolbar-items>
        </v-toolbar>
        <v-card-text class="px-0">
          <v-img
            alt="campaign"
            class="shrink"
            cover
            src="@/assets/strageshare-ios.jpg"
            transition="scale-transition"
          />
          <v-img
            alt="campaign"
            class="shrink"
            cover
            src="@/assets/strageshare-android.jpg"
            transition="scale-transition"
          />
        </v-card-text>
      </v-card>
    </v-dialog>

  </div>
</template>

<script>
import * as conversationService from '@/service/conversations'
import * as messageService from '@/service/messages'
import * as mailService from '@/service/mail'
import * as shareService from '@/service/share'

export default {
  name: 'ChatPostMessage',
  props: ['room', 'sp'],
  computed: {
    user () {
      return this.$store.getters.user
    },
    api () {
      return this.$store.getters.api
    },
    constant () {
      return this.$store.getters.constant
    }
  },
  data () {
    return {
      loading: {
        message: false,
        accept: false
      },
      message: '',
      isFile: false
    }
  },
  methods: {
    async sendMessage () {
      if (this.message) {
        this.loading.message = true
        const content = this.message
        this.message = ''

        const messageResponce = await messageService.createMessage({
          ownerId: this.user.teacherId,
          opponentId: this.room.opponentId,
          conversationId: this.room.id,
          ownerType: 'TEACHER',
          opponentType: 'PARENT',
          content,
          createdAt: new Date()
        })

        await conversationService.updateConversation({
          id: this.room.id,
          userId: this.user.teacherId,
          lastMessageId: messageResponce.id,
          updatedAt: new Date()
        })

        await conversationService.updateConversation({
          id: this.room.id,
          userId: this.room.opponentId,
          lastMessageId: messageResponce.id,
          updatedAt: new Date()
        })

        this.$emit('postMessage')
        this.loading.message = false

        mailService.sendMail(
          'teacher',
          this.user.teacherId,
          this.room.opponentId,
          content,
          this.room.id
        )
      }
    },
    async accept () {
      this.loading.accept = true
      this.$apig.patch('online', this.api.CONTACT, {
        conversationId: this.room.id
      }, {
        queryParams: {
          type: 'accept'
        }
      }, {
        parentId: this.room.opponentId
      })
        .then(() => {
          const content = `${this.user.initial}さんがリクエストを承諾しました！\n` +
              '依頼者はメンタリング契約の手続きへ進みましょう！\n' +
              '\n' +
              '【メンタリングの流れ】\n' +
              '(1) リクエストの送信[依頼者]\n' +
              '(2) リクエスト内容の確認[メンター]\n' +
              '(3) メンタリング契約[依頼者] ◀︎ 現在\n' +
              '(4) 今月のビデオチャットの日程調整[依頼者]\n' +
              '(5) 今月の活動報告の提出[メンター]\n' +
              '(6) 今月のレビュー・翌月のリクエスト内容の送信[依頼者]\n' +
              '(7) 翌月のリクエスト内容の確認[メンター]\n' +
              'メンタリング契約は毎月自動で更新され、(4)~(7)の繰り返しとなります。'
          shareService.sendSrMessage(this.room.id, this.user.teacherId, this.room.opponentId, content)
            .then(() => {
              this.$emit('accept')
            })
        })
        .catch(err => {
          if (err.response) this.$store.commit('onErrorChanged', err.response.data)
          this.loading.accept = false
        })
    }
  }
}
</script>

<style scoped lang="scss">
  .send {
    position: absolute;
    bottom: 20px;
    right: 24px;
  }

  .file {
    position: absolute;
    bottom: 20px;
    right: 78px;
    background: #ffffff;
  }
</style>
