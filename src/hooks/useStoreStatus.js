import { useState, useEffect } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import api from '../services/api';

// Hook para gerenciar o status da loja
export const useStoreStatus = () => {
    const queryClient = useQueryClient();
    
    const fetchStoreStatus = async () => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            return null;
        }

        try {
            const response = await fetch('http://localhost:8090/api/hub/ifood/merchant/status', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data && data.data.state === 'OK') {
                    return 'OPEN';
                } else {
                    return 'CLOSED';
                }
            } else {
                return null;
            }
        } catch (error) {
            console.error('Error fetching store status:', error);
            return null;
        }
    };

    const { data: storeStatus, isLoading: loadingStatus, refetch } = useQuery({
        queryKey: ['storeStatus'],
        queryFn: fetchStoreStatus,
        staleTime: 1000 * 60 * 2, // 2 minutes
        cacheTime: 1000 * 60 * 5, // 5 minutes
        refetchInterval: 1000 * 60 * 2, // 2 minutes
        retry: 1,
        refetchOnWindowFocus: false,
    });

    const getStatusColor = (status) => {
        if (status === 'OPEN') return '#4caf50';
        if (status === 'CLOSED') return '#f44336';
        return '#9e9e9e';
    };

    const getStatusText = (status) => {
        if (status === 'OPEN') return 'Ativa';
        if (status === 'CLOSED') return 'Inativa';
        return 'Status desconhecido';
    };

    return {
        storeStatus,
        loadingStatus,
        fetchStoreStatus: refetch,
        getStatusColor,
        getStatusText
    };
};