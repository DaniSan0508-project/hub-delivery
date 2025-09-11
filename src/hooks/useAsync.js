import { useState, useEffect } from 'react';

// Hook personalizado para gerenciar chamadas assíncronas
export const useAsync = (asyncFunction, immediate = true) => {
    const [pending, setPending] = useState(false);
    const [value, setValue] = useState(null);
    const [error, setError] = useState(null);

    // Função para executar a chamada assíncrona
    const execute = async (...params) => {
        try {
            setPending(true);
            setError(null);
            const response = await asyncFunction(...params);
            setValue(response);
            return response;
        } catch (err) {
            setError(err);
            throw err;
        } finally {
            setPending(false);
        }
    };

    // Executar imediatamente se solicitado
    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate]);

    return { pending, value, error, execute };
};