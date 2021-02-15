import apigClientFactory from 'aws-api-gateway-client'
import store from '@/store'
import cognito from '@/plugins/cognito'

export default class Apig {
  configure (config) {
    this.config = config
  }

  static install = (Vue, options) => {
    Object.defineProperty(Vue.prototype, '$apig', {
      get () { return this.$root._apig }
    })

    Vue.mixin({
      beforeCreate () {
        if (this.$options.apig) {
          this._apig = this.$options.apig
          this._apig.configure(options)
        }
      }
    })
  }

  // var pathParams = {
  //     This is where path request params go.
  //     userId: '1234',
  // };
  // // Template syntax follows url-template https://www.npmjs.com/package/url-template
  // var pathTemplate = '/users/{userID}/profile'
  // var method = 'GET';
  // var additionalParams = {
  //     //If there are query parameters or headers that need to be sent with the request you can add them here
  //     headers: {
  //         param0: '',
  //         param1: ''
  //     },
  //     queryParams: {
  //         param0: '',
  //         param1: ''
  //     }
  // };
  // var body = {
  //     //This is where you define the body of the request
  // };

  init (type = null) {
    return new Promise((resolve, reject) => {
      cognito.isAuthenticated()
        .then(credentials => {
          store.commit('onAuthStateChanged', credentials.data.Credentials)
          store.commit('onLoginStatusChanged', true)
          this.apigClient = apigClientFactory.newClient({
            region: this.config.region,
            invokeUrl: !type ? this.config.invokeUrl : this.config.invokeUrlOnline,
            accessKey: credentials.data.Credentials.AccessKeyId,
            secretKey: credentials.data.Credentials.SecretKey,
            sessionToken: credentials.data.Credentials.SessionToken
          })

          resolve()
        })
        .catch((err) => {
          console.log(err)
          reject(err)
        })
    })
  }

  initNoAuth (type = null) {
    return new Promise((resolve, reject) => {
      cognito.getCredentialsNoAuth()
        .then(credentials => {
          store.commit('onAuthStateChanged', credentials.data.Credentials)
          store.commit('onLoginStatusChanged', false)
          this.apigClient = apigClientFactory.newClient({
            region: this.config.region,
            invokeUrl: !type ? this.config.invokeUrl : this.config.invokeUrlOnline,
            accessKey: credentials.data.Credentials.AccessKeyId,
            secretKey: credentials.data.Credentials.SecretKey,
            sessionToken: credentials.data.Credentials.SessionToken
          })

          resolve()
        })
        .catch((err) => {
          console.log(err)
          reject(err)
        })
    })
  }

  invokeApi (type = null, pathParams, pathTemplate, method, additionalParams, body) {
    return new Promise((resolve, reject) => {
      this.init(type)
        .then(() => {
          this.apigInvokeApi(pathParams, pathTemplate, method, additionalParams, body)
            .then(data => {
              resolve(data)
            })
            .catch((err) => {
              reject(err)
            })
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  invokeApiNoAuth (type = null, pathParams, pathTemplate, method, additionalParams, body) {
    return new Promise((resolve, reject) => {
      this.initNoAuth(type)
        .then(() => {
          this.apigInvokeApi(pathParams, pathTemplate, method, additionalParams, body)
            .then(data => {
              resolve(data)
            })
            .catch((err) => {
              reject(err)
            })
        })
        .catch((err) => {
          reject(err)
        })
    })
  }

  apigInvokeApi (pathParams, pathTemplate, method, additionalParams, body) {
    return new Promise((resolve, reject) => {
      this.apigClient.invokeApi(pathParams, pathTemplate, method, additionalParams, body)
        .then(response => {
          resolve(response)
        }).catch(function (err) {
          console.log(err)
          reject(err)
        })
    })
  }

  get (type = null, pathTemplate, pathParams, additionalParams, body, isNoAuth) {
    if (!isNoAuth) {
      return new Promise((resolve, reject) => {
        this.invokeApi(type, pathParams, pathTemplate, 'GET', additionalParams, body)
          .then(function (response) {
            resolve(response)
          }).catch(function (err) {
            console.log(err)
            reject(err)
          })
      })
    } else {
      return new Promise((resolve, reject) => {
        this.invokeApiNoAuth(type, pathParams, pathTemplate, 'GET', additionalParams, body)
          .then(function (response) {
            resolve(response)
          }).catch(function (err) {
            console.log(err)
            reject(err)
          })
      })
    }
  }

  post (type = null, pathTemplate, pathParams, additionalParams, body) {
    return new Promise((resolve, reject) => {
      this.invokeApi(type, pathParams, pathTemplate, 'POST', additionalParams, body)
        .then(function (response) {
          resolve(response)
        }).catch(function (err) {
          console.log(err)
          reject(err)
        })
    })
  }

  patch (type = null, pathTemplate, pathParams, additionalParams, body, isNoAuth) {
    if (!isNoAuth) {
      return new Promise((resolve, reject) => {
        this.invokeApi(type, pathParams, pathTemplate, 'PATCH', additionalParams, body)
          .then(function (response) {
            resolve(response)
          }).catch(function (err) {
            console.log(err)
            reject(err)
          })
      })
    } else {
      return new Promise((resolve, reject) => {
        this.invokeApiNoAuth(type, pathParams, pathTemplate, 'PATCH', additionalParams, body)
          .then(function (response) {
            resolve(response)
          }).catch(function (err) {
            console.log(err)
            reject(err)
          })
      })
    }
  }

  getSignedURL (file, additionalParams) {
    const pathTemplate = store.getters.api.GETSIGNEDURL
    const body = {
      contentType: file.type,
      fileName: file.name
    }

    return new Promise((resolve, reject) => {
      this.invokeApi('online', {}, pathTemplate, 'POST', additionalParams, body)
        .then((res) => {
          resolve(res || '/')
        })
        .catch((err) => {
          console.log(err)
          reject(err)
        })
    })
  }
}
