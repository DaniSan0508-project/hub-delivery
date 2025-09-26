import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export const useAuth = () => {
    const navigate = useNavigate();
    const [showTokenExpired, setShowTokenExpired] = useState(false);

    const isAuthenticated = () => {
        return !!localStorage.getItem('authToken');
    };

    const handleTokenExpired = () => {
        setShowTokenExpired(true);
        
        localStorage.removeItem('authToken');
        
        setTimeout(() => {
            navigate('/');
        }, 3000); // 3 segundos para o usuário ler a mensagem
    };

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