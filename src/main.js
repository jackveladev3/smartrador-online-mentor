import Vue from 'vue'
import App from './App.vue'
import router from './router'
import store from './store'
import cognito from './plugins/cognito'
import apig from './plugins/apig'
import vuetify from './plugins/vuetify'
import VueGtm from 'vue-gtm'
import Amplify, * as AmplifyModules from 'aws-amplify'
import { AmplifyPlugin } from 'aws-amplify-vue'
import VueChatScroll from 'vue-chat-scroll'

Amplify.configure({
  aws_appsync_graphqlEndpoint: process.env.VUE_APP_GRAPHQL_ENDPOINT,
  aws_appsync_region: process.env.VUE_APP_GRAPHQL_REGION,
  aws_appsync_authenticationType: process.env.VUE_APP_GRAPHQL_AUTH_TYPE,
  aws_appsync_apiKey: process.env.VUE_APP_GRAPHQL_APIKEY
})

Vue.use(AmplifyPlugin, AmplifyModules)
Vue.use(VueChatScroll)
Vue.use(VueGtm, {
  id: 'GTM-KCCFH42',
  enabled: true,
  debug: false,
  vueRouter: router
})

Vue.config.productionTip = false

new Vue({
  router,
  store,
  cognito,
  apig,
  vuetify,
  render: h => h(App)
}).$mount('#app')
