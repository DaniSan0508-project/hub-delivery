import api from './api';

class PurchaseService {
    async getProducts(token, search = '') {
        let url = `${api.baseERPUrl}/items?page=1&limit=100&sort=name&order=asc`;
        if (search) {
            url += `&search=${encodeURIComponent(search)}`;
        }
        return await api.get(url, token);
    }
}

export default new PurchaseService();