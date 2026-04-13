<script setup lang="ts">
import { ref, onMounted, onUnmounted } from 'vue';
import { useAuthStore } from '../stores/auth';
import { useDesktopStore } from '../stores/desktop';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { 
  Folder, 
  Settings, 
  Activity, 
  Bell,
  Search,
  Grid,
  Power,
  RefreshCcw,
  LogOut
} from 'lucide-vue-next';
import Window from '../components/Window.vue';
import Files from './Files.vue';
import Apps from './Apps.vue';
import Home from './Home.vue';
import ControlPanel from './ControlPanel.vue';

const auth = useAuthStore();
const desktop = useDesktopStore();
const router = useRouter();

const stats = ref({ cpu: 0, ram: 0, disk: 0 });

const fetchStats = async () => {
  try {
    const res = await axios.get('/api/system/stats');
    stats.value = res.data;
  } catch (err) {
    console.error('Error fetching stats');
  }
};

let statsInterval: any;

onMounted(() => {
  fetchStats();
  statsInterval = setInterval(fetchStats, 5000);
});

onUnmounted(() => {
  clearInterval(statsInterval);
});

const showUserMenu = ref(false);

const handleLogout = () => {
  auth.logout();
  router.push('/login');
};

const handlePower = async (action: 'reboot' | 'shutdown') => {
  const msg = action === 'reboot' 
      ? '¿Estás seguro de que deseas reiniciar?' 
      : '¿Estás seguro de que deseas apagar? Asegúrate de que es seguro apagar el sistema ahora.';
      
  if (confirm(msg)) {
      try {
          await axios.post(`/api/system/${action}`);
          alert(`Sistema procediendo a ${action === 'reboot' ? 'reiniciar' : 'apagar'}.`);
      } catch (err: any) {
          alert(err.response?.data?.error || 'Error al ejecutar acción de energía');
      }
  }
};

const openApp = (appId: any) => {
  desktop.openWindow(appId);
};
</script>

<template>
  <div 
    class="desktop-container" 
    :style="{ backgroundImage: `url(${desktop.wallpaper})` }"
  >
    <!-- Top Bar -->
    <header class="top-bar glass">
      <div class="top-left">
        <button class="menu-btn"><Grid :size="20" /></button>
        <div class="logo-container">
          <img src="../assets/logo.png" alt="Logo" class="top-logo" />
          <span class="os-name">NubeOS</span>
        </div>
      </div>
      
      <div class="top-right">
        <button class="icon-btn"><Search :size="18"/></button>
        <button class="icon-btn"><Bell :size="18"/></button>
        <div class="time">{{ new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }}</div>
        <div class="user-menu-wrapper" @click="showUserMenu = !showUserMenu">
          <div class="user-pill glass">
            <User :size="16"/>
            <span>{{ auth.user?.username }}</span>
          </div>
          
          <div v-if="showUserMenu" class="user-dropdown glass fade-in">
              <button @click="handleLogout"><LogOut :size="16"/> Cerrar Sesión</button>
              <div class="divider"></div>
              <button @click="handlePower('reboot')"><RefreshCcw :size="16"/> Reiniciar</button>
              <button @click="handlePower('shutdown')" class="danger-btn"><Power :size="16"/> Apagar</button>
          </div>
        </div>
      </div>
    </header>

    <!-- Desktop Icons -->
    <main class="desktop-area">
      <div class="icon-grid">
        <div class="desktop-icon" @click="openApp('files')">
          <div class="icon-box blue"><Folder :size="32" /></div>
          <span>Archivos</span>
        </div>
        
        <div class="desktop-icon" @click="openApp('apps')">
          <div class="icon-box purple"><LayoutDashboard :size="32" /></div>
          <span>App Center</span>
        </div>

        <div class="desktop-icon" @click="openApp('monitor')">
          <div class="icon-box green"><Activity :size="32" /></div>
          <span>Monitor</span>
        </div>

        <div class="desktop-icon" @click="openApp('admin')">
          <div class="icon-box grey"><Settings :size="32" /></div>
          <span>Panel Control</span>
        </div>
      </div>

      <!-- Windows -->
      <Window appId="files" title="Explorador de Archivos">
        <Files />
      </Window>

      <Window appId="apps" title="Centro de Aplicaciones">
        <Apps />
      </Window>

      <Window appId="monitor" title="Monitor del Sistema">
        <Home />
      </Window>

      <Window appId="admin" title="Panel de Control">
        <ControlPanel />
      </Window>
      
      <!-- Resource Widget (Like in TOS) -->
      <aside class="resource-widget glass">
        <div class="widget-header">Estado del Sistema</div>
        <div class="widget-item">
          <div class="label">CPU</div>
          <div class="bar-container"><div class="bar" :style="{ width: stats.cpu + '%' }"></div></div>
          <div class="val">{{ stats.cpu }}%</div>
        </div>
        <div class="widget-item">
          <div class="label">RAM</div>
          <div class="bar-container"><div class="bar" :style="{ width: stats.ram + '%' }"></div></div>
          <div class="val">{{ stats.ram }}%</div>
        </div>
        <div class="widget-item">
          <div class="label">Disco</div>
          <div class="bar-container"><div class="bar" :style="{ width: stats.disk + '%' }"></div></div>
          <div class="val">{{ stats.disk }}%</div>
        </div>
      </aside>
    </main>
  </div>
</template>

<style scoped>
.desktop-container {
  width: 100vw;
  height: 100vh;
  background: url('../assets/wallpaper.png') no-repeat center center;
  background-size: cover;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: white;
}

.top-bar {
  height: 48px;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 1rem;
  border-radius: 0;
  border-left: none;
  border-right: none;
  border-top: none;
  z-index: 1000;
}

.top-left, .top-right {
  display: flex;
  align-items: center;
  gap: 1.5rem;
}

.os-name { font-weight: 800; font-size: 1.1rem; }

.logo-container {
  display: flex;
  align-items: center;
  gap: 0.75rem;
}

.top-logo {
  height: 28px;
  width: auto;
  object-fit: contain;
}

.user-menu-wrapper {
  position: relative;
}

.user-pill {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.4rem 0.75rem;
  font-size: 0.85rem;
  cursor: pointer;
}

.user-dropdown {
  position: absolute;
  top: 120%;
  right: 0;
  min-width: 160px;
  display: flex;
  flex-direction: column;
  padding: 0.5rem;
  box-shadow: 0 10px 25px rgba(0,0,0,0.5);
  border: 1px solid rgba(255,255,255,0.1);
}

.user-dropdown button {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.75rem 1rem;
    background: transparent;
    color: white;
    font-size: 0.85rem;
    width: 100%;
    text-align: left;
}

.user-dropdown button:hover {
    background: rgba(255,255,255,0.1);
}

.user-dropdown .danger-btn:hover {
    background: rgba(239, 68, 68, 0.2);
    color: #fca5a5;
}

.divider {
    height: 1px;
    background: rgba(255,255,255,0.1);
    margin: 0.25rem 0;
}

.desktop-area {
  flex: 1;
  position: relative;
  padding: 2rem;
}

.icon-grid {
  display: grid;
  grid-auto-flow: column;
  grid-template-rows: repeat(auto-fill, 100px);
  gap: 2rem;
  width: min-content;
}

.desktop-icon {
  width: 80px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
  text-align: center;
}

.desktop-icon span {
  font-size: 0.75rem;
  font-weight: 500;
  text-shadow: 0 2px 4px rgba(0,0,0,0.5);
}

.icon-box {
  width: 60px;
  height: 60px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  color: white;
  transition: transform 0.2s;
}

.desktop-icon:hover .icon-box { transform: scale(1.05); }

.icon-box.blue { background: linear-gradient(135deg, #3b82f6, #1d4ed8); }
.icon-box.purple { background: linear-gradient(135deg, #a855f7, #6d28d9); }
.icon-box.green { background: linear-gradient(135deg, #22c55e, #15803d); }
.icon-box.grey { background: linear-gradient(135deg, #64748b, #334155); }

.resource-widget {
  position: absolute;
  top: 2rem;
  right: 2rem;
  width: 240px;
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.widget-header {
  font-size: 0.9rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid var(--border);
}

.widget-item {
  display: grid;
  grid-template-columns: 40px 1fr 30px;
  align-items: center;
  gap: 0.75rem;
  font-size: 0.8rem;
}

.bar-container {
  height: 6px;
  background: rgba(255,255,255,0.1);
  border-radius: 3px;
  overflow: hidden;
}

.bar {
  height: 100%;
  background: var(--primary);
}

.val { font-weight: 700; text-align: right; }
</style>
