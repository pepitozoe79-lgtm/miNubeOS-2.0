#!/bin/bash
# Script de instalación segura para miNubeOS
# Versión: 1.0.0
#
# USO RECOMENDADO:
#   1. Descarga este script: wget <url>/scripts/install.sh
#   2. Léelo antes de ejecutar: nano install.sh
#   3. Ejecútalo: chmod +x install.sh && ./install.sh

set -e  # Detiene el script si hay un error

# Colores para la terminal
RED='\033[0;31m'
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE} Instalador de miNubeOS (Modo Seguro)${NC}"
echo -e "${BLUE}==============================================${NC}"
echo ""
echo -e "${YELLOW}ADVERTENCIA: No se recomienda ejecutar scripts${NC}"
echo -e "${YELLOW}descargados de internet con 'sudo' directamente.${NC}"
echo -e "${YELLOW}Este script solo solicitará permisos de administrador${NC}"
echo -e "${YELLOW}para instalar dependencias del sistema (Docker/Node).${NC}"
echo ""
read -p "¿Deseas continuar? (s/N): " confirm
if [[ ! "$confirm" =~ ^[Ss]$ ]]; then
    echo "Instalación cancelada."
    exit 1
fi

# --- 1. Instalar dependencias del sistema (requiere sudo) ---
echo ""
echo -e "${GREEN}[1/5] Instalando dependencias del sistema...${NC}"
sudo apt update
sudo apt install -y git curl build-essential ca-certificates gnupg lsb-release

# --- 2. Instalar Docker si no existe ---
if ! command -v docker &> /dev/null; then
    echo -e "${GREEN}[2/5] Instalando Docker...${NC}"
    curl -fsSL https://get.docker.com | sh
    sudo usermod -aG docker $USER
    echo -e "${YELLOW}NOTA: Cierra sesión y vuelve a entrar para usar Docker sin sudo.${NC}"
else
    echo -e "${GREEN}[2/5] Docker ya está instalado.${NC}"
fi

# --- 3. Verificar Node.js ---
echo -e "${GREEN}[3/5] Verificando Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${YELLOW}Node.js no está instalado. Instalando v20 LTS...${NC}"
    curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
    sudo apt install -y nodejs
else
    NODE_VERSION=$(node -v | sed 's/v//' | cut -d. -f1)
    if [ "$NODE_VERSION" -lt 18 ]; then
        echo -e "${RED}Node.js v${NODE_VERSION} detectado. Se requiere v18+.${NC}"
        echo "Por favor, actualiza Node.js desde https://nodejs.org o usa NVM."
        exit 1
    fi
    echo -e "${GREEN}Node.js $(node -v) detectado. OK.${NC}"
fi

# --- 4. Clonar el repositorio en el home del usuario (SIN SUDO) ---
INSTALL_DIR="$HOME/miNubeOS"
echo -e "${GREEN}[4/5] Preparando miNubeOS en $INSTALL_DIR...${NC}"

if [ -d "$INSTALL_DIR" ]; then
    echo -e "${BLUE}El directorio $INSTALL_DIR ya existe. Actualizando...${NC}"
    cd "$INSTALL_DIR"
    git pull
else
    echo -e "${BLUE}Clonando repositorio...${NC}"
    git clone https://github.com/pepitozoe79-lgtm/miNubeOS.git "$INSTALL_DIR"
    cd "$INSTALL_DIR"
fi

# --- 5. Instalar dependencias de Node y compilar (SIN SUDO) ---
echo -e "${GREEN}[5/5] Instalando dependencias y compilando...${NC}"

# Asegurar directorios de datos
mkdir -p "$INSTALL_DIR/data/db"
mkdir -p "$INSTALL_DIR/data/users"

# Backend
cd "$INSTALL_DIR/backend"
npm install --production

# Generar archivo .env si no existe
if [ ! -f .env ]; then
    echo -e "${BLUE}Generando configuración .env...${NC}"
    JWT_SECRET=$(head /dev/urandom | tr -dc A-Za-z0-9 | head -c 32)
    cat <<EOF > .env
PORT=3000
JWT_SECRET=$JWT_SECRET
DB_PATH=../data/db/nubeos.sqlite
NODE_ENV=production
EOF
    echo -e "${BLUE}.env creado con una clave JWT aleatoria.${NC}"
fi

# Frontend
cd "$INSTALL_DIR/frontend"
npm install
npm run build

# --- 6. Configurar servicio Systemd (PIDE SUDO AL FINAL) ---
echo ""
echo -e "${GREEN}Configurando servicio de sistema...${NC}"
SERVICE_FILE="/etc/systemd/system/minubeos.service"
if [ ! -f "$SERVICE_FILE" ]; then
    echo "Creando archivo de servicio (requiere sudo)..."
    sudo tee "$SERVICE_FILE" > /dev/null <<EOF
[Unit]
Description=miNubeOS Backend Service
After=network.target docker.service

[Service]
Type=simple
User=$USER
WorkingDirectory=$INSTALL_DIR/backend
ExecStart=/usr/bin/node $INSTALL_DIR/backend/src/index.js
Restart=on-failure
Environment=NODE_ENV=production

[Install]
WantedBy=multi-user.target
EOF

    sudo systemctl daemon-reload
    sudo systemctl enable minubeos
    sudo systemctl start minubeos
    echo -e "${GREEN}Servicio iniciado.${NC}"
else
    echo -e "${BLUE}El servicio ya existe. Reiniciando...${NC}"
    sudo systemctl restart minubeos
fi

echo ""
echo -e "${BLUE}==============================================${NC}"
echo -e "${BLUE} ¡Instalación completada con éxito!${NC}"
echo -e "${BLUE}==============================================${NC}"
echo ""
echo -e "Accede a la interfaz web: ${GREEN}http://$(hostname -I | awk '{print $1}'):3000${NC}"
echo ""
echo -e "Credenciales por defecto:"
echo -e "  Usuario:    ${BLUE}admin${NC}"
echo -e "  Contraseña: ${BLUE}admin123${NC}"
echo ""
echo -e "Gestionar el servicio:"
echo -e "  sudo systemctl status minubeos"
echo -e "  sudo systemctl restart minubeos"
echo -e "  sudo systemctl stop minubeos"
echo ""
echo -e "${BLUE}¡Gracias por usar miNubeOS!${NC}"
