<template>
  <div class="chat-wrapper">

    <v-tabs show-arrows :grow="sp" v-if="!(sp && $route.query.id)" background-color="white" color="success" v-model="tab">
      <v-tab to="/home">問題に回答する</v-tab>
      <v-tab>メンターとして相談にのる</v-tab>
    </v-tabs>

    <v-divider v-if="!(sp && $route.query.id)"></v-divider>

    <v-row no-gutters class="white">
      <v-col
        md="3"
        cols="12"
        class="chat-rooms"
        :class="{
          'd-none': $route.query.id,
          'd-md-block': $route.query.id
        }"
      >
        <ChatList
          :items="items"
          :loading="loading"
          :selected="selected"
        />
      </v-col>
      <v-col md="9" cols="12">

        <ChatRoom
          class="chat-detail"
          :id="selected"
          :room="room"
          :sp="sp"
          :loadingList="loading"
          v-if="selected"
          @accept="onInit"
          @decline="onInit"
          @report="onInit"
          @read="updateUnreadCount"
        />

      </v-col>
    </v-row>

  </div>
</template>

<script>
import ChatList from '@/components/chat/ChatList.vue'
import ChatRoom from '@/components/chat/ChatRoom.vue'
import * as conversationService from '@/service/conversations'
import * as messageService from '@/service/messages'
import * as shareService from '@/service/share'

export default {
  name: 'Chat',
  components: {
    ChatList,
    ChatRoom
  },
  computed: {
    user () {
      return this.$store.getters.user
    },
    api () {
      return this.$store.getters.api
    },
    constant () {
      return this.$store.getters.constant
    },
    // eslint-disable-next-line vue/return-in-computed-property
    room () {
      if (this.$route.query.id) {
        for (const item of this.items) {
          if (item.id === this.$route.query.id) {
            return item
          }
        }
      }
    }
  },
  data () {
    return {
      subscription: null,
      sp: false,
      loading: true,
      roomsPagination: {
        loading: false,
        nextToken: ''
      },
      items: [],
      selected: '',
      contacts: [],
      tab: 1
    }
  },
  async created () {
    await this.onInit()
  },
  methods: {
    async onInit () {
      window.addEventListener('resize', this.handleResize)
      this.handleResize()

      if (this.$route.query.id) this.selected = this.$route.query.id

      try {
        // get conversation list
        const response = await conversationService.getConversationList(this.user.teacherId)
        this.items = response.items.sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt))

        // subscribe to conversation
        const observable = await conversationService.onConversation(this.user.teacherId)
        this.subscription = observable.subscribe({
          next: async nextData => {
            if (!nextData.value.data) {
              return
            }

            // console.log('onConversation', nextData.value.data)
            if (this.items.findIndex(item => item.id === nextData.value.data.onConversation.id) !== -1) {
              nextData.value.data.onConversation.lastMessage = await messageService.getMessage(nextData.value.data.onConversation.lastMessageId)
              const newData = [...this.items]
              const data = {
                ...this.items.find(item => item.id === nextData.value.data.onConversation.id),
                ...nextData.value.data.onConversation
              }
              newData.splice(newData.findIndex(item => item.id === nextData.value.data.onConversation.id), 1)
              newData.unshift(data)
              this.items = newData

              if (nextData.value.data.onConversation.lastMessage.ownerType === 'SMARTRADOR') await this.getContact()
            }
          },
          error: error => {
            console.log(error)
          }
        })
      } catch (e) {
        console.error('error', e)
      }

      await this.getContact()
    },
    handleResize: function () {
      if (window.innerWidth <= 800) {
        this.sp = true
      } else {
        this.sp = false
      }
    },
    updateUnreadCount () {
      for (const i in this.items) {
        if (this.items[i].id === this.room.id) this.items[i].unreads = 0
      }
    },
    async getContact () {
      this.loading = true
      this.$apig.get('online', this.api.CONTACT, {
        conversationId: 'list'
      },
      {
        queryParams: {
          type: 'list-mentor'
        }
      }, {})
        .then(response => {
          this.contacts = response.data.list

          const allConversations = {}
          for (const item of this.contacts) {
            allConversations[item.id] = item
          }

          this.items = this.items.map(item => {
            const { requestId, isReportable, startDate, endDate } = shareService.setReportable(allConversations[item.id].request)
            return {
              ...allConversations[item.id],
              ...item,
              status: allConversations[item.id].status,
              requestId,
              isReportable,
              startDate,
              endDate
            }
          })

          this.items.sort((a, b) => {
            if (a.status > 3 && b.status <= 3) return -1
            else if (a.status <= 3 && b.status > 3) return 1
            else if (new Date(a.updatedAt) > new Date(b.updatedAt)) return -1
            else if (new Date(a.updatedAt) < new Date(b.updatedAt)) return 1
          })

          this.loading = false
        })
        .catch(err => {
          console.log(err)
          if (err.response) this.$store.commit('onErrorChanged', err.response.data)
          this.loading = false
        })
    }
  },
  watch: {
    $route (to) {
      if (to.query.id) this.selected = this.$route.query.id
      else this.selected = ''
    }
  }
}
</script>

<style scoped>
.chat-wrapper {
  max-height: calc(100vh - 112px);
  background: #ffffff;
}

.chat-rooms {
  border-right: 1px solid rgba(0,0,0,0.1);
  overflow: hidden auto;
  height: calc(100vh - 113px);
  -webkit-overflow-scrolling : touch;
}

.chat-detail {
  height: calc(100vh - 113px);
}

.chat-mentor {
  height: calc(100vh - 113px);
  background: #f9f7f5;
}

@media (max-width:600px) {
  /deep/ .v-slide-group__next,
  /deep/ .v-slide-group__prev {
    display: none;
  }

  .chat-wrapper {
    max-height: auto;
  }

  .chat-rooms,
  .chat-detail,
  .chat-mentor {
    height: auto;
  }
}
</style>
