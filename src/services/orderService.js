import api from './api';

// Serviço para pedidos
class OrderService {
    async getOrders(token) {
        return await api.get(`${api.baseERPUrl}/orders`, token);
    }

    async updateOrderStatus(orderId, status, token) {
        return await api.put(`${api.baseERPUrl}/orders/${orderId}/status`, { status }, token);
    }

    async startSeparation(orderId, token) {
        return await api.post(`${api.baseERPUrl}/orders/${orderId}/start-separation`, {}, token);
    }

    async endSeparation(orderId, token) {
        return await api.post(`${api.baseERPUrl}/orders/${orderId}/end-separation`, {}, token);
    }
}

export default new OrderService();