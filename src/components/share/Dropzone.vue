<template>
  <form class="dropzone dz-card">
    <!-- Not displayed, just for Dropzone's `dictDefaultMessage` option -->
    <div id="dropzone-message" style="display: none">
      <span class="dropzone-title">
        <v-icon>fas fa-image</v-icon>
      </span>
      <span class="dropzone-info">
        アップロード
      </span>
    </div>
  </form>
</template>

<script>
import Dropzone from 'dropzone'
import 'dropzone/dist/dropzone.css'

Dropzone.autoDiscover = false

export default {
  name: 'dropzone',
  props: ['type', 'category'],
  data () {
    return {
      isUpload: false,
      isComplete: false,
      isError: false
    }
  },
  computed: {
    user () {
      return this.$store.getters.user
    }
  },
  methods: {
    removeAllFiles () {
      this.dropzone.removeAllFiles()
      this.isUpload = false
      this.isComplete = false
      this.isError = false
    }
  },
  mounted () {
    const vm = this

    const options = {
      // The URL will be changed for each new file being processing
      url: '/',

      // Since we're going to do a `PUT` upload to S3 directly
      method: 'put',

      // Hijack the xhr.send since Dropzone always upload file by using formData
      // ref: https://github.com/danialfarid/ng-file-upload/issues/743
      sending (file, xhr) {
        const _send = xhr.send
        xhr.send = () => {
          _send.call(xhr, file)
        }
      },

      maxFiles: 1,
      dictMaxFilesExceeded: 'アップロードは1ファイルまでです',
      acceptedFiles: 'image/*',
      dictInvalidFileType: 'アップロードは画像ファイルのみです',
      maxFilesize: 5.0,
      dictFileTooBig: 'アップロードは5MBまでです。',

      // Content-Type should be included, otherwise you'll get a signature
      // mismatch error from S3. We're going to update this for each file.
      header: '',

      // Customize the wording
      dictDefaultMessage: document.querySelector('#dropzone-message').innerHTML,

      // We're going to process each file manually (see `accept` below)
      autoProcessQueue: false,

      // Here we request a signed upload URL when a file being accepted
      accept (file, done) {
        vm.isUpload = true
        // vm.$emit('data', {
        //   isUpload: vm.isUpload
        // })
        const additionalParams = {
          queryParams: {
            type: vm.type
          }
        }
        vm.$apig.getSignedURL(file, additionalParams)
          .then((res) => {
            file.uploadURL = res.data.url
            file.uuid = res.data.uuid
            done()

            setTimeout(() => {
              vm.dropzone.processFile(file)
            })
          })
          .catch((err) => {
            console.log(err)
            vm.isError = true
            vm.$emit('data', {
              isError: vm.isError
            })
            done('アップロードに失敗しました', err)
          })
      }
    }

    // Instantiate Dropzone
    this.dropzone = new Dropzone(this.$el, options)

    // Set signed upload URL for each file
    vm.dropzone.on('processing', (file) => {
      vm.dropzone.options.url = file.uploadURL
    })

    vm.dropzone.on('complete', (file) => {
      vm.isComplete = true
      vm.$emit('data', {
        isComplete: vm.isComplete,
        name: file.name,
        fileId: file.uuid,
        key: vm.category
      })
      setTimeout(() => {
        vm.removeAllFiles()
      }, 1000)
    })
  }
}
</script>

<style scoped>
.dz-card {
  padding: 0;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
  position: relative;
}

.dropzone {
  transition: all 0.2s linear;
  border: 2px dashed #ccc;
  background-color: #fafafa;
  min-height: initial;
  cursor: pointer;
  text-align: center;
  height: 120px;
  width: 120px;
}

.dropzone:hover {
  border-color: #3498db;
}

.dropzone:hover .dz-message .dropzone-title {
  color: #3498db;
}

.dropzone .dz-message {
  color: #666;
  height: 400px;
  display: -webkit-flex;
  display: flex;
  -webkit-align-items: center;
  align-items: center;
  -webkit-justify-content: center;
  justify-content: center;
}

.dropzone .dz-message span {
  font-size: 13px;
  letter-spacing: 0.4px;
}

.dropzone .dz-message .dropzone-title {
  display: block;
  color: #888;
}

.dropzone .dz-message .dropzone-info {
  display: block;
  color: #a8a8a8;
}

.close {
  position: absolute;
  right: 0px;
  top: 0px;
  z-index: 1001;
}

</style>
