<template>
  <div class="bg-slate-800 p-4 rounded-lg">
    <div class="flex items-center gap-2">
      <div :class="connected ? 'bg-green-500' : 'bg-red-500'" class="w-3 h-3 rounded-full"></div>
      <span class="font-mono text-sm">{{ connected ? 'Conectado' : 'Desconectado' }}</span>
    </div>
    <p class="text-xs text-slate-400 mt-2">Último latido: {{ lastBeat }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { io, Socket } from 'socket.io-client';

const connected = ref(false);
const lastBeat = ref('');
let socket: Socket;

onMounted(() => {
  socket = io('http://localhost:3001');
  socket.on('connect', () => connected.value = true);
  socket.on('disconnect', () => connected.value = false);
  socket.on('heartbeat', (data) => {
    lastBeat.value = new Date(data.timestamp).toLocaleTimeString();
  });
});

onUnmounted(() => socket?.disconnect());
</script>
