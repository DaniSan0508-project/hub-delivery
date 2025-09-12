import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Hook para gerenciar autenticação e token expirado
export const useAuth = () => {
    const navigate = useNavigate();
    const [showTokenExpired, setShowTokenExpired] = useState(false);

    // Verificar se o token existe no localStorage
    const isAuthenticated = () => {
        return !!localStorage.getItem('authToken');
    };

    // Lidar com token expirado
    const handleTokenExpired = () => {
        // Mostrar mensagem amigável
        setShowTokenExpired(true);
        
        // Remover token
        localStorage.removeItem('authToken');
        
        // Redirecionar após um delay para o usuário ver a mensagem
        setTimeout(() => {
            navigate('/');
        }, 3000); // 3 segundos para o usuário ler a mensagem
    };

    // Logout
    const logout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    return {
        isAuthenticated,
        handleTokenExpired,
        logout,
        showTokenExpired
    };
};