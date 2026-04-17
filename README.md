# 🏠☁️ miNubeOS

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Estado: Beta](https://img.shields.io/badge/estado-beta-orange)](https://github.com/pepitozoe79-lgtm/miNubeOS/releases)

**Tu nube personal con la fluidez de un sistema operativo de escritorio.**

miNubeOS transforma un ordenador cualquiera (Raspberry Pi, Mini-PC, portátil viejo) en un NAS moderno y un centro de aplicaciones autoalojadas. Olvídate de terminales complejas: gestiona tus archivos y servicios con una interfaz visual inspirada en Windows o macOS.

---

## ✨ ¿Por qué miNubeOS?

- **🖥️ Interfaz de Escritorio Real:** Arrastra y suelta archivos, menús contextuales, vista previa de imágenes y reproducción de vídeo en el navegador.
- **📦 App Center Simplificado:** Instala Plex, Home Assistant, Nextcloud o Transmission con un solo clic. Compatible con el catálogo de **LinuxServer.io** y **CasaOS**.
- **🐳 Motor Docker Integrado:** Todas las apps corren aisladas en contenedores, gestionados automáticamente por el sistema.
- **🔒 Tú eres el dueño:** Tus datos no salen de tu red local. Sin suscripciones, sin límites de almacenamiento impuestos por terceros.

## 📸 Vista Previa

![miNubeOS Desktop](./screenshots/demo_desktop.png)

## 🚀 Instalación Segura (Recomendada)

La forma más segura de instalar miNubeOS es utilizando el paquete **.deb** para sistemas basados en Debian/Ubuntu.

### Método 1: Usando el Paquete .deb (Fácil y Verificable)

1.  Ve a la sección [**Releases**](https://github.com/pepitozoe79-lgtm/miNubeOS/releases) de este repositorio.
2.  Descarga el archivo `miNubeOS_latest_amd64.deb`.
3.  Verifica la integridad del paquete (opcional pero recomendado):
    ```bash
    sha256sum miNubeOS_latest_amd64.deb
    ```
    Compara el resultado con el hash publicado en las notas de la release.
4.  Instálalo con el gestor de paquetes:
    ```bash
    sudo dpkg -i miNubeOS_latest_amd64.deb
    # Si hay errores de dependencias:
    sudo apt-get install -f
    ```
5.  Accede a `http://ip-de-tu-servidor:3000`.

### Método 2: Script de Instalación Manual (Solo para Desarrolladores)

Si prefieres usar el script, **REVÍSALO PRIMERO**. No lo ejecutes a ciegas.
```bash
# 1. Descarga el script SIN ejecutarlo
wget https://raw.githubusercontent.com/pepitozoe79-lgtm/miNubeOS/main/scripts/install.sh

# 2. Ábrelo con un editor de texto para entender qué hace
nano install.sh

# 3. Si estás de acuerdo, ejecútalo manualmente (sin pipe)
chmod +x install.sh
./install.sh
```
*Nota: El script instalará dependencias usando `sudo`. Es responsabilidad del usuario asegurarse de que el script es seguro.*

### Método 3: Instalación Manual Completa

Si prefieres hacerlo paso a paso o estás en otro sistema operativo:

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/pepitozoe79-lgtm/miNubeOS.git
   cd miNubeOS
   ```

2. **Configurar el Backend:**
   ```bash
   cd backend
   npm install
   node src/index.js
   ```

3. **Configurar el Frontend:**
   ```bash
   cd ../frontend
   npm install
   npm run build
   ```

4. **Acceder a la aplicación:**
   Abre tu navegador en `http://ip-de-tu-servidor:3000`

### Opción Windows

Si estás en Windows, puedes usar el script automatizado:

1. Haz doble clic en `instalar_y_ejecutar.bat`.
2. El script detectará Node.js, instalará las dependencias e iniciará frontend y backend automáticamente.
   *(Nota: La instalación de contenedores requiere Docker Desktop en Windows)*

## 🔧 Desarrollo y Tecnología

miNubeOS está construido con tecnologías web modernas:
- **Frontend:** Vue 3 + Vite + Pinia
- **Backend:** Node.js + Express + SQLite
- **Contenedores:** Docker + Docker Compose
- **Integraciones:** Catálogo LinuxServer.io y CasaOS

## 📁 Estructura del Proyecto

- `/backend` — API orientada a servicios, gestión Docker y control del sistema.
- `/frontend` — SPA basada en Vue con arquitectura de "Web OS".
- `/scripts` — Scripts de instalación y despliegue.
- `/data` — Archivos de base de datos persistentes y configuraciones locales.
- `/screenshots` — Capturas de pantalla del proyecto.

## 🤝 Contribuir

El proyecto está en fase beta temprana. Si encuentras un error o tienes una idea para mejorar el App Center, por favor abre un [Issue](https://github.com/pepitozoe79-lgtm/miNubeOS/issues).

**Guía rápida para contribuir:**
1.  Haz un Fork del repositorio.
2.  Crea una rama (`git checkout -b feature/mi-super-app`).
3.  Realiza tus cambios siguiendo la estructura de carpetas existente.
4.  Envía un Pull Request.

## 📜 Licencia

MIT License. Eres libre de usar, modificar y distribuir este software.

---

**Desarrollado con ☕ y código abierto.**
