<template>
  <v-container fluid>
    <v-row v-if="loading">
      <v-col v-for="i in cols" :key="i" cols="12" md="3">
        <v-skeleton-loader
          ref="skeleton"
          :type="type"
          class="mx-auto"
          elevation="2"
        ></v-skeleton-loader>
      </v-col>
    </v-row>
    <v-row v-else>
      <v-col v-for="item in list" :key="item.questionId" cols="12" md="3">
        <v-card
          color="white"
          class="q-card pa-3"
          hover
          @click="$emit('openCard', item)"
        >
          <div class="d-flex align-center justify-space-between mb-3">
            <v-chip
              small
              :color="constant.SUBJECT[item.subject - 1].bg"
              :text-color="constant.SUBJECT[item.subject - 1].color"
              class="font-weight-bold"
            >
              {{constant.SUBJECT[item.subject - 1].text}}
            </v-chip>
            <p class="overline mb-0 grey--text text--darken-1 text-right">{{item.date}}</p>
          </div>
          <p class="body-2 text-truncate mb-0">{{item.detail1 || '未設定'}}</p>
          <p class="caption grey--text text--darken-1 text-truncate mb-0" v-if="constant.DETAIL_TEXT[item.objective].length > 1">{{item.detail2}}</p>
          <div class="q-card-footer d-flex align-center mt-2">
            <div v-if="item.oemflag" class="grey--text text--darken-1 body-2 d-none">MK</div>
            <div v-else-if="item.studentId" class="grey--text text--darken-1 body-2 d-none">パイセンQ</div>
            <div class="flex-grow-1 text-right">
              <span v-if="item.status === 4" class="caption grey--text text--darken-1">解決済み</span>
              <v-btn icon x-small v-if="item.answer_cnt" class="ml-2">
                <v-icon x-small>fas fa-pen</v-icon>{{item.answer_cnt}}
              </v-btn>
            </div>
          </div>
        </v-card>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
export default {
  name: 'QuestionCard',
  props: ['item'],
  computed: {
    api () {
      return this.$store.getters.api
    },
    constant () {
      return this.$store.getters.constant
    }
  },
  data () {
    return {
      loading: true,
      type: 'article',
      cols: 4,
      list: []
    }
  },
  created () {
    this.onInit()
  },
  methods: {
    onInit () {
      this.loading = true

      this.$apig.get('online', this.api.QUESTION, {
        questionId: this.$route.query.id ? this.$route.query.id : 'mentor'
      }, {
        queryParams: {
          type: this.item.subject ? 'subject' : this.item.type,
          sub: this.item.subject
        }
      }, {})
        .then(response => {
          this.list = response.data.list
          if (response.data.selected) this.$emit('openCard', response.data.selected)
          this.loading = false
        })
        .catch(err => {
          if (err.response) this.$store.commit('onErrorChanged', err.response.data)
          this.loading = false
        })
    }
  }
}
</script>

<style lang="scss" scoped>
  .q-card {
    height: 128px;
    position: relative;

    &-footer {
      position: absolute;
      bottom: 10px;
      left: 0;
      padding: 0 10px;
      width: 100%;
    }
  }
</style>
