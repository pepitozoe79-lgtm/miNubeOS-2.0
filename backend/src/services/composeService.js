const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const yaml = require('js-yaml');

const APPS_DATA_DIR = path.resolve(__dirname, '../../../data/apps');

if (!fs.existsSync(APPS_DATA_DIR)) {
    fs.mkdirSync(APPS_DATA_DIR, { recursive: true });
}

class ComposeService {
    async deployApp(appId, composeData) {
        const appPath = path.join(APPS_DATA_DIR, appId);
        
        if (!fs.existsSync(appPath)) {
            fs.mkdirSync(appPath, { recursive: true });
        }

        const composeFilePath = path.join(appPath, 'docker-compose.yml');
        fs.writeFileSync(composeFilePath, yaml.dump(composeData));

        return new Promise((resolve, reject) => {
            console.log(`🚀 Desplegando ${appId} con Docker Compose...`);
            
            exec('docker compose up -d', { cwd: appPath }, (error, stdout, stderr) => {
                if (error) {
                    console.error(`❌ Error en Compose: ${stderr}`);
                    return reject(new Error(stderr || error.message));
                }
                console.log(`✅ ${appId} desplegado con éxito.`);
                resolve({ stdout, stderr });
            });
        });
    }

    async stopApp(appId) {
        const appPath = path.join(APPS_DATA_DIR, appId);
        return new Promise((resolve, reject) => {
            exec('docker compose stop', { cwd: appPath }, (error, stdout, stderr) => {
                if (error) return reject(new Error(stderr));
                resolve(stdout);
            });
        });
    }

    async removeApp(appId) {
        const appPath = path.join(APPS_DATA_DIR, appId);
        return new Promise((resolve, reject) => {
            exec('docker compose down', { cwd: appPath }, (error, stdout, stderr) => {
                if (error) return reject(new Error(stderr));
                // Optionally remove the directory
                // fs.rmSync(appPath, { recursive: true, force: true });
                resolve(stdout);
            });
        });
    }
}

module.exports = new ComposeService();
