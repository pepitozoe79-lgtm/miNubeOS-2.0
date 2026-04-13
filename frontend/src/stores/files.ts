import { defineStore } from 'pinia';
import axios from 'axios';

export interface FileItem {
  name: string;
  isDirectory: boolean;
  size: number;
  modified: string;
  extension: string;
}

export const useFileStore = defineStore('files', {
  state: () => ({
    currentPath: '',
    items: [] as FileItem[],
    loading: false,
    error: null as string | null,
    uploadProgress: 0,
    isUploading: false,
  }),

  actions: {
    async fetchFiles(path: string = '') {
      this.loading = true;
      try {
        const response = await axios.get(`/api/files/list?path=${path}`);
        this.items = response.data.items;
        this.currentPath = response.data.currentPath;
      } catch (err: any) {
        this.error = err.response?.data?.error || 'Error al obtener archivos';
      } finally {
        this.loading = false;
      }
    },

    async createFolder(folderName: string) {
      try {
        await axios.post('/api/files/mkdir', { folderName, path: this.currentPath });
        await this.fetchFiles(this.currentPath);
      } catch (err: any) {
        alert(err.response?.data?.error || 'Error al crear carpeta');
      }
    },

    async deleteItems(names: string[]) {
      try {
        await axios.delete('/api/files/delete', { data: { items: names, path: this.currentPath } });
        await this.fetchFiles(this.currentPath);
      } catch (err: any) {
        alert(err.response?.data?.error || 'Error al eliminar');
      }
    },

    async uploadFiles(files: FileList) {
      const formData = new FormData();
      for (let i = 0; i < files.length; i++) {
        formData.append('files', files[i]);
      }
      
      this.isUploading = true;
      this.uploadProgress = 0;

      try {
        await axios.post(`/api/files/upload?path=${this.currentPath}`, formData, {
          headers: { 'Content-Type': 'multipart/form-data' },
          onUploadProgress: (progressEvent) => {
            if (progressEvent.total) {
                this.uploadProgress = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            }
          }
        });
        await this.fetchFiles(this.currentPath);
      } catch (err: any) {
        alert(err.response?.data?.error || 'Error al subir archivos');
      } finally {
        setTimeout(() => {
          this.isUploading = false;
          this.uploadProgress = 0;
        }, 1000); // Dar un segundo para ver el 100%
      }
    },

    async renameItem(oldName: string, newName: string) {
      try {
        await axios.post('/api/files/rename', { oldName, newName, path: this.currentPath });
        await this.fetchFiles(this.currentPath);
      } catch (err: any) {
        alert(err.response?.data?.error || 'Error al renombrar');
      }
    }
  }
});
