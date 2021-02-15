<template>

  <v-container fluid class="pa-0">

    <v-sheet
      color="white"
      height="50px"
      class="d-flex align-center pa-3"
    >
      マイページ
    </v-sheet>

    <v-divider></v-divider>

    <v-container>

      <v-card class="my-10">

        <v-card-text class="d-flex justify-space-around align-center flex-wrap">
          <div class="d-flex align-center my-3">
            <div class="mr-3">
              <v-img
                class="shrink avatar"
                :class="user.sex == '2' ? 'fm' : ''"
                cover
                :src="getAvatar(user.teacherId, user.photoId)"
                width="60px"
                min-width="60px"
                height="60px"
                v-if="user.photoFlag === '2'"
              />
              <v-icon
                v-if="user.photoFlag === '0'"
                :color="user.sex == '2' ? '#c51515' : '#00672f'"
                size="60px"
              >
                fas fa-user-circle
              </v-icon>
            </div>
            <div>
              <div class="d-flex align-center">
                <p class="text-origin mb-0">{{user.name}}さん</p>
                <v-img
                  alt="認定バッチ"
                  class="shrink ml-2 medal"
                  src="@/assets/medal.svg"
                  v-if="user.isCertified"
                />
              </div>
              <v-rating
                v-model="mentor.rating"
                color="orange"
                :background-color="mentor.rating ? 'orange' : 'grey lighten-1'"
                size="14px"
                dense
                readonly
              ></v-rating>
            </div>
          </div>
          <div class=" my-3">
            <span class="mr-3">{{user.school}}</span>
            <span>{{user.grade}}</span>
          </div>
        </v-card-text>

      </v-card>

      <v-card class="my-10">

        <v-card-text class="d-flex justify-space-around align-center flex-wrap">
          <v-skeleton-loader
            type="list-item-two-line"
            class="mx-auto"
            width="100%"
            v-if="loading"
          ></v-skeleton-loader>
          <div v-if="!loading" class="text-center my-3">
            <p class="font-weight-bold">メンタリングの基本報酬</p>
            <p class="mb-0">
              ¥<span class="headline green--text mx-2">{{mentor.fee}}</span>円/月
            </p>
          </div>
          <div v-if="!loading" class="text-center my-3">
            <p class="font-weight-bold">メンターランク</p>
            <p class="mb-0 d-flex align-center justify-center">
              <span class="headline green--text">{{mentor.rank}}</span>
              <v-tooltip bottom>
                <template v-slot:activator="{ on }">
                  <v-icon color="success" dark v-on="on" size="14px" class="ml-1">fas fa-info-circle</v-icon>
                </template>
                <span>
                  メンターランクはスマートレーダーの適正時給や指導実績などから決まります。<br>
                  メンターランクは5段階でD→C→B→A→Sの順でランクアップし、メンターランクが1つ上がるとメンタリングの基本報酬が1000円/月アップ！<br>
                  ランクアップは毎月の定期査定のタイミングで反映されます。
                </span>
              </v-tooltip>
            </p>
          </div>
        </v-card-text>

      </v-card>

      <v-card class="my-10">

        <v-card-text>
          <v-skeleton-loader
            type="list-item-two-line"
            class="mx-auto"
            width="100%"
            v-if="loading"
          ></v-skeleton-loader>
          <div class="d-flex justify-space-around align-center flex-wrap" v-if="!loading">
            <div class="text-center my-3">
              <p class="font-weight-bold">問題の回答数</p>
              <p class="mb-0">
                <span class="headline primary--text mx-2">{{mentor.answerCnt}}</span>
              </p>
            </div>
            <div class="text-center my-3">
              <p class="font-weight-bold">回答へのコメント数</p>
              <p class="mb-0">
                <span class="headline red--text">{{mentor.commentCnt}}</span>
              </p>
            </div>
          </div>
          <p v-if="!loading" class="text-center mb-0">回答数やコメント数が増えるとあなたのメンターランク・報酬がアップします</p>
        </v-card-text>

      </v-card>

      <v-card class="my-10">

        <v-card-title class="body-1 green--text font-weight-bold">
        メンタリング契約
        </v-card-title>

        <v-card-subtitle class="mt-1">
          メンタリング契約が毎月継続されるごとに、報酬が基本報酬から1,000円アップし最大で15,000円/月となります<br>
          <v-btn text color="primary" class="px-0" href="https://prd-inc.kibe.la/shared/entries/f4365b4a-ea70-4e0f-a2fb-e9f2b8d1f91e" target="_blank">
            メンタリングについて詳しく<v-icon size="14px" class="ml-1">fas fa-external-link-alt</v-icon>
          </v-btn>
        </v-card-subtitle>

        <v-card-text v-if="loading">
          <v-skeleton-loader
            type="list-item-two-line"
            class="mx-auto"
            width="100%"
          ></v-skeleton-loader>
        </v-card-text>

        <v-list v-if="!loading && service.length">

          <v-list-item v-for="item in service" :key="item.conversationId">

            <v-list-item-content>

              <v-list-item-title class="text-show d-flex align-center">
                <v-chip small color="primary" v-if="item.isTrial && item.status > 0">無料トライアル</v-chip>
                <v-chip small color="success" v-if="!item.isTrial && item.status > 3 && !item.willEndDate">契約中</v-chip>
                <v-chip small color="error" v-if="item.willEndDate && item.status > 0">終了予定</v-chip>
                <v-chip small color="grey" dark v-if="item.status < 0">終了</v-chip>
              </v-list-item-title>

              <v-list-item-subtitle class="mt-3">
                <p class="text-origin mb-2">
                  依頼者：{{item.parent}}さん
                </p>
                <p class="text-origin mb-2" v-if="item.status > 0">
                  報酬：{{item.amount}}
                  <span class="grey--text text--darken-1 ml-2" v-if="item.cancelDate">
                    次回の活動報告提出期限は{{item.cancelDate}}です
                  </span>
                </p>
                <p class="text-origin mb-2">利用開始日：{{item.startDate}}</p>
                <p class="mb-2" v-if="item.isTrial && item.status > 0">利用開始日の{{item.trial_period_days}}日後にトライアル期間が終了します</p>

                <p class="text-origin mb-2" v-if="item.willEndDate || item.endDate">終了予定日：{{item.endDate || item.willEndDate}}</p>
                <v-btn
                  :to="'/chat?id=' + item.conversationId"
                  text
                  color="primary"
                  class="px-0"
                >
                  チャットルーム<v-icon size="14px" class="ml-2">fas fa-chevron-right</v-icon>
                </v-btn>

                <p class="caption mt-5 mb-0" v-if="!item.willEndDate && !item.endDate">
                  メンタリング契約の終了を希望する場合は<a @click="finish(item)">こちら</a>
                </p>

                <v-divider class="mt-5"></v-divider>
              </v-list-item-subtitle>

            </v-list-item-content>

          </v-list-item>

        </v-list>

        <v-card-text v-if="!loading && !service.length">
          メンタリング契約が成立するとこちらに表示されます
        </v-card-text>

      </v-card>

    </v-container>

    <ContractCancel
      :sp="sp"
      :dialog="dialog"
      :contract="selected"
      @close="dialog=false"
      @cancel="onInit();dialog=false;"
    />

  </v-container>

</template>

<script>
import ContractCancel from '@/components/mypage/ContractCancel.vue'

export default {
  name: 'Mypage',
  components: { ContractCancel },
  computed: {
    user () {
      return this.$store.getters.user
    },
    api () {
      return this.$store.getters.api
    },
    env () {
      return this.$store.getters.env
    }
  },
  data: () => ({
    dialog: false,
    loading: true,
    sp: false,
    mentor: {
      rating: 0,
      fee: null,
      rank: null,
      answerCnt: 0,
      commentCnt: 0
    },
    service: [],
    selected: {}
  }),
  created () {
    this.onInit()
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  },
  methods: {
    onInit () {
      this.loading = true

      this.$apig.get('online', this.api.MENTOR, {
        teacherId: this.user.teacherId
      }, {
        queryParams: {
          type: 'mypage'
        }
      }, {})
        .then(response => {
          this.mentor = response.data.mentor
          this.service = response.data.service

          this.loading = false
        })
        .catch(err => {
          console.log(err.response.data)
          this.$store.commit('onErrorChanged', err.response.data)
          this.loading = false
        })
    },
    getAvatar (teacherId, photoId) {
      return `${this.env.VUE_APP_S3}/users/public/ap-northeast-1%3A${teacherId}/profile/${photoId}.medium.png`
    },
    handleResize: function () {
      if (window.innerWidth <= 800) {
        this.sp = true
      } else {
        this.sp = false
      }
    },
    finish (item) {
      this.selected = item
      this.dialog = true
    }
  }
}
</script>
