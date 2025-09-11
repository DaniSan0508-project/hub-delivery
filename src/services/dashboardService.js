import api from './api';

// Serviço para dashboard
class DashboardService {
    async getMerchantData(token) {
        return await api.get(`${api.baseHubUrl}/merchant`, token);
    }

    async getOrders(token) {
        return await api.get(`${api.baseERPUrl}/orders`, token);
    }

    async getOpeningHours(token) {
        return await api.get(`${api.baseHubUrl}/merchant/opening-hours`, token);
    }

    async getInterruptions(token) {
        return await api.get(`${api.baseHubUrl}/merchant/interruptions`, token);
    }
}

export default new DashboardService();