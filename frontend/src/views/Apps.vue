<script setup lang="ts">
import { onMounted, ref, watch } from 'vue';
import axios from 'axios';
import { 
  Play, 
  Square, 
  Download, 
  ExternalLink, 
  RefreshCw,
  Search,
  LayoutGrid,
  Box,
  Cpu,
  Globe,
  HardDrive,
  Shield
} from 'lucide-vue-next';

const allApps = ref<any[]>([]);
const categories = ref<any[]>([]);
const loading = ref(false);
const selectedCategory = ref('All');
const searchQuery = ref('');

const fetchCategories = async () => {
    try {
        const res = await axios.get('/api/apps/categories');
        categories.value = [{ name: 'All' }, ...res.data];
    } catch (e) {
        console.error('Error fetching categories');
        categories.value = [{ name: 'All' }];
    }
}

const fetchData = async () => {
  loading.value = true;
  try {
    const [instRes, storeRes] = await Promise.all([
      axios.get('/api/apps/installed').catch(() => ({ data: [] })),
      axios.get('/api/apps/store', { 
          params: { 
              category: selectedCategory.value === 'All' ? null : selectedCategory.value,
              search: searchQuery.value 
          } 
      }).catch(() => ({ data: [] }))
    ]);

    const installed = instRes.data;
    const store = storeRes.data;

    allApps.value = store.map((sApp: any) => {
      const isInstalled = installed.find((iApp: any) => 
        iApp.name === `nubeos-${sApp.id}` || iApp.name === sApp.id
      );
      return {
        ...sApp,
        container: isInstalled || null
      };
    });
  } catch (err) {
    console.error('Error fetching data:', err);
  } finally {
    loading.value = false;
  }
};

onMounted(() => {
    fetchCategories();
    fetchData();
});

// Watch for changes to refine search/category without explicit refresh
watch([selectedCategory, searchQuery], () => {
    fetchData();
});

const startApp = async (id: string) => {
  try {
    await axios.post(`/api/apps/${id}/start`);
    fetchData();
  } catch (err) {
    alert('Error al iniciar app');
  }
};

const stopApp = async (id: string) => {
  try {
    await axios.post(`/api/apps/${id}/stop`);
    fetchData();
  } catch (err) {
    alert('Error al detener app');
  }
};

const installingApp = ref<string | null>(null);

const installApp = async (id: string) => {
  if (installingApp.value) return;
  installingApp.value = id;
  try {
    const res = await axios.post(`/api/apps/install/${id}`);
    alert(res.data.message);
    fetchData();
  } catch (err: any) {
    alert(err.response?.data?.error || 'Error al instalar app');
  } finally {
    installingApp.value = null;
  }
};

const getCategoryIcon = (cat: string) => {
    switch(cat) {
        case 'All': return LayoutGrid;
        case 'Network': return Globe;
        case 'Media': return Play;
        case 'Security': return Shield;
        case 'Storage': return HardDrive;
        case 'Development': return Cpu;
        default: return Box;
    }
}
</script>

<template>
  <div class="apps-container fade-in">
    <!-- Sidebar for Categories -->
    <aside class="apps-sidebar glass">
        <div class="sidebar-section">
            <h2 class="section-title">Categorías</h2>
            <nav class="category-nav">
                <button 
                    v-for="cat in categories" 
                    :key="cat.name"
                    @click="selectedCategory = cat.name"
                    :class="{ active: selectedCategory === cat.name }"
                >
                    <component :is="getCategoryIcon(cat.name)" :size="18" />
                    <span>{{ cat.name }}</span>
                </button>
            </nav>
        </div>
    </aside>

    <main class="apps-content">
        <header class="view-header">
          <div class="title-group">
            <h1>App Center (CasaOS)</h1>
            <p>Explora cientos de aplicaciones listas para instalar en tu NubeOS.</p>
          </div>

          <div class="header-actions">
            <div class="search-box glass">
                <Search :size="18" />
                <input v-model="searchQuery" type="text" placeholder="Buscar aplicaciones..." />
            </div>
            <button @click="fetchData" class="refresh-btn" :class="{ spinning: loading }">
                <RefreshCw :size="18"/>
            </button>
          </div>
        </header>

        <div v-if="loading && allApps.length === 0" class="loading-state">
            <RefreshCw :size="48" class="spinning" />
            <p>Sincronizando con el catálogo de CasaOS...</p>
        </div>

        <div v-else class="apps-grid">
          <div v-for="app in allApps" :key="app.id" class="app-card glass" :class="{ inactive: !app.container }">
            <div class="app-header">
              <div class="app-icon" v-if="app.icon">
                  <img :src="app.icon" :alt="app.title" onerror="this.src='https://cdn-icons-png.flaticon.com/512/5738/5738031.png'" />
              </div>
              <div class="app-icon placeholder" v-else><Box :size="24" /></div>
              
              <div class="app-info">
                <div class="title-row">
                  <h3>{{ app.title }}</h3>
                  <div v-if="app.container" class="status-badge" :class="app.container.status">
                    {{ app.container.status === 'running' ? 'Activa' : 'Detenida' }}
                  </div>
                  <div v-else class="status-badge inactive">Store</div>
                </div>
                <p class="app-desc">{{ app.description }}</p>
                <div class="app-meta">Por: <b>{{ app.author }}</b> • {{ app.category }}</div>
              </div>
            </div>
            
            <div class="app-actions">
              <button 
                v-if="!app.container" 
                @click="installApp(app.id)" 
                class="action-btn activate"
                :disabled="installingApp === app.id"
              >
                <template v-if="installingApp === app.id">
                  <RefreshCw :size="16" class="spinning"/> <span>Instalando...</span>
                </template>
                <template v-else>
                  <Download :size="16"/> <span>Instalar</span>
                </template>
              </button>

              <template v-else>
                <button 
                  v-if="app.container.status !== 'running'" 
                  @click="startApp(app.container.id)"
                  class="action-btn start"
                >
                  <Play :size="16"/> <span>Reanudar</span>
                </button>
                <button 
                  v-else 
                  @click="stopApp(app.container.id)"
                  class="action-btn stop"
                >
                  <Square :size="16"/> <span>Detener</span>
                </button>
                
                <button class="action-btn open">
                  <ExternalLink :size="16"/> <span>Abrir</span>
                </button>
              </template>
            </div>
          </div>
          
          <div v-if="allApps.length === 0 && !loading" class="empty-state">
              <Box :size="64" />
              <p>No se encontraron aplicaciones en esta categoría.</p>
          </div>
        </div>
    </main>
  </div>
</template>

<style scoped>
.apps-container {
  display: flex;
  gap: 2rem;
  height: 100%;
}

.apps-sidebar {
    width: 240px;
    padding: 1.5rem;
    height: fit-content;
}

.section-title {
    font-size: 0.8rem;
    text-transform: uppercase;
    letter-spacing: 0.1em;
    color: var(--text-muted);
    margin-bottom: 1.5rem;
}

.category-nav {
    display: flex;
    flex-direction: column;
    gap: 0.5rem;
}

.category-nav button {
    display: flex;
    align-items: center;
    gap: 1rem;
    padding: 0.75rem 1rem;
    background: transparent;
    color: var(--text-muted);
    transition: all 0.2s;
    justify-content: flex-start;
}

.category-nav button:hover {
    background: rgba(255,255,255,0.05);
    color: white;
}

.category-nav button.active {
    background: var(--primary);
    color: white;
}

.apps-content {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 2rem;
}

.view-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
}

.title-group h1 { font-size: 1.75rem; margin-bottom: 0.25rem; }
.title-group p { color: var(--text-muted); font-size: 0.9rem; }

.header-actions {
    display: flex;
    gap: 1rem;
    align-items: center;
}

.search-box {
    display: flex;
    align-items: center;
    gap: 0.75rem;
    padding: 0.5rem 1rem;
    border-radius: 12px;
    width: 300px;
}

.search-box input {
    background: transparent;
    border: none;
    color: white;
    font-size: 0.9rem;
    width: 100%;
}

.search-box input:focus { outline: none; }

.refresh-btn {
  background: rgba(255, 255, 255, 0.05);
  padding: 0.75rem;
  color: var(--text-muted);
}

.refresh-btn.spinning { animation: spin 1s linear infinite; }

.apps-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(350px, 1fr));
  gap: 1.5rem;
  padding-bottom: 2rem;
}

.app-card {
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.25rem;
}

.app-header {
  display: flex;
  align-items: flex-start;
  gap: 1.25rem;
}

.app-icon {
  width: 64px;
  height: 64px;
  background: white;
  border-radius: 16px;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  flex-shrink: 0;
}

.app-icon img {
    width: 80%;
    height: 80%;
    object-fit: contain;
}

.app-icon.placeholder {
    background: rgba(255,255,255,0.05);
    color: var(--text-muted);
}

.app-info { flex: 1; }
.title-row { display: flex; align-items: center; justify-content: space-between; margin-bottom: 0.25rem; }
.app-info h3 { font-size: 1.1rem; font-weight: 700; color: white; }
.app-desc { 
    font-size: 0.8rem; 
    color: var(--text-muted); 
    line-height: 1.4; 
    margin-bottom: 0.75rem;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
}

.app-meta {
    font-size: 0.7rem;
    color: var(--text-muted-more);
}

.status-badge {
  font-size: 0.65rem;
  text-transform: uppercase;
  font-weight: 800;
  padding: 0.2rem 0.6rem;
  border-radius: 6px;
  letter-spacing: 0.05em;
}

.status-badge.running { background: rgba(34, 197, 94, 0.15); color: #4ade80; }
.status-badge.exited { background: rgba(239, 68, 68, 0.15); color: #f87171; }
.status-badge.inactive { background: rgba(255, 255, 255, 0.05); color: #94a3b8; }

.app-actions {
  display: flex;
  gap: 0.75rem;
  border-top: 1px solid var(--border);
  padding-top: 1.25rem;
}

.action-btn {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  font-size: 0.85rem;
  padding: 0.6rem;
}

.action-btn.activate { background: var(--primary); color: white; border: none; font-weight: 700; }
.action-btn.start { background: rgba(34, 197, 94, 0.1); color: #4ade80; }
.action-btn.stop { background: rgba(239, 68, 68, 0.1); color: #f87171; }
.action-btn.open { background: rgba(255, 255, 255, 0.05); color: white; border: 1px solid rgba(255,255,255,0.1); }

/* States */
.loading-state, .empty-state {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 1.5rem;
    padding: 5rem;
    color: var(--text-muted);
}

@keyframes spin { from { transform: rotate(0deg); } to { transform: rotate(360deg); } }
</style>
