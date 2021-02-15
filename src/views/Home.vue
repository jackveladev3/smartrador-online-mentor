<template>
  <div>
    <v-list class="py-0">
      <v-list-item @click="campaign=true" class="light-green lighten-5 py-md-0 py-3">
        <v-list-item-title class="body-2 success--text text-show">回答してランクアップ！更にバッチをゲット！</v-list-item-title>
        <v-list-item-action>
          <v-icon color="success">mdi-chevron-right</v-icon>
        </v-list-item-action>
      </v-list-item>
    </v-list>

    <v-divider></v-divider>

    <v-tabs show-arrows background-color="white" color="success">
      <v-tab>問題に回答する</v-tab>
      <v-tab to="/chat">メンターとして相談にのる</v-tab>
    </v-tabs>
    <v-tabs
      center-active
      show-arrows
      background-color="white"
      color="success"
      v-model="tab"
      @change="change"
    >
      <v-tab v-for="item in constant.TABS" :key="item.value">{{item.text}}</v-tab>

      <v-tab-item v-for="item in constant.TABS" :key="item.value" class="bg-origin">
        <QuestionCard :item="item" :ref="item.type" @openCard="openCard" />
      </v-tab-item>
    </v-tabs>

    <QuestionDetail
      :dialog="dialog"
      :item="item"
      @close="close"
      @complete="close();onInit();"
      ref="QuestionDetail"
    />

    <v-dialog
      v-model="campaign"
      max-width="720px"
      scrollable
    >
      <v-carousel
        cycle
        hide-delimiter-background
        show-arrows-on-hover
        style="max-width:720px"
        height="auto"
      >
        <v-carousel-item
          v-for="(item,i) in items"
          :key="i"
          :src="item.src"
        ></v-carousel-item>
      </v-carousel>
    </v-dialog>
  </div>
</template>

<script>
import QuestionCard from '@/components/question/QuestionCard.vue'
import QuestionDetail from '@/components/question/QuestionDetail.vue'

export default {
  name: 'Home',
  components: {
    QuestionCard,
    QuestionDetail
  },
  computed: {
    user () {
      return this.$store.getters.user
    },
    constant () {
      return this.$store.getters.constant
    },
    api () {
      return this.$store.getters.api
    }
  },
  data () {
    return {
      tab: 0,
      category: 'recommend',
      dialog: false,
      item: {
        subject: '',
        objective: '',
        detail1: '',
        detail2: '',
        question_img: [],
        answer_img: []
      },
      items: [
        {
          src: require('@/assets/badge-min.png')
        },
        {
          src: require('@/assets/upgrade-min.png')
        }
      ],
      reload: false,
      loading: false,
      campaign: false
    }
  },
  created () {
    this.onQuery()
  },
  methods: {
    onQuery () {
      if (this.$route.query.cat) {
        this.tab = Number(this.$route.query.cat)
        this.category = this.constant.TABS[this.tab].type
      } else if (this.$route.query.id) {
        this.fetchData(this.$route.query.id)
      } else {
        this.setQuery([
          {
            key: 'cat',
            value: this.tab
          }
        ])
      }
    },
    change (number) {
      this.reload = true
      this.setQuery([
        {
          key: 'cat',
          value: number
        }
      ])

      setTimeout(() => {
        const category = this.constant.TABS[number].type
        this.$refs[category][0].onInit()
        this.$refs[category][0].loading = true
        this.category = category
        this.reload = false
      }, 100)
    },
    onInit () {
      this.$refs[this.category][0].onInit()
    },
    openCard (item) {
      this.reload = true
      this.setQuery([
        {
          key: 'id',
          value: item.questionId
        }
      ])
      this.item = item
      this.dialog = true
      var oemflagExist
      if (item.oemflag) oemflagExist = true
      else oemflagExist = false

      this.$refs.QuestionDetail.getAnswers(
        item.questionId,
        !!item.studentId,
        oemflagExist
      )
    },
    close () {
      this.dialog = false
      this.deleteQuery(['id'])

      setTimeout(() => {
        this.item = {
          subject: '',
          objective: '',
          detail1: '',
          detail2: '',
          question_img: [],
          answer_img: []
        }
        this.reload = false
      }, 500)
    },
    setQuery (queries) {
      const query = { ...this.$route.query }
      let path = this.$route.path

      for (const item of queries) {
        delete query[item.key]
        if (path === this.$route.path) path += `?${item.key}=${item.value}`
        else path += `&${item.key}=${item.value}`
      }

      this.$router.push(
        {
          path,
          query
        },
        () => {}
      )
    },
    deleteQuery (keyArray) {
      const query = { ...this.$route.query }

      for (const key of keyArray) {
        delete query[key]
      }

      this.$router.push(
        {
          query
        },
        () => {}
      )
    },
    fetchData (questionId) {
      this.loading = true

      this.$apig
        .get(
          'online',
          this.api.QUESTION,
          {
            questionId
          },
          {
            queryParams: {
              type: 'direct'
            }
          },
          {}
        )
        .then((response) => {
          this.openCard(response.data)
          this.loading = false
        })
        .catch((err) => {
          if (err.response) { this.$store.commit('onErrorChanged', err.response.data) }
          this.loading = false
        })
    }
  },
  watch: {
    $route (to) {
      if (to.query.id && !this.reload) {
        this.fetchData(to.query.id)
      }
    }
  }
}
</script>

<style scoped>
@media (max-width: 600px) {
  /deep/ .v-slide-group__next,
  /deep/ .v-slide-group__prev {
    display: none;
  }
}
</style>
