import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router'
import axios from 'axios'

// Configurar API para apuntar directamente al backend (puerto 3000)
// y evitar que el proxy dev de Vite se colapse con archivos grandes.
const { hostname } = window.location;
axios.defaults.baseURL = `http://${hostname}:3000`;

const app = createApp(App)

app.use(createPinia())
app.use(router)

app.mount('#app')
