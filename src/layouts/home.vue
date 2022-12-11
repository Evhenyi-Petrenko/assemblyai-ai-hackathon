<!-- <script lang="ts" setup>
import { ref, onMounted } from 'vue'
import authApi from '../service/api/auth/'
import axios from 'axios'

// @ts-ignore
let token = ref('')

onMounted(() => {
  authApi
    .LOGIN({
      email: 'assemblytest@dd.cc',
      password: 'QQwerty12345!',
    })
    .then((response) => {
      // @ts-ignore
      token = response.response_token.access_token

      axios.defaults.headers.common[
        'Authorization'
        // @ts-ignore
      ] = `Bearer ${token}`
    })
    .then(() => {})
})
</script> -->
<script>
import axios from 'axios'
import { base } from '~/service/config'
axios.defaults.baseURL = `${base}/api`

export default {
  data() {
    return {
      token: '',
      spaces: {},
      audio: '',
      uploadData: {
        audio: '',
        nameAudio: '',
      },
    }
  },

  beforeMount() {
    axios
      .post('/login', {
        email: 'assemblytest@dd.cc',
        password: 'QQwerty12345!',
      })
      .then((response) => {
        this.token = response.data.response_token.access_token
        axios.defaults.headers.common[
          'Authorization'
          // @ts-ignore
        ] = `Bearer ${this.token}`
      })
      .then(() => {
        this.getListAudio()
      })
  },
  methods: {
    getListAudio() {
      axios.get('/audio?workspace_id=OBKdv8qb&per_page=100').then((response) => {
        this.spaces = response.data
      })
    },
    onChange($e) {
      this.uploadData.nameAudio = this.$refs.file.files[0].name
      this.uploadData.audio = this.$refs.file.files[0]
      this.drawBoxSetFile($e)
    },

    onDrag($e) {
      this.uploadData.nameAudio = $e.dataTransfer.files[0].name
      this.uploadData.audio = $e.dataTransfer.files[0]
      this.$refs.file.files = $e.dataTransfer.files
      this.drawBoxSetFile($e)
    },

    drawBoxSetFile($e) {
      $e.currentTarget.classList.add('is-file')
      $e.currentTarget.classList.remove('no-file')
    },

    dragover($e) {
      if (!$e.currentTarget.classList.contains('is-file')) {
        $e.currentTarget.classList.add('is-file')
        $e.currentTarget.classList.remove('no-file')
      }
    },

    dragleave($e) {
      $e.currentTarget.classList.remove('is-file')
      $e.currentTarget.classList.remove('no-file')
    },
    submit(e) {
      // if (this.uploadData.audio?.size > 104857600) {
      //   this.$toast.error('Max upload size is 100MB')
      //   return
      // }

      if (this.uploadData.audio) {
        this.$refs.stateBox.classList.remove('is-file')
        this.$refs.stateBox.classList.add('loader-upload-file')
        this.uploadData.with_speakers = this.with_speakers === true ? 1 : 0

        let formData = new FormData()
        formData.append('title', this.uploadData.nameAudio)
        formData.append('audio', this.uploadData.audio)
        formData.append('lang', 'en')
        formData.append('with_speakers', 1)
        formData.append('workspace_id', 'OBKdv8qb')
        axios
          .post('/audio/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          })
          .then(() => {
            this.uploadData.audio = ''
            this.uploadData.nameAudio = ''
            this.getListAudio()
          })
          .catch(() => {
            toast.error('Error try refresh page')
          })
      }
    },
  },
}
</script>
<template>
  <main class="container">
    <h1 class="text-xl mt-6">Try to upload audio</h1>
    <div class="form-input form-input-for-chrome py-4 px-0">
      <input class="name" type="text" v-model="uploadData.nameAudio" />
      <label>Audio Name</label>
    </div>

    <div class="upload-form">
      <label
        for="uploadFile"
        class="upload-file-box"
        @drop.prevent="onDrag"
        @dragenter.prevent
        @dragleave.prevent="dragleave"
        @dragover.prevent="dragover"
      >
        <div
          ref="stateBox"
          class="state-box"
          :class="[uploadData.audio ? 'is-file' : 'no-file']"
        ></div>
        <input
          id="uploadFile"
          ref="file"
          type="file"
          name="file"
          accept=".x-wav,.mp3,.ogg,.mp4,audio/*"
          @change="onChange"
        />

        <div class="text-drop-1">
          <button class="btn btn-dark">Choose a file</button>
          or drag & drop here…
        </div>

        <div class="name-file">
          {{ uploadData.nameAudio }}
        </div>

        <div class="text-drop-2">Works with .mp3, .ogg & .mp4. Max size 100MB!</div>
      </label>

      <button
        class="btn btn-dark"
        type="submit"
        :disabled="audioNotYetUpload"
        @keyup.enter="submit"
        @click="submit"
      >
        Continue
      </button>
    </div>

    <div class="audio__wrap"></div>
    <router-view />
  </main>
</template>

<style scoped>
h1 {
  font-size: 40px;
  text-align: center;
  margin-bottom: 24px;
}
@keyframes blickUploadFile {
  0% {
    box-shadow: inset 0 0 12px #00f000 80;
  }
  50% {
    box-shadow: inset 0 0 12px transparent;
  }
  100% {
    box-shadow: inset 0 0 12px #00f000 80;
  }
}
.upload-page {
  position: relative;
  padding: 24px;
  display: flex;
  justify-content: center;
  align-items: center;
  flex-direction: column;
  height: auto;
  min-height: calc(100vh - 160px);
  overflow: inherit;
}
.upload-page_button-back {
  position: absolute;
  top: 20px;
  left: 24px;
  margin-top: 0;
}
.upload-page h2 {
  margin-bottom: 24px;
  color: #212121;
  font-family: 'Montserrat', sans-serif;
  font-size: 20px;
  font-weight: 400;
  text-align: center;
}
.upload-form {
  margin: 0 auto;
  max-width: 500px;
  width: 100%;
}
.upload-form .btn {
  margin-top: 36px;
  margin-bottom: 16px;
  padding: 4px 12px;
  min-height: 48px;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  border: 1px solid transparent;
  outline: none;
  box-shadow: none;
  border-radius: 8px;
  font-size: 14px;
  font-weight: 400;
  transition: 0.3s;
  cursor: pointer;
}
.upload-form .btn:focus-visible {
  box-shadow: 0 2px 6px #333;
}
.upload-form .btn-dark {
  margin-bottom: 0;
  display: flex;
  width: 100%;
  background-color: #000;
  color: #fff;
}
.upload-form .btn-dark:hover {
  background-color: transparent;
  border-color: #000;
  color: #000;
}
.upload-file-box {
  position: relative;
  margin-bottom: 0;
  padding: 24px;
  height: 245px;
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  background-color: #fafafa;
  border: 2px dashed #eaeaea;
  border-radius: 8px;
  cursor: pointer;
}
.upload-file-box .state-box {
  position: absolute;
  top: 0;
  right: 0;
  bottom: 0;
  left: 0;
}
.upload-file-box .state-box.is-file {
  box-shadow: inset 0 0 12px #00f000 80;
}
.upload-file-box .state-box.no-file {
  box-shadow: none;
}
.upload-file-box .state-box.loader-upload-file {
  animation: blickUploadFile 1s infinite;
}
.upload-file-box input {
  position: absolute;
  top: 0;
  left: 0;
  opacity: 0;
}
.upload-file-box .btn {
  margin: 0 16px 0 0;
  width: 135px;
  min-height: 35px;
  pointer-events: none;
}
.upload-file-box:hover .btn {
  background-color: transparent;
  border-color: #000;
  color: #000;
}
.upload-file-box .text-drop-1 {
  display: flex;
  justify-content: center;
  align-items: center;
  white-space: nowrap;
}
@media screen and (max-width: 420px) {
  .upload-file-box .text-drop-1 {
    flex-direction: column;
  }
  .upload-file-box .text-drop-1 button {
    margin-bottom: 20px;
  }
}
.upload-file-box .text-drop-2 {
  max-width: 240px;
  margin: 55px auto 0;
  color: #212121;
  font-size: 16px;
  font-weight: 400;
  line-height: 1.5;
  text-align: center;
}
.upload-file-box .name-file {
  position: absolute;
  top: 100px;
  left: 50%;
  transform: translateX(-50%);
  margin-top: 10px;
  color: green;
  font-size: 14px;
}
@keyframes shake {
  0% {
    margin-left: 0rem;
  }
  25% {
    margin-left: 0.5rem;
  }
  75% {
    margin-left: -0.5rem;
  }
  100% {
    margin-left: 0rem;
  }
}
.error {
  margin-bottom: 16px;
  color: red;
  animation: shake 0.2s ease-in-out 0s 2;
}
.form-input {
  position: relative;
  margin-bottom: 16px;
  width: 100%;
  font-size: 14px;
}
.form-input label {
  position: absolute;
  top: -8px;
  left: 8px;
  margin: 0;
  padding: 0 8px;
  width: auto;
  color: #000;
  font-weight: 500;
  line-height: 1;
  transition: top 0.2s linear, background 0.2s linear 0.1s, width 0.2s linear 0.1s;
  pointer-events: none;
}
.form-input input {
  padding: 12px 16px;
  height: 48px;
  width: 100%;
  background: #fff;
  border: solid 1px #c4c4c4;
  border-radius: 8px;
  color: #000;
  outline: none;
}
.form-input input:-webkit-autofill {
  -webkit-box-shadow: 0 0 0 30px white inset !important;
}
.form-input.form-select {
  position: relative;
}
.form-input.form-select select {
  padding: 12px 14px;
  height: 48px;
  width: 100%;
  background: #fff;
  border: solid 1px #c4c4c4;
  border-radius: 8px;
  color: #000;
  outline: none;
  cursor: pointer;
}
.form-input.form-select select + label {
  top: -8px;
  padding: 0 8px;
  width: auto;
  background: linear-gradient(to top, #fff 0, #fff 6px, transparent 6px, transparent);
}
.form-input.form-select::after {
  content: url(./../assets/arrow-select.svg);
  position: absolute;
  top: 2px;
  right: 2px;
  bottom: 2px;
  width: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #fff;
  border-radius: 8px;
  pointer-events: none;
}
.form-input.form-input-for-chrome label {
  top: 16px;
  padding: 0 8px 4px 8px;
  width: calc(100% - 20px);
}
.form-input.form-input-for-chrome input:focus-visible + label,
.form-input.form-input-for-chrome input:focus + label,
.form-input.form-input-for-chrome input:not(:placeholder-shown):not(:focus) + label {
  top: -8px;
  padding: 0 8px;
  width: auto;
}
.form-input {
  border: none;
  margin: 0 auto;
  max-width: 500px;
  width: 100%;
  background-color: inherit;
}
</style>
