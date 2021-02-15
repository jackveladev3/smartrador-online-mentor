import {
  CognitoUserPool,
  CognitoUser,
  AuthenticationDetails,
  CognitoRefreshToken,
  CognitoUserAttribute
} from 'amazon-cognito-identity-js'
import AWS from 'aws-sdk'

export default class Cognito {
  configure (config) {
    this.config = config
    if (config.userPool) {
      this.userPool = config.userPool
    } else {
      this.userPool = new CognitoUserPool({
        UserPoolId: config.UserPoolId,
        ClientId: config.ClientId
      })
    }
    AWS.config.region = config.Region
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: config.IdentityPoolId
    })
    this.options = config
  }

  static install = (Vue, options) => {
    Object.defineProperty(Vue.prototype, '$cognito', {
      get () { return this.$root._cognito }
    })

    Vue.mixin({
      beforeCreate () {
        if (this.$options.cognito) {
          this._cognito = this.$options.cognito
          this._cognito.configure(options)
        }
      }
    })
  }

  /**
   * usernameでパスワード変更
   */
  forgotPassword (username) {
    const userData = { Username: username, Pool: this.userPool }
    const cognitoUser = new CognitoUser(userData)
    return new Promise((resolve, reject) => {
      cognitoUser.forgotPassword({
        onSuccess: (result) => {
          resolve(result)
        },
        onFailure: (err) => {
          reject(err)
        }
      })
    })
  }

  /**
   * 確認コードからパスワードを変更する
   */
  confirmPassword (username, confirmationCode, newPassword) {
    const userData = { Username: username, Pool: this.userPool }
    const cognitoUser = new CognitoUser(userData)
    return new Promise((resolve, reject) => {
      cognitoUser.confirmPassword(confirmationCode, newPassword, {
        onSuccess: (result) => {
          resolve(result)
        },
        onFailure: (err) => {
          reject(err)
        }
      })
    })
  }

  /**
   * 新規登録
   */
  signUp (email, password, gk) {
    const attributeList = []
    const dataEmail = {
      Name: 'email',
      Value: email
    }
    const dataWebsite = {
      Name: 'website',
      Value: 'smartthon'
    }
    var attributeEmail = new CognitoUserAttribute(dataEmail)
    var attributeWebsite = new CognitoUserAttribute(dataWebsite)

    attributeList.push(attributeEmail)
    attributeList.push(attributeWebsite)

    if (gk) {
      attributeList.push(new CognitoUserAttribute({
        Name: 'custom:gk',
        Value: gk
      }))
    }

    return new Promise((resolve, reject) => {
      this.userPool.signUp(email, password, attributeList, null, function (err, result) {
        if (err) {
          console.log(err)
          reject(err)
        }

        resolve(result.user)
      })
    })
  }

  /**
   * メールの認証
   */
  confirmRegistration (email, code) {
    const userData = { Username: email, Pool: this.userPool }
    const cognitoUser = new CognitoUser(userData)
    return new Promise((resolve, reject) => {
      cognitoUser.confirmRegistration(code, true, function (err, result) {
        if (err) {
          console.log(err)
          reject(err)
        }

        resolve(result)
      })
    })
  }

  /**
   * username, passwordでログイン
   */
  login (username, password) {
    const userData = { Username: username, Pool: this.userPool }
    const cognitoUser = new CognitoUser(userData)
    const authenticationData = { Username: username, Password: password }
    const authenticationDetails = new AuthenticationDetails(authenticationData)
    return new Promise((resolve, reject) => {
      cognitoUser.authenticateUser(authenticationDetails, {
        onSuccess: (result) => {
          this.getCredentials(result)
            .then(credentials => {
              resolve(credentials)
            })
            .catch(err => {
              reject(err)
            })
        },
        onFailure: (err) => {
          reject(err)
        }
      })
    })
  }

  /**
   * ログアウト
   */
  logout () {
    var cognitoUser = this.userPool.getCurrentUser()
    if (cognitoUser != null) {
      if (AWS.config.credentials && AWS.config.credentials.clearCachedId) {
        AWS.config.credentials.clearCachedId()
      }
      cognitoUser.signOut()
    }
  }

  /**
   * ログインしているかの判定とアクセストークン取得
   */
  isAuthenticated () {
    const cognitoUser = this.userPool.getCurrentUser()
    return new Promise((resolve, reject) => {
      if (cognitoUser === null) {
        console.log('cognitoUser is none')
        reject(cognitoUser)
      }
      cognitoUser.getSession((err, session) => {
        if (err) {
          reject(err)
        } else {
          if (!session.isValid()) {
            this.refreshSession(cognitoUser, session)
              .then(newSession => {
                this.getCredentials(newSession)
                  .then(credentials => {
                    resolve(credentials)
                  })
                  .catch(err => {
                    reject(err)
                  })
              })
              .catch(err => {
                reject(err)
              })
          } else {
            this.getCredentials(session)
              .then(credentials => {
                resolve(credentials)
              })
              .catch(err => {
                reject(err)
              })
          }
        }
      })
    })
  }

  /**
  * クレデンシャル情報の取得
  */
  getCredentials (session) {
    const Logins = {}
    Logins[`cognito-idp.ap-northeast-1.amazonaws.com/${this.config.UserPoolId}`] = session.getIdToken().getJwtToken()
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this.config.IdentityPoolId,
      Logins
    })

    return new Promise((resolve, reject) => {
      AWS.config.credentials.get(function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(AWS.config.credentials)
        }
      })
    })
  }

  /**
   * 未承認ユーザーのcredential取得
   */
  getCredentialsNoAuth () {
    AWS.config.credentials = new AWS.CognitoIdentityCredentials({
      IdentityPoolId: this.config.IdentityPoolId
    })

    return new Promise((resolve, reject) => {
      AWS.config.credentials.get(function (err) {
        if (err) {
          reject(err)
        } else {
          resolve(AWS.config.credentials)
        }
      })
    })
  }

  /**
  * リフレッシュ
  */
  refreshSession (cognitoUser, session) {
    const RefreshToken = new CognitoRefreshToken({ RefreshToken: session.getRefreshToken().getToken() })
    return new Promise((resolve, reject) => {
      cognitoUser.refreshSession(RefreshToken, (err, newSession) => {
        if (err) reject(err)
        else resolve(newSession)
      })
    })
  }

  /**
  * 属性の更新
  */
  updateAttributes (name, value) {
    const cognitoUser = this.userPool.getCurrentUser()
    return new Promise(function (resolve, reject) {
      cognitoUser.getSession((err, session) => { // eslint-disable-line no-unused-vars
        if (err) {
          console.log(err)
          reject(err)
        }

        var attributeList = []
        var attribute = new CognitoUserAttribute({
          Name: name,
          Value: value
        })

        attributeList.push(attribute)

        cognitoUser.updateAttributes(attributeList, function (err) {
          if (err) {
            console.log('failed updateAttributes: ' + JSON.stringify(err))
            reject(err)
          } else {
            resolve(function () {
              return this.getAttributeVerificationCode(cognitoUser)
            })
          }
        })
      })
    })
  }

  /**
  * 検証コードの取得
  */
  getAttributeVerificationCode (cognitoUser) {
    return new Promise(function (resolve, reject) {
      cognitoUser.getSession((err, session) => { // eslint-disable-line no-unused-vars
        if (err) {
          console.log(err)
          reject(err)
        }
        cognitoUser.getAttributeVerificationCode('email', {
          onSuccess: function () {
            resolve()
          },
          onFailure: function (err) {
            console.log('failed getAttributeVerificationCode: ' + JSON.stringify(err))
            reject(err)
          }
        })
      })
    })
  }

  /**
  * 検証コードの認証
  */
  verifyAttribute (code) {
    const cognitoUser = this.userPool.getCurrentUser()
    return new Promise(function (resolve, reject) {
      cognitoUser.getSession((err, session) => { // eslint-disable-line no-unused-vars
        if (err) {
          console.log(err)
          reject(err)
        }
        cognitoUser.verifyAttribute('email', code, {
          onSuccess: function (result) {
            resolve(result)
          },
          onFailure: function (err) {
            console.log('email verification failed')
            reject(err)
          }
        })
      })
    })
  }

  /**
  * パスワードの変更
  */
  changePassword (oldPassword, newPassword) {
    const cognitoUser = this.userPool.getCurrentUser()
    return new Promise(function (resolve, reject) {
      cognitoUser.getSession((err, session) => { // eslint-disable-line no-unused-vars
        if (err) {
          console.log(err)
          reject(err)
        }
        cognitoUser.changePassword(oldPassword, newPassword, function (err, result) {
          if (err) {
            console.log(err)
            reject(err)
          }
          resolve(result)
        })
      })
    })
  }
}
