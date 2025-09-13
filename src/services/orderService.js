import api from './api';

// Serviço para pedidos
class OrderService {
    async getOrders(token) {
        console.log('OrderService.getOrders called with token:', token);
        // Usar baseERPUrl que já inclui /api/erp
        const result = await api.get(`${api.baseERPUrl}/orders`, token);
        console.log('OrderService.getOrders result:', result);
        return result;
    }

    async getOrderDetails(orderId, token) {
        return await api.get(`${api.baseERPUrl}/orders/${orderId}`, token);
    }

    async updateOrderStatus(orderId, status, token) {
        // Corrigir para usar o endpoint correto sem /erp adicional
        return await api.put(`http://localhost:8090/api/orders/${orderId}/status`, { status }, token);
    }

    async startSeparation(orderId, token) {
        // Corrigir para usar o endpoint correto sem /erp adicional
        return await api.post(`http://localhost:8090/api/orders/${orderId}/start-separation`, {}, token);
    }

    async endSeparation(orderId, token) {
        // Corrigir para usar o endpoint correto sem /erp adicional
        return await api.post(`http://localhost:8090/api/orders/${orderId}/end-separation`, {}, token);
    }

    async addOrderItem(orderId, itemData, token) {
        return await api.post(`${api.baseERPUrl}/orders/${orderId}/items`, itemData, token);
    }

    async updateOrderItem(orderId, itemId, itemData, token) {
        return await api.put(`${api.baseERPUrl}/orders/${orderId}/items/${itemId}`, itemData, token);
    }

    async deleteOrderItem(orderId, itemId, token) {
        return await api.delete(`${api.baseERPUrl}/orders/${orderId}/items/${itemId}`, token);
    }
}

export default new OrderService();