import { createContext, useContext, useState, useEffect, useRef } from 'react';

const StoreStatusContext = createContext();

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
        listener({ storeStatus: this.storeStatus, loadingStatus: this.loadingStatus });
    }
    
    unsubscribe(listener) {
        this.listeners.delete(listener);
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
        if (this.fetchPromise) {
            return this.fetchPromise;
        }
        
        this.fetchPromise = this._doFetchStoreStatus()
            .finally(() => {
                this.fetchPromise = null;
            });
        
        return this.fetchPromise;
    }
    
    async _doFetchStoreStatus() {
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
                if (data.data && data.data.state === 'OK') {
                    this.storeStatus = 'OPEN';
                } else {
                    this.storeStatus = 'CLOSED';
                }
            } else {
                if (!this.storeStatus) {
                    this.storeStatus = null; // Indisponível
                }
            }
        } catch (error) {
            console.error('Error fetching store status:', error);
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
        if (this.intervalId) {
            return;
        }
        
        this.fetchStoreStatus();
        
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
        if (!managerRef.current) {
            managerRef.current = new StoreStatusManager();
        }
        
        const manager = managerRef.current;
        
        const listener = ({ storeStatus, loadingStatus }) => {
            if (isMountedRef.current) {
                setStoreStatus(storeStatus);
                setLoadingStatus(loadingStatus);
            }
        };
        
        manager.subscribe(listener);
        
        if (!manager.intervalId) {
            manager.startPolling();
        }
        
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