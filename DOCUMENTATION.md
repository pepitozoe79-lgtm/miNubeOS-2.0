# Documentación de NubeOS ☁️

NubeOS es un sistema de gestión de archivos y aplicaciones en la nube para uso personal (NAS casero). Proporciona una interfaz de escritorio intuitiva basada en la web para gestionar archivos, instalar aplicaciones mediante Docker y monitorear el sistema.

## 🌟 Características Destacadas

NubeOS incluye funciones premium diseñadas para darte el máximo control:

- **App Center Integrado**: Sincronización directa con el catálogo oficial de **CasaOS**, ofreciendo cientos de aplicaciones profesionales organizadas por categorías con un buscador en tiempo real.
- **Soporte Docker Compose**: Capacidad avanzada para instalar y gestionar despliegues multicontenedor (stacks) completos de forma automática desde la interfaz gráfica.
- **Reproductor Multimedia**: Visualiza videos y reproduce audios directamente desde tu navegador a través de un reproductor flotante con modo de pantalla completa.
- **Explorador Refinado**: Incluye barra de progreso de subida de archivos, vistas intercambiables y menú contextual interactivo (renombrar, eliminar, reproducir).
- **Control de Energía Remoto**: Reinicia o apaga tu servidor Unix directamente desde el panel del usuario en la parte superior derecha.

## 🚀 Guía de Instalación

### Linux (Debian/Ubuntu)
El instalador automatizado configura Docker, Node.js y los servicios del sistema:

```bash
sudo ./install.sh
```
*El script generará automáticamente un archivo `.env` con una clave secreta aleatoria.*

### Windows
Usa el script por lotes para instalar dependencias y ejecutar localmente:
```cmd
instalar_y_ejecutar.bat
```

---

## ⚙️ Configuración (.env)

El backend requiere un archivo `.env` en la carpeta `backend/` para funcionar correctamente:

- `PORT`: Puerto donde corre la API (por defecto 3000).
- `JWT_SECRET`: Clave secreta para firmar tokens de sesión. **¡Esencial para el login!**
- `DB_PATH`: Ruta a la base de datos SQLite.
- `NODE_ENV`: Modo de ejecución (`development` o `production`).

---

## 🛠️ Gestión de Usuarios

### Usuarios por Defecto
Al instalar, el sistema crea un usuario base:
- **Usuario**: `admin`
- **Contraseña**: `admin123`

### Utilidades Administrativas
He incluido scripts en la carpeta `backend/` para gestionar accesos manualmente si pierdes el acceso:

- **Restablecer Admin**: `node backend/reset-password.js`
- **Agregar Usuario Marco**: `node backend/add-user-marco.js`

---

## 📡 Referencia de la API

La API corre en el puerto 3000 por defecto.

| Endpoint | Método | Descripción | Requiere Auth |
| :--- | :--- | :--- | :--- |
| `/api/auth/login` | POST | Inicia sesión y devuelve un JWT. | No |
| `/api/files/list` | GET | Lista archivos en el almacenamiento. | Sí |
| `/api/files/rename`| POST | Renombra directorios o archivos. | Sí |
| `/api/files/stream`| GET | Retorna media para streaming (Rango de bytes).| Sí |
| `/api/apps/store` | GET | Lista apps descargando metadata de CasaOS. | Sí |
| `/api/apps/installed`| GET | Lista contenedores Docker instalados. | Sí |
| `/api/system/status` | GET | Devuelve CPU, RAM y espacio en disco. | Sí |
| `/api/system/reboot` | POST | Ejecuta reinicio del sistema Unix. | Sí |
| `/api/system/shutdown`| POST | Apaga el sistema Unix por completo. | Sí |

---

## 🏗️ Arquitectura Técnica

- **Frontend**: Vue 3 (Composition API), Vite, Pinia para estado, Axios para peticiones.
- **Backend**: Node.js, Express, Better-SQLite3 para una base de datos ligera y rápida.
- **Servicios**: Dockerode para la comunicación directa con el socket de Docker.

---

## ❓ Solución de Problemas

### Error en el servidor (Login)
Si ves este mensaje, verifica que el archivo `backend/.env` existe y tiene un `JWT_SECRET` definido. Reinicia el servicio después de crearlo:
```bash
sudo systemctl restart nubeos-backend
```

### Credenciales Inválidas
Asegúrate de haber ejecutado los scripts de inicialización o creación de usuarios. Las contraseñas se almacenan con cifrado bcrypt.
