import api from './api';

// Serviço para autenticação
class AuthService {
    async login(cnpj, password, secretKey) {
        const loginData = {
            cnpj: cnpj.replace(/\D/g, ''),
            password,
            secret_key: secretKey
        };

        return await api.post(`${api.baseERPUrl}/login`, loginData);
    }
}

export default new AuthService();