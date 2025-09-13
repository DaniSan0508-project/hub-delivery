import api from './api';

// Serviço para gerenciamento de compras
class PurchaseService {
    async getProducts(token) {
        return await api.get(`${api.baseERPUrl}/products`, token);
    }

    async addProductToPurchase(orderId, productData, token) {
        return await api.post(`${api.baseERPUrl}/orders/${orderId}/purchases`, productData, token);
    }
}

export default new PurchaseService();