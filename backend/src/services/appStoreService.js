const axios = require('axios');
const yaml = require('js-yaml');

const GITHUB_REPO = 'IceWhaleTech/CasaOS-AppStore';
const BASE_RAW_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/Apps`;
const CATEGORY_LIST_URL = `https://raw.githubusercontent.com/${GITHUB_REPO}/main/category-list.json`;

class AppStoreService {
  constructor() {
    this.cache = null;
    this.lastFetch = null;
    this.CACHE_DURATION = 1000 * 60 * 60; // 1 hour cache to avoid rate limits
  }

  async getCategories() {
    try {
      const response = await axios.get(CATEGORY_LIST_URL);
      return response.data;
    } catch (error) {
      console.error('Error fetching categories:', error.message);
      return [];
    }
  }

  async getApps(category = null, search = '') {
    try {
      // In a real implementation with real-time fetch, we'd use the GitHub API to list folders.
      // For this implementation, we will fetch the 'recommend-list.json' as a base 
      // or implement a full tree scan if needed.
      // To keep it "live" but functional, let's fetch the main tree once.

      const treeUrl = `https://api.github.com/repos/${GITHUB_REPO}/contents/Apps`;
      const response = await axios.get(treeUrl);
      const appFolders = response.data.filter(item => item.type === 'dir');

      let apps = await Promise.all(appFolders.slice(0, 30).map(async (folder) => { // Limited to 30 for performance in this demo
        try {
          const composeUrl = `${BASE_RAW_URL}/${folder.name}/docker-compose.yml`;
          const composeRes = await axios.get(composeUrl);
          const doc = yaml.load(composeRes.data);
          
          if (doc && doc['x-casaos']) {
            const metadata = doc['x-casaos'];
            return {
              id: folder.name,
              name: folder.name, 
              title: metadata.title?.en_us || folder.name,
              icon: metadata.icon || '',
              description: metadata.description?.en_us || '',
              tag: metadata.tag || '',
              thumbnail: metadata.thumbnail || '',
              author: metadata.author || 'Desconocido',
              category: metadata.tag ? metadata.tag.split(',')[0].trim() : 'Otros'
            };
          }
        } catch (e) {
          // Skip apps with errors
        }
        return null;
      }));

      apps = apps.filter(a => a !== null);

      // Filtering
      if (category && category !== 'All') {
        apps = apps.filter(a => a.category === category);
      }
      if (search) {
        const query = search.toLowerCase();
        apps = apps.filter(a => 
          a.title.toLowerCase().includes(query) || 
          a.description.toLowerCase().includes(query)
        );
      }

      return apps;
    } catch (error) {
      console.error('Error syncing CasaOS App Store:', error.message);
      return [];
    }
  }

  async getAppDetails(appId) {
    const composeUrl = `${BASE_RAW_URL}/${appId}/docker-compose.yml`;
    const response = await axios.get(composeUrl);
    return yaml.load(response.data);
  }
}

module.exports = new AppStoreService();
