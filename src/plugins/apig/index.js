import Vue from 'vue'
import Apig from './apig'

Vue.use(Apig, {
  invokeUrl: process.env.VUE_APP_APIG_INVOKE_URL,
  invokeUrlOnline: process.env.VUE_APP_APIG_ONLINE_INVOKE_URL,
  region: process.env.VUE_APP_APIG_REGION
})

export default new Apig()
