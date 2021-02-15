<template>
  <video
    v-if="videoReceived"
    @loadeddata="onloadeddata"
    :srcObject.prop="option.video"
    :width="width"
    :height="height"
    style="-webkit-transform: scaleX(-1);"
  ></video>
</template>

<script>
export default {
  name: 'TheirVideo',
  data: () => {
    return {}
  },
  props: {
    option: {},
    width: String,
    height: String
  },
  computed: {
    videoReceived () {
      return this.option.video !== undefined && this.option.video !== null
    }
  },
  methods: {
    onloadeddata (ev) {
      ev.target.play()
    }
  }

}
</script>

<style scoped>
  video {
    width: 100%;
  }
</style>
