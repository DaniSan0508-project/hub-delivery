import api from './api';

// Serviço para pedidos
class OrderService {
    async getOrders(token) {
        console.log('OrderService.getOrders called with token:', token);
        // Usar a rota com /erp para buscar pedidos
        const result = await api.get('http://localhost:8090/api/erp/orders', token);
        console.log('OrderService.getOrders result:', result);
        return result;
    }

    async getOrderDetails(orderId, token) {
        // Usar a rota com /erp e query parameter para buscar detalhes do pedido
        console.log('OrderService.getOrderDetails called with orderId:', orderId);
        const url = `http://localhost:8090/api/erp/orders?order_id=${orderId}`;
        console.log('OrderService.getOrderDetails calling URL:', url);
        const result = await api.get(url, token);
        console.log('OrderService.getOrderDetails result:', result);
        return result;
    }

    async updateOrderStatus(orderId, status, token) {
        // Usar a rota sem /erp para atualizar status
        return await api.put(`http://localhost:8090/api/orders/${orderId}/status`, { status }, token);
    }

    async startSeparation(orderId, token) {
        // Usar a rota sem /erp para iniciar separação
        return await api.post(`http://localhost:8090/api/orders/${orderId}/start-separation`, {}, token);
    }

    async dispatchOrder(orderId, token) {
        // Usar a rota sem /erp para despachar o pedido
        return await api.post(`http://localhost:8090/api/orders/${orderId}/dispatch`, {}, token);
    }

    async confirmOrder(orderId, token) {
        // Nova rota para confirmar o pedido
        return await api.post(`http://localhost:8090/api/orders/${orderId}/confirm`, {}, token);
    }

    async dispatchOrderToIfood(orderId, token) {
        // Nova rota para despachar o pedido para o iFood
        return await api.post(`http://localhost:8090/api/orders/${orderId}/dispatch-to-ifood`, {}, token);
    }

    async endSeparation(orderId, token) {
        // Usar a rota sem /erp para finalizar separação
        return await api.post(`http://localhost:8090/api/orders/${orderId}/end-separation`, {}, token);
    }

    async requestIfoodDriver(orderId, token) {
        // Nova rota para solicitar entregador iFood parceiro
        return await api.post(`http://localhost:8090/api/orders/${orderId}/request-ifood-driver`, {}, token);
    }

    async cancelOrder(orderId, token) {
        const reasonData = { reason: "Cancelado pelo cliente" };
        return await api.post(`http://localhost:8090/api/orders/${orderId}/cancel-order`, reasonData, token);
    }

    async addOrderItem(orderId, itemData, token) {
        // Usar a nova rota para adicionar item ao pedido
        return await api.post(`http://localhost:8090/api/orders/${orderId}/items`, itemData, token);
    }

    async updateOrderItem(orderId, itemId, itemData, token) {
        // Usar a rota sem /erp para atualizar item
        return await api.put(`http://localhost:8090/api/orders/${orderId}/items/${itemId}`, itemData, token);
    }

    async deleteOrderItem(orderId, itemId, token) {
        // Usar a rota sem /erp para deletar item
        return await api.delete(`http://localhost:8090/api/orders/${orderId}/items/${itemId}`, token);
    }
}

export default new OrderService();