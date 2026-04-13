const Docker = require('dockerode');
const isLinux = process.platform === 'linux';

// Initialize Docker with default settings or specific Linux socket
const docker = new Docker(isLinux ? { socketPath: '/var/run/docker.sock' } : {}); 

let isMockMode = false;

const getContainers = async () => {
  try {
    const containers = await docker.listContainers({ all: true });
    return containers.map(c => ({
      id: c.Id,
      name: c.Names[0].replace('/', ''),
      image: c.Image,
      status: c.State,
      state: c.Status
    }));
  } catch (error) {
    console.warn('⚠️ Docker no accesible:', error.message);
    // If permission denied or dev mode, return mock data to keep UI functional
    if (process.env.NODE_ENV === 'development' || error.message.includes('permission denied') || error.code === 'ENOENT') {
      isMockMode = true;
      return [
        { id: '1', name: 'Nextcloud (Modo Demo)', image: 'nextcloud:latest', status: 'running', state: 'Up 2 horas' },
        { id: '2', name: 'Pi-hole (Modo Demo)', image: 'pihole/pihole:latest', status: 'exited', state: 'Exited (0) 5 days ago' },
        { id: '3', name: 'Plex (Modo Demo)', image: 'plexinc/pms-docker', status: 'running', state: 'Up 10 minutos' }
      ];
    }
    return [];
  }
};

const getAvailableApps = () => {
  return []; // Ahora gestionado dinámicamente por appStoreService
};

const installApp = async (appId) => {
  if (isMockMode) return true;
  
  const apps = getAvailableApps();
  const app = apps.find(a => a.id === appId);
  if (!app) throw new Error('Aplicación no encontrada en la tienda');

  // Pull image
  await new Promise((resolve, reject) => {
    docker.pull(app.image, (err, stream) => {
      if (err) return reject(err);
      docker.modem.followProgress(stream, (err, output) => {
        if (err) reject(err);
        else resolve(output);
      });
    });
  });

  // Prepare Port Bindings
  const portBindings = {};
  const exposedPorts = {};
  for (const [containerPort, hostPort] of Object.entries(app.ports)) {
    portBindings[containerPort] = [{ HostPort: hostPort.toString() }];
    exposedPorts[containerPort] = {};
  }

  // Create Container
  const container = await docker.createContainer({
    Image: app.image,
    name: `nubeos-${app.id}`,
    ExposedPorts: exposedPorts,
    HostConfig: {
      PortBindings: portBindings,
      RestartPolicy: { Name: 'always' }
    }
  });

  return await container.start();
};

const startContainer = async (id) => {
  if (isMockMode) return true;
  const container = docker.getContainer(id);
  return await container.start();
};

const stopContainer = async (id) => {
  if (isMockMode) return true;
  const container = docker.getContainer(id);
  return await container.stop();
};

module.exports = {
  getContainers,
  getAvailableApps,
  startContainer,
  stopContainer,
  installApp,
  isMockMode: () => isMockMode
};
