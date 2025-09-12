import api from './api';

// Serviço para promoções
class PromotionService {
    async getPromotions(token) {
        // Removendo offset e limit já que a API não suporta
        const response = await api.get(`${api.baseERPUrl}/promotions`, token);
        return response;
    }

    async getPromotionById(aggregationId, token) {
        const response = await api.get(`${api.baseERPUrl}/promotions/${aggregationId}/items`, token);
        return response;
    }

    async createPromotion(promotionData, token) {
        const response = await api.post(`${api.baseERPUrl}/promotions/sync`, promotionData, token);
        return response;
    }
}

export default new PromotionService();