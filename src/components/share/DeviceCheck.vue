<template>
  <div>
    <v-dialog
      v-model="checkDevice"
      persistent
      no-click-animation
      max-width="800px"
      width="75vw"
    >

      <v-stepper v-model="stepNow">

        <v-stepper-header>
          <v-stepper-step
            :complete="stepNow > 1"
            step="1"
            color="success"
          >
            カメラ・マイクをON
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step
            :complete="stepNow > 2"
            step="2"
            color="success"
          >
            カメラ・マイクの確認
          </v-stepper-step>
          <v-divider></v-divider>
          <v-stepper-step
            :complete="stepNow > 3"
            step="3"
            color="success"
          >
            スピーカーの確認
          </v-stepper-step>
        </v-stepper-header>

        <v-stepper-items>

          <v-stepper-content step="1">
            <v-card flat class="mb-10">
              <v-img
                src="@/assets/permission.jpg"
                contain
                transition="scale-transition"
                class="shrink rounded"
              />
            </v-card>
            <p class="body-2">カメラとマイクを許可すると「次へ」が押せるようになります</p>
            <v-btn
              :disabled="!step1Ready"
              color="success"
              @click="stepNow=2;play();"
            >
              次へ
            </v-btn>
          </v-stepper-content>

          <v-stepper-content step="2">
            <v-card flat class="mb-12">
              <v-container fluid>
                <div class="d-flex align-center flex-column mb-5">
                  <v-card
                    height="200px"
                    width="267px"
                  >
                    <video
                      ref="videoPlay"
                      width="267"
                      height="200"
                      style="-webkit-transform: scaleX(-1);"
                      @loadeddata="onloadeddata"
                      :srcObject.prop="stream"
                    ></video>
                  </v-card>
                </div>
                <div class="text-center">
                  <canvas ref="mikeInput" width="243" height="40" class="volume"></canvas>
                  <div class="mt-5">
                    <p class="body-2">「スピーカーの確認」で使用する3秒間の音声を録音してください</p>
                    <v-btn
                      icon
                      color="success"
                      :disabled="!mikeChecked"
                      :loading="nowRecording"
                      @click="startVoiceRecording"
                    >
                      <v-icon>fas fa-microphone</v-icon>
                    </v-btn>
                    <p class="body-2 success--text text--darken-1" v-if="!mikeChecked">
                      マイクに喋りかけてください
                    </p>
                    <p class="body-2 success--text text--darken-1" v-if="mikeChecked">
                      アイコンをクリックして録音を開始してください
                    </p>
                  </div>
                </div>
              </v-container>
            </v-card>
            <v-btn
              :disabled="!step2Ready"
              color="success"
              @click="stepNow = 3"
            >
              次へ
            </v-btn>
            <v-btn text @click="stepNow = 1">戻る</v-btn>
          </v-stepper-content>

          <v-stepper-content step="3">
            <v-card flat class="mb-12 d-flex align-center flex-column">
              <p class="body-2">録音した音声が聞こえることを確認してください</p>
              <audio :src="testVoice" @loadeddata="speakerChecked=true" controls></audio>
            </v-card>
            <v-btn
              :disabled="!step3Ready"
              color="success"
              @click="endDeviceCheck"
            >
              ビデオチャットを開始する
            </v-btn>

            <v-btn text @click="stepNow = 2">戻る</v-btn>
          </v-stepper-content>

        </v-stepper-items>

      </v-stepper>

    </v-dialog>

    <v-snackbar
      v-model="deviceErr"
      bottom
      color="error"
      :timeout="timeout"
    >
      <span>PC端末を使用してください</span>
    </v-snackbar>

    <v-snackbar
      v-model="browserErr"
      bottom
      color="error"
      :timeout="timeout"
    >
      <span>Google Chromeを使用してください</span>
    </v-snackbar>

    <v-snackbar
      v-model="hasMediaErr"
      bottom
      color="error"
      :timeout="timeout"
    >
      <span>{{getMediaErrMessage}}</span>
    </v-snackbar>

    <v-snackbar
      v-model="nowRecording"
      bottom
      color="error"
      :timeout="recording"
    >
      <div><v-icon color="white" size="14px" class="mr-2">fas fa-microphone</v-icon>録音中 残り{{count}}秒</div>
    </v-snackbar>

  </div>
</template>

<script>
export default {
  name: 'DeviceCheck',
  data: () => {
    return {
      userAgent: window.navigator.userAgent.toLowerCase(),
      checkDevice: true,
      tracks: undefined,
      firstFlg: true,
      audioCtx: undefined,
      audioSourceNode: undefined,
      analyserNode: undefined,
      filter1: undefined,
      filter2: undefined,
      filter3: undefined,
      stepNow: 1,
      mikeChecked: false,
      speakerChecked: false,
      testVoice: undefined,
      recorder: undefined,
      recordChecked: false,
      nowRecording: false,
      timeout: 0,
      recording: 3000,
      count: 3
    }
  },
  props: {
    stream: {
      required: true
    },
    mediaErr: {}
  },
  computed: {
    deviceErr () {
      // spチエック
      return (this.userAgent.indexOf('iphone') > -1 || this.userAgent.indexOf('android') > -1 || this.userAgent.indexOf('ipad') > -1 || (this.userAgent.indexOf('macintosh') > -1 && 'ontouchend' in document))
    },
    browserErr: function () {
      return !this.deviceErr && !(!(this.userAgent.indexOf('msie') !== -1 || this.userAgent.indexOf('trident') !== -1) && this.userAgent.indexOf('edge') === -1 && this.userAgent.indexOf('chrome') !== -1)
    },
    hasMediaErr: function () {
      return !this.deviceErr && !this.browserErr && this.mediaErr !== null
    },
    getMediaErrMessage: function () {
      if (this.mediaErr) {
        return this.mediaErr.name + ':' + this.mediaErr.message
      }
      return ''
    },
    step1Ready: function () {
      return !this.deviceErr && !this.browserErr && !this.hasMediaErr && this.stream && this.stream.getTracks().length > 0 && this.stream.getVideoTracks().length > 0
    },
    step2Ready: function () {
      return this.mikeChecked && this.recordChecked
    },
    step3Ready: function () {
      return this.speakerChecked
    }
  },
  methods: {
    play () {
      if (this.tracks) return
      // マイク、カメラ
      this.tracks = this.stream.getTracks()
      this.voiceProcessing(this.stream)
    },
    stop () {
      if (this.tracks) {
        this.tracks.forEach(function (track) {
          track.stop()
        })
        this.tracks = null
      }
    },
    voiceProcessing (stream) {
      // AudioContextの生成
      if (this.firstFlg) {
        // AudioContextの生成
        this.audioCtx = new AudioContext()
        this.firstFlg = false
      }
      // MediaElementAudioSourceNodeの生成
      if (this.audioSourceNode) this.audioSourceNode.disconnect()
      this.audioSourceNode = this.audioCtx.createMediaStreamSource(stream)
      // AnalyserNodeの生成
      // ※音声の時間と周波数を解析する
      if (this.analyserNode) this.analyserNode.disconnect()
      this.analyserNode = this.audioCtx.createAnalyser()
      // FFT(高速フーリエ変換)の周波数領域
      this.analyserNode.fftSize = 32

      // *** ハウリング対策 ***

      if (this.filter1) {
        this.filter1.disconnect()
      }
      if (this.filter2) {
        this.filter2.disconnect()
      }
      if (this.filter3) {
        this.filter3.disconnect()
      }

      // ハイシェルフフィルタ
      // 8192Hz以下を通して、それ以外は減衰
      this.filter1 = this.audioCtx.createBiquadFilter()
      this.filter1.type = 'highshelf'
      this.filter1.frequency.value = 8192 // 周波数
      this.filter1.gain.value = -40 // ゲイン(強さ)

      // ピーキングフィルタ
      // 0-500Hzを減衰
      this.filter2 = this.audioCtx.createBiquadFilter()
      this.filter2.type = 'peaking'
      this.filter2.frequency.value = 250 // 周波数
      this.filter2.gain.value = -40 // ゲイン(強さ)

      // バンドパスフィルタ
      // 0-500Hzを通す。それ以外は減衰
      this.filter3 = this.audioCtx.createBiquadFilter()
      this.filter3.type = 'bandpass'
      this.filter3.frequency.value = 250 // 周波数(中央値)

      // フィルタの設定
      this.audioSourceNode.connect(this.filter1)
      this.filter1.connect(this.filter2)
      this.filter2.connect(this.filter3)
      this.filter3.connect(this.analyserNode)
      // this.analyserNode.connect(this.audioCtx.destination)

      this.draw()
    },
    draw () {
      const canvas = this.$refs.mikeInput
      const canvasCtx = canvas.getContext('2d')
      canvasCtx.clearRect(0, canvas.height / 2, canvas.width, canvas.height)
      // fftSizeの1/2
      const bufferLength = this.analyserNode.frequencyBinCount
      const dataArray = new Float32Array(bufferLength)

      // 次の再描画の前にアニメーションを更新
      requestAnimationFrame(this.draw)

      // 周波数データをFloat32Array配列にコピーする
      this.analyserNode.getFloatFrequencyData(dataArray)
      if (dataArray[12] > -150) this.mikeChecked = true

      // 背景の描画
      // canvasCtx.fillStyle = 'rgb(255, 255, 255)'
      // canvasCtx.fillRect(0, 0, canvas.width, canvas.height)
      // canvasCtx.strokeRect(0, 0, canvas.width, canvas.height)

      // スペクトルの描画
      const barWidth = (canvas.width / bufferLength) - 1
      let posX = 2
      for (let i = 0; i < bufferLength; i++) {
        const barHeight = 25
        const barDense = (dataArray[i] + 140) * 2
        canvasCtx.fillStyle = `rgb(${Math.floor(255 - barDense)}, ${Math.floor(255 - barDense / 4)}, ${Math.floor(255 - barDense)})`
        canvasCtx.fillRect(posX, (canvas.height - barHeight) / 2, barWidth - 5, 25)
        posX += barWidth + 1
      }
    },
    startVoiceRecording () {
      const self = this
      this.recorder = new MediaRecorder(this.stream, {
        mimeType: 'audio/webm'
      })
      this.recorder.ondataavailable = function (e) {
        self.testVoice = window.URL.createObjectURL(e.data)
        self.recordChecked = true
      }
      this.recorder.start()
      this.nowRecording = true
      this.countDown()
      setTimeout(function () {
        self.stopVoiceRecording()
      }, 3000)
    },
    stopVoiceRecording () {
      if (this.recorder.state === 'inactive') return
      this.recorder.stop()
      this.nowRecording = false
    },
    onloadeddata (ev) {
      ev.target.muted = true
      ev.target.play()
    },
    endDeviceCheck () {
      this.checkDevice = false
      this.audioSourceNode.disconnect()
      this.$emit('close')
    },
    countDown () {
      this.count = 3
      const id = setInterval(() => {
        if (this.count === 0) clearInterval(id)
        this.count--
      }, 1000)
    }
  }
}
</script>

<style scoped>
  .volume {
    border: 1px solid #bdbdbd;
    border-radius: 4px;
    padding: 4px 12px;
  }
</style>
