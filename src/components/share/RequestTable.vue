<template>
  <table class="req-table" border="1" bordercolor="#bdbdbd" v-if="request">
    <tr>
      <td colspan="2">
        <v-icon color="success" size="16px" class="mr-2">fas fa-flag-checkered</v-icon>
        <b>{{constant.MENTOR_OBJECTIVE[request.objective - 1].text}}</b>
      </td>
    </tr>
    <tr>
      <td class="req-table-thread grey--text text--darken-1">
        目標
      </td>
      <td>
        {{request.objective_text}}
      </td>
    </tr>
    <tr>
      <td class="req-table-thread grey--text text--darken-1">
        メンターにお願いしたいこと
      </td>
      <td>
        <span
          class="my-2 mr-2 chip-origin primary--text"
          v-for="item of request.support"
          :key="item"
        >
          {{item}}
        </span>
      </td>
    </tr>
    <tr>
      <td class="req-table-thread grey--text text--darken-1">
        現状
      </td>
      <td>
        {{request.current}}
      </td>
    </tr>
    <tr>
      <td class="req-table-thread grey--text text--darken-1">
        希望するチャットの返信速度
      </td>
      <td>
        {{constant.MENTOR_CHAT[request.chat - 1].text}}
      </td>
    </tr>
    <tr>
      <td class="req-table-thread grey--text text--darken-1">
        希望するビデオチャットの頻度
      </td>
      <td>
        {{constant.MENTOR_VIDEO[request.video - 1].text}}
      </td>
    </tr>
    <tr v-if="request.message">
      <td class="req-table-thread grey--text text--darken-1">
        メンターへのメッセージ
      </td>
      <td>
        {{request.message}}
      </td>
    </tr>
  </table>
</template>

<script>
export default {
  name: 'RequestTable',
  props: ['request'],
  computed: {
    constant () {
      return this.$store.getters.constant
    }
  }
}
</script>

<style scoped lang="scss">
</style>
