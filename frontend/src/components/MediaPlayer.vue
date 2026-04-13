<script setup lang="ts">
import { ref, onMounted, computed } from 'vue';
import { X, Play, Pause, Maximize } from 'lucide-vue-next';

const props = defineProps<{
  fileUrl: string;
  fileName: string;
  fileType: 'video' | 'audio';
}>();

const emit = defineEmits(['close']);

const mediaRef = ref<HTMLMediaElement | null>(null);
const isPlaying = ref(false);
const progress = ref(0);
const duration = ref(0);

const isVideo = computed(() => props.fileType === 'video');

const togglePlay = () => {
    if (!mediaRef.value) return;
    if (mediaRef.value.paused) {
        mediaRef.value.play();
        isPlaying.value = true;
    } else {
        mediaRef.value.pause();
        isPlaying.value = false;
    }
};

const updateProgress = () => {
    if (mediaRef.value) {
        progress.value = (mediaRef.value.currentTime / mediaRef.value.duration) * 100;
    }
};

const setDuration = () => {
    if (mediaRef.value) {
        duration.value = mediaRef.value.duration;
    }
};

const seek = (event: MouseEvent) => {
    if (!mediaRef.value) return;
    const bar = event.currentTarget as HTMLElement;
    const rect = bar.getBoundingClientRect();
    const pos = (event.clientX - rect.left) / rect.width;
    mediaRef.value.currentTime = pos * mediaRef.value.duration;
};

const toggleFullscreen = () => {
    if (!mediaRef.value) return;
    if (mediaRef.value.requestFullscreen) {
        mediaRef.value.requestFullscreen();
    }
};

onMounted(() => {
    if (mediaRef.value) {
        mediaRef.value.play().then(() => isPlaying.value = true).catch(() => {});
    }
});
</script>

<template>
  <div class="media-modal-overlay">
      <div class="media-modal glass" :class="{ 'audio-mode': !isVideo }">
          <header class="media-header">
              <span class="media-title">{{ fileName }}</span>
              <button class="close-btn" @click="emit('close')"><X :size="20"/></button>
          </header>

          <div class="media-content">
              <video 
                  v-if="isVideo" 
                  ref="mediaRef" 
                  :src="fileUrl" 
                  @timeupdate="updateProgress"
                  @loadedmetadata="setDuration"
                  @click="togglePlay"
              ></video>
              
              <audio 
                  v-else
                  ref="mediaRef"
                  :src="fileUrl"
                  @timeupdate="updateProgress"
                  @loadedmetadata="setDuration"
              ></audio>

              <div class="audio-viz" v-if="!isVideo">
                  <!-- Solo decorativo para audio -->
                  🎵
              </div>
          </div>

          <div class="media-controls">
              <button @click="togglePlay" class="ctrl-btn">
                  <Pause v-if="isPlaying" :size="20" />
                  <Play v-else :size="20" />
              </button>
              
              <div class="progress-bar" @click="seek">
                  <div class="progress-fill" :style="{ width: progress + '%' }"></div>
              </div>
              
              <button v-if="isVideo" @click="toggleFullscreen" class="ctrl-btn">
                  <Maximize :size="18"/>
              </button>
          </div>
      </div>
  </div>
</template>

<style scoped>
.media-modal-overlay {
    position: fixed;
    top: 0; left: 0; right: 0; bottom: 0;
    background: rgba(0,0,0,0.8);
    backdrop-filter: blur(5px);
    z-index: 10000;
    display: flex;
    align-items: center;
    justify-content: center;
}

.media-modal {
    width: 80vw;
    max-width: 1000px;
    display: flex;
    flex-direction: column;
    border-radius: 12px;
    overflow: hidden;
    box-shadow: 0 25px 50px rgba(0,0,0,0.5);
    background: rgba(15, 23, 42, 0.9);
}

.media-modal.audio-mode {
    width: 400px;
}

.media-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 1rem;
    background: rgba(0,0,0,0.2);
}

.media-title {
    font-size: 0.9rem;
    font-weight: 600;
    color: white;
    text-overflow: ellipsis;
    overflow: hidden;
    white-space: nowrap;
}

.close-btn {
    background: transparent;
    color: var(--text-muted);
}
.close-btn:hover { color: #ef4444; }

.media-content {
    position: relative;
    width: 100%;
    background: black;
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100px;
}

video {
    width: 100%;
    max-height: 70vh;
    object-fit: contain;
}

.audio-viz {
    font-size: 4rem;
    padding: 2rem;
    animation: pulse 2s infinite;
}

.media-controls {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 1rem;
    background: rgba(0,0,0,0.5);
}

.ctrl-btn {
    background: transparent;
    color: white;
    display: flex;
    align-items: center;
    justify-content: center;
}

.ctrl-btn:hover { color: var(--primary); }

.progress-bar {
    flex: 1;
    height: 8px;
    background: rgba(255,255,255,0.2);
    border-radius: 4px;
    cursor: pointer;
    overflow: hidden;
}

.progress-fill {
    height: 100%;
    background: var(--primary);
    pointer-events: none;
}

@keyframes pulse {
    0% { transform: scale(1); }
    50% { transform: scale(1.1); }
    100% { transform: scale(1); }
}
</style>
