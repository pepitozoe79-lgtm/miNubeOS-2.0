#!/bin/bash

echo "🚀 Iniciando proceso de subida a GitHub..."

# Comprobar si git está instalado
if ! command -v git &> /dev/null; then
    echo "❌ Error: Git no está instalado. Ejecuta 'sudo apt install git' primero."
    exit 1
fi

# Inicializar si no existe el repositorio local
if [ ! -d ".git" ]; then
    echo "📦 Inicializando nuevo repositorio local..."
    git init
    git branch -M main
fi

# Eliminar el origen remoto si ya apuntaba a otro lado
git remote remove origin 2>/dev/null || true

# Añadir el repositorio oficial
echo "🔗 Conectando con https://github.com/pepitozoe79-lgtm/miNubeOS.git"
git remote add origin https://github.com/pepitozoe79-lgtm/miNubeOS.git

# Añadir todos los archivos ignorando los secretos (.env y node_modules deberían estar en .gitignore)
echo "📂 Añadiendo archivos..."
git add .

# Hacer el commit
echo "💾 Creando commit..."
git commit -m "Lanzamiento Inicial de NubeOS Premium - V1.0"

# Subir a GitHub
echo "⬆️ Subiendo a GitHub... (Te pedirá tu usuario de GitHub y Token de Acceso Personal)"
git push -u origin main

echo "✅ Proceso completado."
