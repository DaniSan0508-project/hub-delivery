import api from './api';

// Serviço para pedidos
class OrderService {
    async getOrders(token) {
        // Usar baseERPUrl que já inclui /api/erp
        return await api.get(`${api.baseERPUrl}/orders`, token);
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
}

export default new OrderService();