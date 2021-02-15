<template>
  <v-dialog
    v-model="dialog"
    max-width="720px"
    scrollable
    @click:outside="$emit('close');upload=false;"
    class="d-md-block d-none"
    :fullscreen="sp"
    :hide-overlay="sp"
    :transition="sp ? 'dialog-bottom-transition' : 'dialog-transition'"
  >
    <v-card>
      <v-toolbar dark color="success" height="56px" max-height="56px">
        <v-toolbar-title class="text-truncate">{{item.detail1}}</v-toolbar-title>
        <v-spacer></v-spacer>
        <v-toolbar-items>
          <v-btn icon dark @click="$emit('close');upload=false;">
            <v-icon>mdi-close</v-icon>
          </v-btn>
        </v-toolbar-items>
      </v-toolbar>

      <v-card-text class="pt-4" v-if="item.subject">
        <p class="body-1">質問したい内容</p>
        <div class="d-flex align-center mb-2" v-if="item.subject">
          <v-icon small color="success" class="mr-2">fas fa-hashtag</v-icon>
          {{constant.SUBJECT[item.subject - 1].text}}
        </div>
        <div class="d-flex align-center mb-2" v-if="item.objective">
          <v-icon small color="success" class="mr-2">far fa-question-circle</v-icon>
          {{constant.OBJECTIVE[item.objective - 1].text}}
        </div>
        <div class="d-flex align-center mb-2" v-if="item.objective">
          <v-icon small color="success" class="mr-2">fas fa-clock</v-icon>
          {{item.date}}
        </div>
        <div class="d-none align-center mb-2" v-if="item.studentId">
          <v-icon small color="success" class="mr-2">fas fa-globe</v-icon>パイセンQ
        </div>
        <div class="d-flex align-center mb-2" v-if="item.status === 4">
          <v-icon small color="success" class="mr-2">fas fa-check</v-icon>解決済み
        </div>
        <div class="border-top my-4"></div>
        <p>{{constant.DETAIL_TEXT[item.objective][0]}}</p>
        <p class="question">{{item.detail1}}</p>
        <p
          v-if="constant.DETAIL_TEXT[item.objective].length > 1"
        >{{constant.DETAIL_TEXT[item.objective][1]}}</p>
        <p v-if="constant.DETAIL_TEXT[item.objective].length > 1" class="question">{{item.detail2}}</p>

        <div v-if="item.question_img.length" class="mb-4">
          <p>問題の画像</p>
          <div class="d-flex flex-wrap">
            <div v-for="(rec, i) in item.question_img" :key="i" style="position:relative;">
              <v-img
                :src="getQuestionSource(rec)"
                width="120px"
                height="120px"
                cover
                transition="scale-transition"
                class="shrink mb-2 mr-2 rounded"
              />

              <v-btn icon small class="close" @click="open(getQuestionSource(rec))">
                <v-icon small>far fa-window-restore</v-icon>
              </v-btn>
            </div>
          </div>
        </div>
        <div v-if="item.answer_img.length">
          <p>答えの画像</p>
          <div class="d-flex flex-wrap">
            <div v-for="(rec, i) in item.answer_img" :key="i" style="position:relative;">
              <v-img
                :src="getAnswerSource(rec)"
                width="120px"
                height="120px"
                cover
                transition="scale-transition"
                class="shrink mb-2 mr-2 rounded"
              />
              <v-btn icon small class="close" @click="open(getAnswerSource(rec))">
                <v-icon small>far fa-window-restore</v-icon>
              </v-btn>
            </div>
          </div>
        </div>

        <div v-if="item.status !== 4">
          <p>あなたの回答</p>
          <p class="caption">回答するとあなたの詳細ページへのリンクがつきます</p>
          <v-skeleton-loader
            ref="skeleton"
            :type="type"
            class="mx-auto border"
            v-if="loading.screen"
          ></v-skeleton-loader>
          <v-card class="mx-auto" outlined v-else>
            <v-card-title>
              <v-img
                alt="smartrador Logo"
                class="shrink mr-2 avatar"
                cover
                :src="avatar"
                width="36px"
                height="36px"
                v-if="avatar"
              />
              <v-icon v-else class="mr-2" large>fas fa-user-circle</v-icon>
              <p class="body-2 mb-0">{{user.initial}}</p>
              <p class="body-2 grey--text text--darken-2 ml-2 mb-0">{{user.school}}</p>
              <p class="body-2 grey--text text--darken-2 ml-2 mb-0">{{user.grade}}</p>
              <v-img
                alt="認定バッチ"
                class="shrink ml-2 medal"
                src="@/assets/medal.svg"
                v-if="user.isCertified"
              />
            </v-card-title>
            <v-card-text>
              <v-textarea
                v-model="answer.description"
                label="こちらに回答を入力してください"
                auto-grow
                color="success"
                required
              ></v-textarea>
              <div class="d-flex flex-wrap" v-if="upload">
                <dropzone
                  :type="getQuestionType()"
                  :category="'images'"
                  @data="getDropzoneData"
                  class="mb-2 mr-2"
                ></dropzone>
                <div v-for="(id, i) in answer.images" :key="i" style="position:relative;">
                  <v-img
                    :src="getMentorAnswerSource(id)"
                    width="120px"
                    height="120px"
                    cover
                    transition="scale-transition"
                    class="shrink mb-2 mr-2 rounded"
                  />
                  <v-icon class="close" @click="remove(i, 'images')">fas fa-times-circle</v-icon>
                </div>
              </div>
              <p class="caption mb-0" v-if="upload">※1ファイル3MBまで</p>
              <div class="text-right">
                <v-btn
                  small
                  icon
                  @click="upload=!upload"
                  color="success"
                  class="mr-3"
                  :disabled="loading.answer"
                >
                  <v-icon small>fas fa-paperclip</v-icon>
                </v-btn>
                <v-btn
                  small
                  icon
                  @click="postAnswer"
                  color="success"
                  :loading="loading.answer"
                  :disabled="!answer.description"
                >
                  <v-icon small>fas fa-paper-plane</v-icon>
                </v-btn>
              </div>
            </v-card-text>
          </v-card>
        </div>

        <div class="mt-5">
          <p>これまでの回答</p>
          <v-skeleton-loader
            ref="skeleton"
            :type="type"
            class="mx-auto border"
            v-if="loading.screen"
          ></v-skeleton-loader>
          <div v-else>
            <p v-if="!answers.length" class="answer">まだ回答はありません</p>
            <v-card class="mx-auto mb-5" outlined v-for="answer in answers" :key="answer.teacherId">
              <v-card-title>
                <v-img
                  alt="smartrador Logo"
                  class="shrink mr-2 avatar"
                  cover
                  :src="getAvatar(answer.teacherId, answer.photoId)"
                  width="36px"
                  height="36px"
                  v-if="answer.photoFlag == '2'"
                />
                <v-icon v-else class="mr-2" large>fas fa-user-circle</v-icon>
                <div>
                  <div class="d-flex algin-center">
                    <p class="body-2 mb-0">{{answer.initial}}</p>
                    <p class="body-2 grey--text text--darken-2 ml-2 mb-0">{{answer.school}}</p>
                    <p class="body-2 grey--text text--darken-2 ml-2 mb-0">{{answer.grade}}</p>
                    <v-img
                      alt="認定バッチ"
                      class="shrink ml-2 medal"
                      src="@/assets/medal.svg"
                      v-if="answer.isCertified"
                    />
                  </div>
                  <p class="caption grey--text text--darken-2 mb-0">{{answer.date}}</p>
                </div>
              </v-card-title>
              <v-card-text>
                <p class="answer">{{answer.description}}</p>
                <div class="d-flex flex-wrap">
                  <div v-for="(image, i) in answer.images" :key="i" style="position:relative;">
                    <v-img
                      :src="getMentorAnswerSource(image)"
                      width="120px"
                      height="120px"
                      cover
                      transition="scale-transition"
                      class="shrink mb-2 mr-2 rounded"
                    />
                    <v-btn
                      icon
                      small
                      class="close"
                      @click="open(getMentorAnswerSource(image))"
                    >
                      <v-icon small>far fa-window-restore</v-icon>
                    </v-btn>
                  </div>
                </div>
                <div class="d-flex align-center justify-space-between">
                  <v-btn
                    small
                    icon
                    @click="answer.comment=!answer.comment"
                    color="success"
                    class="mr-3"
                  >
                    <v-icon small>far fa-comment-dots</v-icon>
                    {{answer.commentCnt}}
                  </v-btn>
                  <div class="text-right">
                    <v-btn small disabled color="orange" class="mb-3 mb-md-0">
                      メンターに相談する
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                    <v-btn small disabled color="primary" class="ml-3">
                      家庭教師をお願いする
                      <v-icon>mdi-chevron-right</v-icon>
                    </v-btn>
                  </div>
                </div>
                <div v-if="answer.comment">
                  <QuestionComment :answer="answer" :question="item" />
                </div>
              </v-card-text>
            </v-card>
          </div>
        </div>
      </v-card-text>
    </v-card>
  </v-dialog>
</template>

<script>
import Dropzone from '@/components/share/Dropzone.vue'
import QuestionComment from './QuestionComment.vue'

export default {
  name: 'QuestionDetail',
  props: ['dialog', 'item'],
  components: {
    Dropzone,
    QuestionComment
  },
  computed: {
    constant () {
      return this.$store.getters.constant
    },
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
      sp: false,
      loading: {
        screen: true,
        answer: false
      },
      type: 'list-item-avatar-two-line,list-item-three-line,actions',
      answer: {
        description: '',
        images: []
      },
      upload: false,
      answers: [],
      isAnswered: false
    }
  },
  created () {
    window.addEventListener('resize', this.handleResize)
    this.handleResize()
  },
  methods: {
    open (url) {
      window.open(url, '_blank')
    },
    getQuestionSource (file) {
      return this.env.VUE_APP_S3 + (!this.item.studentId ? '/online/public/question/' : ((this.item.oemflag === 'mk') ? '/meiko/question/' : '/paisen/question/')) + file + '.png'
    },
    getAnswerSource (file) {
      return this.env.VUE_APP_S3 + (!this.item.studentId ? '/online/public/answer/' : ((this.item.oemflag) ? '/meiko/question/' : '/paisen/question/')) + file + '.png'
    },
    getMentorAnswerSource (file) {
      return this.env.VUE_APP_S3 + (!this.item.studentId ? '/online/public/mentor/answer/' : ((this.item.oemflag) ? '/meiko/answer/' : '/paisen/answer/')) + file + '.png'
    },
    getQuestionType () {
      return !this.item.studentId ? 'mentor-answer' : ((this.item.oemflag === 'mk') ? 'mentor-answer-mk' : 'mentor-answer-ps')
    },
    handleResize: function () {
      if (window.innerWidth <= 800) this.sp = true
      else this.sp = false
    },
    getAnswers (questionId, isPaisen, oemflagExist = false) {
      this.loading.screen = true
      this.isAnswered = false
      let typeStr

      if (!isPaisen) typeStr = 'answer'
      else if (oemflagExist) typeStr = 'answer-mk'
      else typeStr = 'answer-ps'

      this.$apig
        .get(
          'online',
          this.api.QUESTION,
          {
            questionId: questionId || this.item.questionId
          },
          {
            queryParams: {
              type: typeStr
            }
          },
          {}
        )
        .then((response) => {
          this.answer = response.data.own
          if (this.answer.images.length) this.upload = true
          if (this.answer.description) this.isAnswered = true
          this.answers = response.data.other
          this.loading.screen = false
        })
        .catch((err) => {
          this.$store.commit('onErrorChanged', err.response.data)
          this.loading.screen = false
        })
        .catch((err) => {
          this.$store.commit('onErrorChanged', err.response.data)
          this.loading.screen = false
        })
    },
    postAnswer () {
      this.loading.answer = true
      let type = this.isAnswered ? 'update-answer' : 'answer'

      if (this.item.studentId && this.item.oemflag) type += '-mk'
      else if (this.item.studentId) type += '-ps'

      this.$apig
        .patch(
          'online',
          this.api.QUESTION,
          {
            questionId: this.item.questionId
          },
          {
            queryParams: {
              type
            }
          },
          {
            parentId: this.item.parentId,
            studentId: this.item.studentId,
            ...this.answer
          }
        )
        .then(() => {
          this.$emit('complete')
          this.answer = {
            description: '',
            images: []
          }
          this.loading.answer = false
        })
        .catch((err) => {
          this.$store.commit('onErrorChanged', err.response.data)
          this.loading.answer = false
        })
    },
    getDropzoneData (data) {
      setTimeout(() => {
        this.answer[data.key].push(data.fileId)
      }, 1000)
    },
    remove (i, key) {
      this.answer[key].splice(i, 1)
    },
    getAvatar (teacherId, photoId) {
      return `${this.env.VUE_APP_S3}/users/public/ap-northeast-1%3A${teacherId}/profile/${photoId}.medium.png`
    }
  }
}
</script>

<style scoped lang="scss">
.border-top {
  border-top: 1px solid rgba(97, 78, 78, 0.1);
}

.border-bottom {
  border-bottom: 1px solid rgba(0, 0, 0, 0.1);
}

.border {
  border: 1px solid rgba(0, 0, 0, 0.1);
}

.close {
  position: absolute;
  top: 5px;
  right: 13px;
  background: #ffffff;
  border-radius: 50%;
}

.question {
  padding: 14px;
  background: #f9f7f5;
  border-radius: 4px;
  color: #212121;
  white-space: pre-line;
}

.answer {
  color: #212121;
  white-space: pre-line;
}
</style>
