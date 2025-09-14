// Serviço base para chamadas à API
class ApiService {
    constructor() {
        this.baseERPUrl = 'http://localhost:8090/api/erp';
        this.baseHubUrl = 'http://localhost:8090/api/hub/ifood';
    }

    // Método para obter headers de autenticação
    getAuthHeaders(token) {
        const headers = {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
        console.log('Auth headers created:', headers);
        return headers;
    }

    // Método genérico para chamadas GET
    async get(url, token = null) {
        const headers = token ? this.getAuthHeaders(token) : {};
        
        const response = await fetch(url, {
            method: 'GET',
            headers
        });
        
        // Verificar se o token expirou
        if (response.status === 401) {
            this.handleTokenExpiration();
            throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        if (!response.ok) {
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
        }
        
        return await response.json();
    }

    // Método genérico para chamadas POST
    async post(url, data, token = null) {
        const headers = token ? { ...this.getAuthHeaders(token) } : {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
        
        console.log('Making POST request to:', url);
        console.log('Headers:', headers);
        console.log('Data:', data);
        
        const response = await fetch(url, {
            method: 'POST',
            headers,
            body: JSON.stringify(data)
        });
        
        console.log('Response status:', response.status);
        console.log('Response headers:', [...response.headers.entries()]);
        console.log('Response redirect url (if any):', response.redirected ? response.url : 'Not redirected');
        
        // Verificar se houve redirecionamento (possível token expirado)
        if (response.redirected && response.url.includes('login')) {
            console.log('Request was redirected to login page - token may be expired');
            this.handleTokenExpiration();
            throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        // Verificar se o token expirou
        if (response.status === 401) {
            console.log('Received 401 Unauthorized - token may be invalid or expired');
            this.handleTokenExpiration();
            throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        if (!response.ok) {
            // Tentar obter a mensagem de erro da resposta
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                console.log('Error response data:', errorData);
                if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (jsonError) {
                console.log('Could not parse error response as JSON:', jsonError);
                // Usar o texto da resposta se não for JSON válido
                try {
                    const errorText = await response.text();
                    if (errorText) {
                        errorMessage = errorText;
                    }
                } catch (textError) {
                    console.log('Could not parse error response as text:', textError);
                }
            }
            
            // Lançar o erro apropriado com base no status
            switch (response.status) {
                case 409:
                    throw new Error(errorMessage || 'Conflito: Não foi possível processar a requisição devido a um conflito.');
                case 400:
                    throw new Error(errorMessage || 'Requisição inválida. Verifique os dados e tente novamente.');
                case 500:
                    throw new Error(errorMessage || 'Erro interno do servidor. Tente novamente mais tarde.');
                default:
                    throw new Error(errorMessage);
            }
        }
        
        return await response.json();
    }

    // Método genérico para chamadas PUT
    async put(url, data, token = null) {
        const headers = token ? { ...this.getAuthHeaders(token) } : {
            'Content-Type': 'application/json',
            'X-Requested-With': 'XMLHttpRequest'
        };
        
        const response = await fetch(url, {
            method: 'PUT',
            headers,
            body: JSON.stringify(data)
        });
        
        // Verificar se houve redirecionamento (possível token expirado)
        if (response.redirected && response.url.includes('login')) {
            console.log('Request was redirected to login page - token may be expired');
            this.handleTokenExpiration();
            throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        // Verificar se o token expirou
        if (response.status === 401) {
            console.log('Received 401 Unauthorized - token may be invalid or expired');
            this.handleTokenExpiration();
            throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        if (!response.ok) {
            // Tentar obter a mensagem de erro da resposta
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                console.log('Error response data:', errorData);
                if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (jsonError) {
                console.log('Could not parse error response as JSON:', jsonError);
                // Usar o texto da resposta se não for JSON válido
                try {
                    const errorText = await response.text();
                    if (errorText) {
                        errorMessage = errorText;
                    }
                } catch (textError) {
                    console.log('Could not parse error response as text:', textError);
                }
            }
            
            // Lançar o erro apropriado com base no status
            switch (response.status) {
                case 409:
                    throw new Error(errorMessage || 'Conflito: Não foi possível processar a requisição devido a um conflito.');
                case 400:
                    throw new Error(errorMessage || 'Requisição inválida. Verifique os dados e tente novamente.');
                case 500:
                    throw new Error(errorMessage || 'Erro interno do servidor. Tente novamente mais tarde.');
                default:
                    throw new Error(errorMessage);
            }
        }
        
        return await response.json();
    }

    // Método genérico para chamadas DELETE
    async delete(url, token = null) {
        const headers = token ? { ...this.getAuthHeaders(token) } : {
            'X-Requested-With': 'XMLHttpRequest'
        };
        
        const response = await fetch(url, {
            method: 'DELETE',
            headers
        });
        
        // Verificar se houve redirecionamento (possível token expirado)
        if (response.redirected && response.url.includes('login')) {
            console.log('Request was redirected to login page - token may be expired');
            this.handleTokenExpiration();
            throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        // Verificar se o token expirou
        if (response.status === 401) {
            console.log('Received 401 Unauthorized - token may be invalid or expired');
            this.handleTokenExpiration();
            throw new Error('Sessão expirada. Faça login novamente.');
        }
        
        if (!response.ok) {
            // Tentar obter a mensagem de erro da resposta
            let errorMessage = `HTTP error! status: ${response.status}`;
            try {
                const errorData = await response.json();
                console.log('Error response data:', errorData);
                if (errorData.error) {
                    errorMessage = errorData.error;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                }
            } catch (jsonError) {
                console.log('Could not parse error response as JSON:', jsonError);
                // Usar o texto da resposta se não for JSON válido
                try {
                    const errorText = await response.text();
                    if (errorText) {
                        errorMessage = errorText;
                    }
                } catch (textError) {
                    console.log('Could not parse error response as text:', textError);
                }
            }
            
            // Lançar o erro apropriado com base no status
            switch (response.status) {
                case 409:
                    throw new Error(errorMessage || 'Conflito: Não foi possível processar a requisição devido a um conflito.');
                case 400:
                    throw new Error(errorMessage || 'Requisição inválida. Verifique os dados e tente novamente.');
                case 500:
                    throw new Error(errorMessage || 'Erro interno do servidor. Tente novamente mais tarde.');
                default:
                    throw new Error(errorMessage);
            }
        }
        
        return await response.json();
    }

    // Método para lidar com token expirado
    handleTokenExpiration() {
        // Remover token do localStorage
        localStorage.removeItem('authToken');
        
        // Redirecionar para tela de login após um breve delay
        setTimeout(() => {
            if (typeof window !== 'undefined' && window.location) {
                window.location.href = '/';
            }
        }, 100);
    }
}

export default new ApiService();