// Serviço base para chamadas à API
class ApiService {
    constructor() {
        this.baseERPUrl = 'http://localhost:8090/api/erp';
        this.baseHubUrl = 'http://localhost:8090/api/hub/ifood';
    }

    // Método para obter headers de autenticação
    getAuthHeaders(token) {
        return {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
        };
    }

    // Método genérico para chamadas GET
    async get(url, token = null) {
        const headers = token ? this.getAuthHeaders(token) : {};
        
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    // Método genérico para chamadas POST
    async post(url, data, token = null) {
        const headers = token ? this.getAuthHeaders(token) : {
            'Content-Type': 'application/json'
        };
        
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    // Método genérico para chamadas PUT
    async put(url, data, token = null) {
        const headers = token ? this.getAuthHeaders(token) : {
            'Content-Type': 'application/json'
        };
        
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    // Método genérico para chamadas DELETE
    async delete(url, token = null) {
        const headers = token ? this.getAuthHeaders(token) : {};
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers
        });
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }
}

export default new ApiService();