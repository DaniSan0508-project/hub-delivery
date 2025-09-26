import api from './api';

class OrderService {
    async getOrders(token) {
        console.log('OrderService.getOrders called with token:', token);
        const result = await api.get('http://localhost:8090/api/erp/orders', token);
        console.log('OrderService.getOrders result:', result);
        return result;
    }

    async getOrderDetails(orderId, token) {
        console.log('OrderService.getOrderDetails called with orderId:', orderId);
        const url = `http://localhost:8090/api/erp/orders?order_id=${orderId}`;
        console.log('OrderService.getOrderDetails calling URL:', url);
        const result = await api.get(url, token);
        console.log('OrderService.getOrderDetails result:', result);
        return result;
    }

    async updateOrderStatus(orderId, status, token) {
        return await api.put(`http://localhost:8090/api/orders/${orderId}/status`, { status }, token);
    }

    async startSeparation(orderId, token) {
        return await api.post(`http://localhost:8090/api/orders/${orderId}/start-separation`, {}, token);
    }

    async dispatchOrder(orderId, token) {
        return await api.post(`http://localhost:8090/api/orders/${orderId}/dispatch`, {}, token);
    }

    async confirmOrder(orderId, token) {
        return await api.post(`http://localhost:8090/api/orders/${orderId}/confirm`, {}, token);
    }

    async dispatchOrderToIfood(orderId, token) {
        return await api.post(`http://localhost:8090/api/orders/${orderId}/dispatch-to-ifood`, {}, token);
    }

    async endSeparation(orderId, token) {
        return await api.post(`http://localhost:8090/api/orders/${orderId}/end-separation`, {}, token);
    }

    async requestIfoodDriver(orderId, token) {
        return await api.post(`http://localhost:8090/api/orders/${orderId}/request-ifood-driver`, {}, token);
    }

    async cancelOrder(orderId, token) {
        const reasonData = { reason: "Cancelado pelo cliente" };
        return await api.post(`http://localhost:8090/api/orders/${orderId}/cancel-order`, reasonData, token);
    }

    async addOrderItem(orderId, itemData, token) {
        return await api.post(`http://localhost:8090/api/orders/${orderId}/items`, itemData, token);
    }

    async updateOrderItem(orderId, itemId, itemData, token) {
        return await api.put(`http://localhost:8090/api/orders/${orderId}/items/${itemId}`, itemData, token);
    }

    async deleteOrderItem(orderId, itemId, token) {
        return await api.delete(`http://localhost:8090/api/orders/${orderId}/items/${itemId}`, token);
    }
}

export default new OrderService();