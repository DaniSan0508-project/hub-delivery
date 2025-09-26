import api from './api';

class CatalogService {
    async getCatalogs(token) {
        console.log('CatalogService.getCatalogs called with token:', token);
        const result = await api.get('http://localhost:8090/api/hub/ifood/items/catalogs', token);
        console.log('CatalogService.getCatalogs result:', result);
        return result;
    }

    async getCatalogItems(groupId, token) {
        console.log('CatalogService.getCatalogItems called with groupId:', groupId);
        const result = await api.get(`http://localhost:8090/api/hub/ifood/items?groupId=${groupId}`, token);
        console.log('CatalogService.getCatalogItems result:', result);
        return result;
    }
}

export default new CatalogService();