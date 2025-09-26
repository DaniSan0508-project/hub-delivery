import api from './api';

class StoreService {
    async getMerchantStatus(token) {
        return await api.get(`${api.baseHubUrl}/merchant/status`, token);
    }

    async updateStoreStatus(status, token) {
        return await api.put(`${api.baseHubUrl}/merchant/status`, { status }, token);
    }

    async getOpeningHours(token) {
        return await api.get(`${api.baseHubUrl}/merchant/opening-hours`, token);
    }

    async updateOpeningHours(shifts, token) {
        return await api.put(`${api.baseHubUrl}/merchant/opening-hours`, { shifts }, token);
    }

    async getInterruptions(token) {
        return await api.get(`${api.baseHubUrl}/merchant/interruptions`, token);
    }

    async createInterruption(interruptionData, token) {
        return await api.post(`${api.baseHubUrl}/merchant/interruptions`, interruptionData, token);
    }

    async deleteInterruption(id, token) {
        return await api.delete(`${api.baseHubUrl}/merchant/interruptions/${id}`, token);
    }
}

export default new StoreService();