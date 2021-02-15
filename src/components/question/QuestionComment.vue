<template>
  <div class="comment-area mt-5 rounded">
    <v-skeleton-loader
      ref="skeleton"
      type="list-item-avatar-two-line"
      class="mx-auto"
      v-if="loading.comment"
    ></v-skeleton-loader>
    <div v-else>
      <v-text-field label="コメント" v-model="text" background-color="white" rounded>
        <template v-slot:prepend>
          <v-img
            alt="smartrador Logo"
            class="shrink avatar"
            cover
            :src="avatar"
            v-if="avatar"
            width="24px"
            height="24px"
          />
          <v-icon v-else>fas fa-user-circle</v-icon>
        </template>
        <template v-slot:append-outer>
          <v-btn
            icon
            small
            color="success"
            @click="postComment('post', 'comment')"
            :loading="loading.post"
          >
            <v-icon small>fas fa-paper-plane</v-icon>
          </v-btn>
        </template>
      </v-text-field>
      <div v-for="item in comments" :key="item.commentId" class="d-flex align-start">
        <v-img
          alt="smartrador Logo"
          class="shrink avatar mr-3"
          cover
          :src="getAvatar(item.teacherId, item.photoId)"
          v-if="item.type === 'teacher' && item.photoFlag !== '0'"
          width="24px"
          height="24px"
        />
        <v-img
          alt="smartrador Logo"
          class="shrink avatar mr-3"
          cover
          :src="item.photoId"
          v-else-if="item.type === 'student' && item.photoFlag"
          width="24px"
          height="24px"
        />
        <v-icon v-else class="mr-3">fas fa-user-circle</v-icon>
        <div>
          <div class="comment-area-list">
            <p class="caption mb-2">{{item.initial}} {{item.school}} {{item.grade}}</p>
            <p class="text-origin mb-1">{{item.comment}}</p>
          </div>
          <p class="mt-1 caption">{{item.date}}</p>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'QuestionComment',
  props: ['answer', 'question'],
  computed: {
    env () {
      return this.$store.getters.env
    },
    api () {
      return this.$store.getters.api
    },
    user () {
      return this.$store.getters.user
    },
    avatar () {
      return this.$store.getters.avatar
    }
  },
  data () {
    return {
      loading: {
        comment: false,
        post: false
      },
      comments: [],
      text: ''
    }
  },
  created () {
    var oemflagExist = false
    if (this.question.oemflag) oemflagExist = true
    else oemflagExist = false

    this.getComments(this.question.questionId, oemflagExist)
  },
  methods: {
    postComment (type, key) {
      this.loading[type] = true
      var typeStr
      if (!this.question.studentId) typeStr = 'comment'
      else if (this.question.oemflag) typeStr = 'comment-mk'
      else typeStr = 'comment-ps'

      this.$apig
        .patch(
          'online',
          this.api.QUESTION,
          {
            questionId: this.question.questionId
          },
          {
            queryParams: {
              type: typeStr
            }
          },
          {
            answer: this.answer,
            text: this.text,
            parentId: this.question.parentId,
            studentId: this.question.studentId,
            type: 'teacher'
          }
        )
        .then(() => {
          this.text = ''
          var oemflagExist
          if (this.question.oemflag) oemflagExist = true
          else oemflagExist = false

          this.getComments(this.question.questionId, oemflagExist)
          this.loading[type] = false
        })
        .catch((err) => {
          this.$store.commit('onErrorChanged', err.response.data)
          this.loading[type] = false
        })
    },
    getComments (questionId, oemflag = false) {
      this.loading.comment = true
      let typeStr

      if (!this.question.studentId) typeStr = 'comment'
      else if (oemflag) typeStr = 'comment-mk'
      else typeStr = 'comment-ps'

      this.$apig
        .get(
          'online',
          this.api.QUESTION,
          {
            questionId: questionId + '_' + this.answer.teacherId
          },
          {
            queryParams: {
              type: typeStr
            }
          },
          {}
        )
        .then((response) => {
          this.comments = response.data
          this.loading.comment = false
        })
        .catch((err) => {
          this.$store.commit('onErrorChanged', err.response.data)
          this.loading.comment = false
        })
    },
    getAvatar (teacherId, photoId) {
      return `${this.env.VUE_APP_S3}/users/public/ap-northeast-1%3A${teacherId}/profile/${photoId}.medium.png`
    }
  }
}
</script>

<style scoped lang="scss">
.comment-area {
  background: #f9f7f5;
  padding: 14px;

  &-list {
    background: #fff;
    border-radius: 10px;
    padding: 4px 8px;
  }
}
</style>
