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
import * as THREE from 'three'
import { base } from '~/service/config'
import { OrbitControls } from '../jsm/controls/OrbitControls.js'

import { GLTFLoader } from '../jsm/loaders/GLTFLoader.js'
import { KTX2Loader } from '../jsm/loaders/KTX2Loader.js'
import { MeshoptDecoder } from '../jsm/libs/meshopt_decoder.module.js'

import { RoomEnvironment } from '../jsm/environments/RoomEnvironment.js'
import facecap from '../models/gltf/facecap.glb?url'
import { GUI } from '../jsm/libs/lil-gui.module.min.js'
axios.defaults.baseURL = `${base}/api`

export default {
  data() {
    return {
      token: '',
      spaces: {},
      audios: [],
      uploadData: {
        audio: '',
        nameAudio: '',
      },
      selectAudio: null,
      audioFromHash: null,
      timeStamp: null,
      audioNotYetUpload: null,
      playerTime: null,
      mixer: null,
      gltf: null,
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
  mounted() {
    this.initTree()
  },
  watch: {
    playerTime() {
      this.$refs.plyr.player.currentTime = this.playerTime / 1000
    },
  },
  computed: {
    parseRaw() {
      return JSON.parse(this.audioFromHash.raw)
    },
    paragraphs() {
      let paragraphs = []
      let size = 0

      this.parseRaw.forEach((element) => {
        if (element.text === null) {
          element.text = ' '
        }

        if (paragraphs[size]) {
          paragraphs[size].push(element)
        } else {
          paragraphs[size] = [element]
        }

        if (element.text.endsWith('.')) {
          size++
        }
      })

      return paragraphs
    },
  },

  methods: {
    getTimeStartSentences(startSentenceMS) {
      const timeM = Math.floor(startSentenceMS / 60000)
      const timeS = ((startSentenceMS % 60000) / 1000).toFixed(0)

      const mm = +timeM < 10 ? `0${timeM}` : timeM
      const ss = +timeS < 10 ? `0${timeS}` : timeS

      return `${mm}:${ss}`
    },
    getListAudio() {
      axios.get('/audio?workspace_id=OBKdv8qb&per_page=100').then((response) => {
        this.audios = response.data.data
      })
    },
    watchTime() {
      setTimeout(
        this.$refs.plyr.player.on(
          'timeupdate',
          () => (this.timeStamp = this.$refs.plyr.player.currentTime)
        ),
        1000
      )
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
    getTimeStartSentence(startSentenceMS) {
      const timeM = Math.round(startSentenceMS / 60)
      const timeS = startSentenceMS % 60 !== 0 ? (startSentenceMS % 60).toFixed() : 0

      const mm = +timeM < 10 ? `0${timeM}` : timeM
      const ss = +timeS < 10 ? `0${timeS}` : timeS

      return `${mm}:${ss}`
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
    GoToAudio(hash) {
      axios.get('/audio/' + hash).then((response) => {
        this.audioFromHash = response.data
      })
      this.mixer.clipAction(gltf.animations[0]).stop()
    },
    updTime(time) {
      this.playerTime = time
      this.timeStamp = time / 1000
    },
    initTree() {
      const clock = new THREE.Clock()

      const container = document.getElementById('head')

      const camera = new THREE.PerspectiveCamera(45, 1, 1, 20)
      camera.position.set(0, 0, 6)

      const scene = new THREE.Scene()

      const renderer = new THREE.WebGLRenderer()
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.setSize(1000, 600)

      renderer.toneMapping = THREE.ACESFilmicToneMapping
      renderer.outputEncoding = THREE.sRGBEncoding

      container.appendChild(renderer.domElement)

      const ktx2Loader = new KTX2Loader()
        .setTranscoderPath('js/libs/basis/')
        .detectSupport(renderer)

      new GLTFLoader()
        .setKTX2Loader(ktx2Loader)
        .setMeshoptDecoder(MeshoptDecoder)
        .load(facecap, (gltf) => {
          const mesh = gltf.scene.children[0]

          scene.add(mesh)
          this.gltf = gltf.scene.children[0]
          this.mixer = new THREE.AnimationMixer(mesh)
          this.mixer.clipAction(gltf.animations[0]).play()

          const gltfAninations = gltf.animations
          const animationsMap = new Map()

          GUI
          const head = mesh.getObjectByName('mesh_2')
          const influences = head.morphTargetInfluences

          const gui = new GUI()
          gui.close()

          for (const [key, value] of Object.entries(head.morphTargetDictionary)) {
            gui
              .add(influences, value, 0, 1, 0.01)
              .name(key.replace('blendShape1.', ''))
              .listen(influences)
          }
          head.morphTargetInfluences[36] = 0
          head.morphTargetInfluences[33] = 0
          function closeMounse() {
            head.morphTargetInfluences[36] = 0.2
            head.morphTargetInfluences[33] = 0.1
          }

          function openMounse() {
            head.morphTargetInfluences[36] = 0
            head.morphTargetInfluences[33] = 0
          }
        })

      const environment = new RoomEnvironment()
      const pmremGenerator = new THREE.PMREMGenerator(renderer)

      scene.background = new THREE.Color(0xf2f2f2)
      scene.environment = pmremGenerator.fromScene(environment).texture

      const controls = new OrbitControls(camera, renderer.domElement)

      controls.enableDamping = true
      controls.minDistance = 2.5
      controls.maxDistance = 5
      controls.minAzimuthAngle = -Math.PI / 2
      controls.maxAzimuthAngle = Math.PI / 2
      controls.maxPolarAngle = Math.PI / 1.8
      controls.target.set(0, 0.15, -0.2)

      renderer.setAnimationLoop(() => {
        const delta = clock.getDelta()

        if (this.mixer) {
          this.mixer.update(delta)
        }

        renderer.render(scene, camera)

        controls.update()
      })

      // window.addEventListener('resize', () => {
      //   camera.aspect = window.innerWidth / window.innerHeight
      //   camera.updateProjectionMatrix()

      //   renderer.setSize(window.innerWidth, window.innerHeight)
      // })
    },
  },
}
</script>
<template>
  <main class="container">
    <h1 class="text-xl mt-6">Upload your audio or choose from the list</h1>
    <div id="head"></div>
    <div v-if="!audioFromHash">
      <div class="form-input form-input-for-chrome py-4 px-0">
        <input class="name" type="text" v-model="uploadData.nameAudio" />
        <label>Audio Name </label>
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
    </div>
    <div v-else>
      <div @click="audioFromHash = null" class="button_back">Back to Upload</div>
      <div class="translated px-3">
        <div class="d-flex">
          <div>
            <div
              v-for="(paragraph, id) in paragraphs"
              :key="id"
              ref="translated__paragraph"
              class="translated__paragraph"
            >
              <p class="translated__time new">
                {{ getTimeStartSentences(paragraph[0].start) }}
              </p>

              <div ref="translated__wraps" class="translated__wraps">
                <div v-for="(item, i) in paragraph" :key="i" class="translated__wrap">
                  <div
                    class="translated__text"
                    :class="[
                      item.start / 1000 <= timeStamp && item.end / 1000 >= timeStamp
                        ? 'translated__backlight'
                        : null,
                    ]"
                    @click="updTime(item.start)"
                  >
                    {{ item.text }}
                  </div>
                </div>

                <div v-if="paragraph[0].speaker" class="translated__speaker">
                  [{{ paragraph[0].speaker }}]
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <vue-plyr class="player" ref="plyr">
        <audio debug controls crossorigin playsinline @playing="watchTime()">
          <source :src="audioFromHash.mp3_path" type="audio/mp3" />
        </audio>
      </vue-plyr>
    </div>

    <div class="audio__wrap mt-4">
      <div
        v-for="(item, i) in audios"
        :key="item.hash"
        class="audio__block"
        :class="`audio__block-${item.status}`"
        @click="item.status === 'in_progress' ? '' : GoToAudio(item.hash)"
      >
        <div class="audio__content">
          <div class="audio__content_count">{{ i + 1 }}</div>
          <div class="audio__content_title">{{ item.hash }}</div>
          <div class="audio__content_part-header-title mob-version">
            {{ item.title }}
          </div>
          <div class="audio__content_part-translation">
            <div class="audio__content_part-header-title desc-version">
              {{ item.title }}
            </div>
            <div class="audio__content_part-dsc">
              <template v-if="item.status === 'in_progress'">
                <div class="progress-blick">In progress...</div>
              </template>
              <template v-else-if="item.error !== null">
                <div class="progress-blick">{{ item.error }}</div>
              </template>
              <template v-else>
                {{ item.transcription }}
              </template>
            </div>
          </div>
          <div class="audio__content_info">
            <div v-if="item.category != null" class="audio__content_category">
              {{ item.category.name }}
            </div>
            <div v-else class="audio__content_category">Empty</div>
            <div class="audio__content_plays-and-time">
              <div class="audio__content_time">
                {{ getTimeStartSentence(item.duration) }}
              </div>
              <span>•</span>
              <div class="audio__content_plays">{{ item.plays }} plays</div>
            </div>
          </div>
          <div class="audio__content_controll-panel">
            <div class="audio__content_controll-panel-popup popup"></div>
          </div>
        </div>
      </div>
    </div>
    <router-view />
  </main>
</template>

<style>
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
.audio__wrap {
  margin-bottom: 24px;
  background: #fff;
  box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.0698208);
  border-radius: 8px;
  overflow: hidden;
}
@media screen and (max-width: 576px) {
  .audio__wrap {
    background: transparent;
    box-shadow: none;
    border-radius: none;
  }
}
.audio__block {
  padding: 26px 30px 0 20px;
  border-left: 3px solid transparent;
  color: #52647c;
  cursor: pointer;
}
@media screen and (max-width: 576px) {
  .audio__block {
    padding: 18px 18px 0;
    border-left: none;
    margin-bottom: 20px;
    background: #fff;
    box-shadow: 0px 2px 5px rgba(0, 0, 0, 0.0698208);
    border-radius: 8px;
  }
}
.audio__block:hover {
  background-color: rgba(0, 0, 0, 0.0698208);
}
.audio__block .audio__content {
  padding: 0 0 22px 0;
  width: 100%;
  height: auto;
  border-bottom: 1px solid #eaeaea;
  display: flex;
  align-items: center;
  position: relative;
}
@media screen and (max-width: 576px) {
  .audio__block .audio__content {
    padding: 0 0 18px 0;
    flex-direction: column;
    align-items: flex-start;
    border-bottom: none;
  }
}
.audio__block .audio__content-transcribed > *,
.audio__block .audio__content-in_progress > *,
.audio__block .audio__content-error > * {
  padding: 8px;
}
.audio__block .audio__content_count {
  width: 40px;
  font-size: 14px;
  font-weight: normal;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.71;
  letter-spacing: normal;
  color: #52647c;
}
@media screen and (max-width: 576px) {
  .audio__block .audio__content_count {
    display: none;
  }
}
.audio__block .audio__content_title {
  width: 122px;
  white-space: nowrap;
  text-overflow: ellipsis;
  overflow: hidden;
  font-size: 14px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.71;
  letter-spacing: normal;
  color: #52647c;
}
@media screen and (max-width: 768px) {
  .audio__block .audio__content_title {
    display: none;
  }
}
.audio__block .audio__content_category {
  font-size: 14px;
  line-height: 1.5;
  color: #807e7e;
  display: none;
}
@media screen and (max-width: 576px) {
  .audio__block .audio__content_category {
    display: block;
  }
}
.audio__block .audio__content_part-translation {
  height: 100%;
  flex: 1;
  color: #212121;
  font-weight: 600;
  position: relative;
}
@media screen and (max-width: 992px) {
  .audio__block .audio__content_part-translation {
    margin-right: 20px;
  }
}
@media screen and (max-width: 768px) {
  .audio__block .audio__content_part-translation {
    margin-right: 15px;
    margin-left: 10px;
  }
}
@media screen and (max-width: 576px) {
  .audio__block .audio__content_part-translation {
    order: 6;
    margin-right: 0;
    margin-left: 0;
  }
}
.audio__block .audio__content_part-header-title {
  font-size: 14px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.71;
  letter-spacing: normal;
  color: #212121;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  max-width: 520px;
}
@media screen and (max-width: 1200px) {
  .audio__block .audio__content_part-header-title {
    max-width: 300px;
  }
}
@media screen and (max-width: 992px) {
  .audio__block .audio__content_part-header-title {
    max-width: 200px;
  }
}
@media screen and (max-width: 768px) {
  .audio__block .audio__content_part-header-title {
    max-width: 150px;
  }
}
@media screen and (max-width: 576px) {
  .audio__block .audio__content_part-header-title {
    display: none;
  }
}
.audio__block .audio__content_part-header-title.mob-version {
  font-size: 16px;
  line-height: 1.75;
  font-weight: 600;
  max-width: 50%;
  display: none;
}
@media screen and (max-width: 576px) {
  .audio__block .audio__content_part-header-title.mob-version {
    display: block;
  }
}
.audio__block .audio__content_part-dsc {
  font-size: 12px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.75;
  letter-spacing: normal;
  color: #807e7e;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
  display: block;
  max-width: 520px;
}
@media screen and (max-width: 1200px) {
  .audio__block .audio__content_part-dsc {
    max-width: 300px;
  }
}
@media screen and (max-width: 992px) {
  .audio__block .audio__content_part-dsc {
    max-width: 200px;
  }
}
@media screen and (max-width: 768px) {
  .audio__block .audio__content_part-dsc {
    max-width: 150px;
  }
}
@media screen and (max-width: 576px) {
  .audio__block .audio__content_part-dsc {
    font-size: 14px;
    line-height: 1.71;
    color: #52647c;
    max-width: 100%;
    width: 100%;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    white-space: inherit;
  }
}
.audio__block .audio__content_part-dots-end {
  width: 20px;
  height: 100%;
  position: absolute;
  top: 0;
  right: -20px;
  display: flex;
  align-items: flex-end;
}
@media screen and (max-width: 576px) {
  .audio__block .audio__content_part-dots-end {
    display: none;
  }
}
.audio__block .audio__content_info {
  width: 100px;
  flex: 1;
  margin-right: 30px;
}
@media screen and (max-width: 768px) {
  .audio__block .audio__content_info {
    margin-right: 10px;
    min-width: 45px;
  }
}
@media screen and (max-width: 576px) {
  .audio__block .audio__content_info {
    display: flex;
    align-items: center;
    justify-content: space-between;
    width: 100%;
    margin-right: 0;
    margin-bottom: 10px;
  }
}
@media screen and (max-width: 576px) {
  .audio__block .audio__content_plays-and-time {
    display: flex;
    align-items: center;
  }
}
.audio__block .audio__content_plays-and-time span {
  display: none;
}
@media screen and (max-width: 576px) {
  .audio__block .audio__content_plays-and-time span {
    display: block;
    margin: 0 6px;
    color: #807e7e;
    font-size: 14px;
  }
}
.audio__block .audio__content_time {
  color: #212121;
  font-size: 14px;
  font-weight: 600;
  line-height: 1.71;
  text-align: right;
}
@media screen and (max-width: 576px) {
  .audio__block .audio__content_time {
    color: #807e7e;
    font-weight: 500;
  }
}
.audio__block .audio__content_plays {
  color: #807e7e;
  font-size: 12px;
  font-weight: 600;
  text-align: right;
}
@media screen and (max-width: 576px) {
  .audio__block .audio__content_plays {
    font-size: 14px;
    font-weight: 500;
  }
}
.audio__block .audio__content_controll-panel {
  color: #212121;
  font-size: 14px;
  line-height: 0;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
}
@media screen and (max-width: 576px) {
  .audio__block .audio__content_controll-panel {
    position: absolute;
    top: -12px;
    right: 0;
  }
}
.audio__block .audio__content_controll-panel .dot {
  width: 24px;
  height: 24px;
  border-radius: 6px;
  transition: all 0.2s linear;
  display: flex;
  justify-content: center;
  align-items: center;
}
.audio__block .audio__content_controll-panel .dot img {
  width: 100%;
}
.audio__block .audio__content_controll-panel .dot:hover {
  background-color: #fff;
  opacity: 0.7;
}
.audio__block .audio__content-in_progress {
  border-left: 3px solid rgba(25, 134, 255, 0.6);
}
.audio__block .audio__content-error {
  border-left: 3px solid rgba(255, 0, 0, 0.6);
}
.audio__block .audio__content__item {
  white-space: nowrap;
  overflow: hidden;
  border: dashed 2px inherit;
  padding: 5px;
  text-overflow: ellipsis;
}
.audio__block .audio__content_progress-dots {
  padding: 0;
  margin: 0;
  height: 100%;
  display: flex;
  align-items: flex-end;
}
.audio__block .audio__content .popup {
  display: flex;
  flex-direction: column;
  background-color: #fff;
  box-shadow: 0px 2px 5px #000;
  border-radius: 8px;
  width: 84px;
  height: 32px;
  position: absolute;
  top: 36px;
  right: 0;
  transition: all 0.5s;
  display: none;
}
@media screen and (max-width: 576px) {
  .audio__block .audio__content .popup {
    top: 25px;
  }
}
.audio__block .audio__content .popup__item {
  padding: 8px 20px 8px 8px;
  width: 100%;
  height: 100%;
  border-radius: 8px;
  display: flex;
  align-items: center;
  color: #807e7e;
  font-size: 12px;
  font-weight: 600;
  border: 1px solid transparent;
}
.audio__block .audio__content .popup__item:hover {
  background-color: #e75b12;
  border-color: #e75b12;
  color: #fff;
}
.audio__block .audio__content .popup__item:hover svg {
  fill: #fff;
}
.audio__block .audio__content .popup__item-icon {
  display: flex;
  margin-right: 6px;
}
.audio__block .audio__content .popup__item-icon svg {
  fill: #807e7e;
  width: 10px;
}
.audio__block .audio__content .popup.show {
  display: flex;
}
.translated {
  max-height: 80vh;
  overflow: scroll;
  background-color: #fff;
}
.translated__wrap {
  display: flex;
}
.translated__time {
  color: #807e7e;
  font-size: 16px;
}
.translated__time.new {
  margin: 0;
  margin-right: 1rem;
  padding: 0;
  line-height: 2.2;
}
.translated__text {
  border: solid 1px rgba(0, 0, 0, 0.0001);
  color: #212121;
  font-size: 16px;
  font-weight: 400;
  padding: 0 2px;
  cursor: pointer;
}
.translated__time {
  color: #807e7e;
  font-size: 16px;
  margin-bottom: 10px;
}
.translated__time.new {
  margin: 0;
  margin-right: 1rem;
  padding: 0;
}
.translated__text {
  color: #212121;
  font-size: 16px;
  font-weight: 400;
  padding: 0 2px;
  cursor: pointer;
}
.translated__paragraph {
  display: flex;
}
.translated__paragraph:last-child {
  margin-bottom: 0;
}
.translated__wraps {
  display: flex;
  flex-wrap: wrap;
  line-height: 2.2;
}
@media screen and (max-width: 576px) {
  .translated__wraps {
    line-height: 2;
  }
}
.translated__backlight {
  border-radius: 7px;
  background-color: #ffe7aa;
}
.translated__edit {
  border-radius: 7px;
  border: solid 1px #e7e8e9;
  background-color: rgba(216, 216, 216, 0.2);
}
.translated__toolbar {
  position: absolute;
  left: 0;
  bottom: -30px;
  width: 100%;
  border-radius: 0 0 10px 10px;
  padding: 0 24px;
  background-color: #f4f4f4;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.translated__toolbar .translated__time.new {
  font-size: 12px;
  border-radius: 8px;
  border: solid 1px #dedede;
  line-height: 1.5;
  padding: 0 10px;
  height: 22px;
}
.translated__toolbar .translated__paragraph {
  align-items: center;
}
.translated__toolbar_newword {
  border-radius: 7px;
  border: solid 1px #f8e6cb;
  background-color: #fdf4e6;
  padding: 0 12px;
}
.translated__speaker {
  font-size: 14px;
  font-weight: 600;
  font-stretch: normal;
  font-style: normal;
  line-height: 1.71;
  letter-spacing: normal;
  color: #ee7a3e;
  position: relative;
  cursor: pointer;
}
.translated__speaker_full {
  width: max-content;
  z-index: 100;
  position: absolute;
  left: 0;
  right: 0;
  bottom: 38px;
  padding: 6px;
  display: flex;
  align-items: center;
  border-radius: 8px;
  background-color: #212121;
  color: #fff;
}
.translated__speaker_A {
  color: #ee7a3e;
}
.translated__speaker_B {
  color: #dc34dc;
}
.translated__speaker_C {
  color: #1073e6;
}
.translated__speaker_D {
  color: #dcf4cf;
}
.translated__speaker_D {
  color: #fdf4e6;
}
.translated__confidence {
  font-size: 11px;
}
.translated__confidence_res {
  color: #e96520;
  margin-right: 6px;
}
.translated__confidence_text {
  color: #8f919b;
}
.plyr {
  z-index: 1000;
}
.button_back {
  cursor: pointer;
  margin-bottom: 14px;
  background-color: #000;
  color: #fff;
  border-radius: 8px;
  max-width: 200px;
  padding-left: 10px;
}
#head {
  display: flex;
  justify-content: center;
}
</style>
