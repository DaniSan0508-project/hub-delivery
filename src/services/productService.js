import api from './api';

// Serviço para produtos
class ProductService {
    async getProducts(token) {
        return await api.get(`${api.baseERPUrl}/products`, token);
    }

    async syncProducts(products, token) {
        return await api.post(`${api.baseERPUrl}/products/sync`, { products }, token);
    }

    async getSyncStatus(token) {
        return await api.get(`${api.baseERPUrl}/sync/status`, token);
    }
}

export default new ProductService();