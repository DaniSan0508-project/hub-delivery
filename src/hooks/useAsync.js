import { useState, useEffect } from 'react';

export const useAsync = (asyncFunction, immediate = true) => {
    const [pending, setPending] = useState(false);
    const [value, setValue] = useState(null);
    const [error, setError] = useState(null);

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

    useEffect(() => {
        if (immediate) {
            execute();
        }
    }, [immediate]);

    return { pending, value, error, execute };
};