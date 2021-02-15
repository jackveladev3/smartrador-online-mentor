var Validator = require('validatorjs')
Validator.useLang('ja')

export default {
  name: 'SignIn',
  computed: {
    env () {
      return this.$store.getters.env
    }
  },
  data: () => ({
    loginParam: {
      email: '',
      password: '',
      emailError: '',
      passwordError: '',
      isPush: false
    },
    forgotParam: {
      email: '',
      code: '',
      newPassword: '',
      emailError: '',
      passwordError: '',
      codeError: '',
      isPush: false
    },
    tab: '1',
    isConfirm: false,
    isSuccess: false,
    message: '',
    isAlert: false,
    isActivate: false,
    error: {},
    validation: {
      username: false,
      password: false
    },
    timeout: 0
  }),
  methods: {
    login (evt) {
      evt.preventDefault()

      this.loginParam.isPush = true

      const v = new Validator({
        メールアドレス: this.loginParam.email,
        パスワード: this.loginParam.password
      }, {
        メールアドレス: 'required|email',
        パスワード: 'required|min:8'
      })

      const pass = v.passes()

      this.loginParam.emailError = v.errors.first('メールアドレス')
      this.loginParam.passwordError = v.errors.first('パスワード')

      if (!pass) {
        this.loginParam.isPush = false
      } else {
        this.$cognito.login(this.loginParam.email, this.loginParam.password)
          .then(credentials => {
            this.$store.commit('onAuthStateChanged', credentials.data.Credentials)
            this.$store.commit('onUserStateChanged', {
              studentId: credentials.data.IdentityId.replace('ap-northeast-1:', ''),
              email: this.loginParam.email,
              gk: this.$route.query.gk
            })
            this.$store.commit('onLoginStatusChanged', true)
            this.$router.push(this.$route.query.redirect || '/home')
          })
          .catch(err => {
            this.isAlert = true
            this.error = err
            this.loginParam.password = ''
            this.loginParam.isPush = false
          })
      }
    },
    forgotPassword (evt) {
      evt.preventDefault()
      this.forgotParam.isPush = true

      if (!this.isConfirm) {
        const v = new Validator({
          メールアドレス: this.forgotParam.email
        }, {
          メールアドレス: 'required|email'
        })

        const pass = v.passes()

        this.forgotParam.emailError = v.errors.first('メールアドレス')

        if (!pass) {
          this.forgotParam.isPush = false
        } else {
          this.$cognito.forgotPassword(this.forgotParam.email)
            .then(result => { // eslint-disable-line no-unused-vars
              this.isConfirm = true
              this.isSuccess = true
              this.message = '登録メールアドレスに検証コードを送信しました'
              this.forgotParam.isPush = false
            })
            .catch(err => {
              this.isAlert = true
              this.error = err
              this.forgotParam.email = ''
              this.forgotParam.isPush = false
            })
        }
      } else {
        const v = new Validator({
          メールアドレス: this.forgotParam.email,
          検証コード: this.forgotParam.code,
          新しいパスワード: this.forgotParam.newPassword
        }, {
          メールアドレス: 'required|email',
          検証コード: 'required|size:6',
          新しいパスワード: 'required|min:8'
        })

        const pass = v.passes()

        this.forgotParam.emailError = v.errors.first('メールアドレス')
        this.forgotParam.codeError = v.errors.first('検証コード')
        this.forgotParam.passwordError = v.errors.first('新しいパスワード')

        if (!pass) {
          this.forgotParam.isPush = false
        } else {
          this.$cognito.confirmPassword(this.forgotParam.email, this.forgotParam.code, this.forgotParam.newPassword)
            .then(result => { // eslint-disable-line no-unused-vars
              this.isSuccess = true
              this.message = 'パスワードを変更しました'
              this.loginParam.email = this.forgotParam.email
              this.forgotParam = {}
              this.tab = '1'
              this.forgotParam.isPush = false
            })
            .catch(err => {
              this.isAlert = true
              this.error = err
              this.forgotParam.code = ''
              this.forgotParam.newPassword = ''
              this.forgotParam.isPush = false
            })
        }
      }
    },
    checkEmail (email) {
      const v = new Validator({
        メールアドレス: email
      }, {
        メールアドレス: 'required|email'
      })

      const pass = v.passes()

      return pass ? true : v.errors.first('メールアドレス')
    },
    checkPassword (password) {
      const v = new Validator({
        パスワード: password
      }, {
        パスワード: 'required|min:8'
      })

      const pass = v.passes()

      return pass ? true : v.errors.first('パスワード')
    },
    checkCode (code) {
      const v = new Validator({
        検証コード: code
      }, {
        検証コード: 'required|size:6'
      })

      const pass = v.passes()

      return pass ? true : v.errors.first('検証コード')
    }
  },
  mounted () {
    if (this.$route.query.activate) {
      this.isActivate = true
      this.error.message = 'メールアドレスを認証しました。ログインして会員登録にお進みください。'
    }
  }
}
