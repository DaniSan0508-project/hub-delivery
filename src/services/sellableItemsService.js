import api from './api';

class SellableItemsService {
    async getSellableItems(token) {
        try {
            const response = await api.get(`${api.baseHubUrl}/items`, token);
            return response.data?.items || [];
        } catch (error) {
            console.error('Error fetching sellable items:', error);
            throw error;
        }
    }
}

export default new SellableItemsService();