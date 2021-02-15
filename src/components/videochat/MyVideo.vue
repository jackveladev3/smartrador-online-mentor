<template>
  <video
    :srcObject.prop="video"
    v-video="readyForMakeCall"
    width="267"
    height="200"
    style="-webkit-transform: scaleX(-1);"
  ></video>
</template>

<script>
export default {
  name: 'MyVideo',
  directives: {
    video (el, binding) {
      if (binding.value) {
        el.muted = true
        el.play()
      } else {
        el.pause()
      }
    }
  },
  props: {
    video: {
      required: true
    },
    readyForMakeCall: {
      type: Boolean
    }
  },
  methods: {},
  watch: {}
}
</script>

<style scoped>
  video {
    width: 100%;
  }
</style>
