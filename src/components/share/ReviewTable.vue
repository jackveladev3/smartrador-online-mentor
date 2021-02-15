<template>
  <div>
    <table v-if="!sp" class="req-table" border="1" bordercolor="#bdbdbd">
      <tr>
        <td v-for="(item, i) in constant.REVIEW_AXIS" :key="i" class="req-table-thread text-center">
          {{item.text}}
        </td>
      </tr>
      <tr>
        <td v-for="(item, i) in constant.REVIEW_AXIS" :key="i" class="text-center">
          <v-rating
            v-model="request.review.rating[i]"
            color="orange"
            background-color="orange"
            size="14px"
            dense
          ></v-rating>
        </td>
      </tr>
      <tr v-if="request.review.message">
        <td colspan="3">
          <p class="req-table-thread grey--text text--darken-1 mb-2">コメント</p>
          {{request.review.message}}
        </td>
      </tr>
    </table>

    <table v-else class="req-table" border="1" bordercolor="#bdbdbd">
      <tr v-for="(item, i) in constant.REVIEW_AXIS" :key="i">
        <td>
          {{item.text}}
        </td>
        <td class="req-table-thread text-center">
          <v-rating
            v-model="request.review.rating[i]"
            color="orange"
            background-color="orange"
            size="14px"
            dense
          ></v-rating>
        </td>
      </tr>
      <tr>
        <td colspan="2" v-if="request.review.message">
          <p class="req-table-thread grey--text text--darken-1 mb-2">コメント</p>
          {{request.review.message}}
        </td>
      </tr>
    </table>

    <div class="pt-5 grey--text text--darken-1" v-if="request.support">
      お願いしたいこと・・・<span>{{request.support.join('、')}}</span>
    </div>
  </div>
</template>

<script>
export default {
  name: 'ReportTable',
  props: ['request', 'sp'],
  computed: {
    constant () {
      return this.$store.getters.constant
    }
  },
  methods: {
    getDate (str) {
      const dt = new Date(str)
      return `${dt.getFullYear()}/${dt.getMonth() + 1}/${dt.getDate()} ${dt.getHours()}:${dt.getMinutes()}`
    }
  }
}
</script>
