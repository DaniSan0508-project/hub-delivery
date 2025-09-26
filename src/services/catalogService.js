import api from './api';

class CatalogService {
    async getCatalogs(token) {
        const result = await api.get('http://localhost:8090/api/hub/ifood/items/catalogs', token);
        return result;
    }

    async getCatalogItems(groupId, token) {
        const result = await api.get(`http://localhost:8090/api/hub/ifood/items?groupId=${groupId}`, token);
        return result;
    }
}

export default new CatalogService();