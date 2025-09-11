import { createContext, useContext, useState, useEffect, useRef } from 'react';

const StoreStatusContext = createContext();

// Singleton para gerenciar o status da loja
let storeStatusManager = null;

class StoreStatusManager {
    constructor() {
        if (storeStatusManager) {
            return storeStatusManager;
        }
        
        this.listeners = new Set();
        this.storeStatus = null;
        this.loadingStatus = false;
        this.intervalId = null;
        this.isFetching = false;
        this.fetchPromise = null; // Para evitar chamadas simultâneas
        
        storeStatusManager = this;
        return this;
    }
    
    subscribe(listener) {
        this.listeners.add(listener);
        // Envia o status atual para o novo listener
        listener({ storeStatus: this.storeStatus, loadingStatus: this.loadingStatus });
    }
    
    unsubscribe(listener) {
        this.listeners.delete(listener);
        // Parar o polling quando não houver mais listeners
        if (this.listeners.size === 0) {
            this.stopPolling();
        }
    }
    
    notifyListeners() {
        this.listeners.forEach(listener => {
            listener({ storeStatus: this.storeStatus, loadingStatus: this.loadingStatus });
        });
    }
    
    async fetchStoreStatus() {
        // Se já temos uma chamada em andamento, retornamos a mesma promise
        if (this.fetchPromise) {
            return this.fetchPromise;
        }
        
        // Criar nova promise para esta chamada
        this.fetchPromise = this._doFetchStoreStatus()
            .finally(() => {
                // Limpar a promise quando a chamada terminar
                this.fetchPromise = null;
            });
        
        return this.fetchPromise;
    }
    
    async _doFetchStoreStatus() {
        // Evitar chamadas simultâneas
        if (this.isFetching) {
            return;
        }
        
        try {
            this.isFetching = true;
            this.loadingStatus = true;
            this.notifyListeners();
            
            const token = localStorage.getItem('authToken');
            if (!token) {
                this.storeStatus = null;
                return;
            }
            
            const response = await fetch('http://localhost:8090/api/hub/ifood/merchant/status', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            
            if (response.ok) {
                const data = await response.json();
                // Based on the API response you provided, we need to check data.data.state
                if (data.data && data.data.state === 'OK') {
                    this.storeStatus = 'OPEN';
                } else {
                    this.storeStatus = 'CLOSED';
                }
            } else {
                // Em caso de erro, manter o status anterior ou definir como desconhecido
                if (!this.storeStatus) {
                    this.storeStatus = null; // Indisponível
                }
            }
        } catch (error) {
            console.error('Error fetching store status:', error);
            // Em caso de erro, manter o status anterior ou definir como desconhecido
            if (!this.storeStatus) {
                this.storeStatus = null; // Indisponível
            }
        } finally {
            this.isFetching = false;
            this.loadingStatus = false;
            this.notifyListeners();
        }
    }
    
    startPolling() {
        // Não iniciar polling se já estiver rodando
        if (this.intervalId) {
            return;
        }
        
        // Fetch initial status imediatamente
        this.fetchStoreStatus();
        
        // Set up interval for periodic updates (2 minutes)
        this.intervalId = setInterval(() => {
            this.fetchStoreStatus();
        }, 120000);
    }
    
    stopPolling() {
        if (this.intervalId) {
            clearInterval(this.intervalId);
            this.intervalId = null;
        }
    }
    
    getStatusColor(status) {
        if (status === 'OPEN') return '#4caf50'; // green
        if (status === 'CLOSED') return '#f44336'; // red
        return '#9e9e9e'; // grey
    }
    
    getStatusText(status) {
        if (status === 'OPEN') return 'Ativa';
        if (status === 'CLOSED') return 'Inativa';
        return 'Status desconhecido';
    }
}

export function StoreStatusProvider({ children }) {
    const [storeStatus, setStoreStatus] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(false);
    const managerRef = useRef(null);
    const isMountedRef = useRef(true);
    
    useEffect(() => {
        // Criar ou obter o singleton manager
        if (!managerRef.current) {
            managerRef.current = new StoreStatusManager();
        }
        
        const manager = managerRef.current;
        
        // Listener para atualizar o estado do componente
        const listener = ({ storeStatus, loadingStatus }) => {
            // Apenas atualizar se o componente ainda estiver montado
            if (isMountedRef.current) {
                setStoreStatus(storeStatus);
                setLoadingStatus(loadingStatus);
            }
        };
        
        // Subscrever ao manager
        manager.subscribe(listener);
        
        // Iniciar o polling se não estiver rodando
        if (!manager.intervalId) {
            manager.startPolling();
        }
        
        // Cleanup
        return () => {
            isMountedRef.current = false;
            manager.unsubscribe(listener);
        };
    }, []);
    
    const fetchStoreStatus = () => {
        if (managerRef.current && isMountedRef.current) {
            managerRef.current.fetchStoreStatus();
        }
    };
    
    const getStatusColor = (status) => {
        if (managerRef.current) {
            return managerRef.current.getStatusColor(status);
        }
        return '#9e9e9e';
    };
    
    const getStatusText = (status) => {
        if (managerRef.current) {
            return managerRef.current.getStatusText(status);
        }
        return 'Status desconhecido';
    };
    
    return (
        <StoreStatusContext.Provider value={{ 
            storeStatus, 
            loadingStatus, 
            fetchStoreStatus,
            getStatusColor,
            getStatusText
        }}>
            {children}
        </StoreStatusContext.Provider>
    );
}

export function useStoreStatus() {
    const context = useContext(StoreStatusContext);
    if (!context) {
        throw new Error('useStoreStatus must be used within a StoreStatusProvider');
    }
    return context;
}