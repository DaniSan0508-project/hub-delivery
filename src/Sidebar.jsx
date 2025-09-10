import { useState, useEffect } from 'react';
import {
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    Toolbar,
    Box,
    Typography,
    CircularProgress
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Dashboard as DashboardIcon,
    Restaurant as RestaurantIcon,
    Sync as SyncIcon,
    Store as StoreIcon,
    Category as CategoryIcon
} from '@mui/icons-material';

const drawerWidth = 240;

function Sidebar({ mobileOpen, handleDrawerToggle }) {
    const navigate = useNavigate();
    const location = useLocation();
    const [storeStatus, setStoreStatus] = useState(null);
    const [loadingStatus, setLoadingStatus] = useState(false);

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Sincronização', icon: <SyncIcon />, path: '/sincronizacao' },
        { text: 'Catálogo', icon: <CategoryIcon />, path: '/catalogo' },
        { text: 'Pedidos', icon: <RestaurantIcon />, path: '/pedidos' },
        { text: 'Loja', icon: <StoreIcon />, path: '/loja' },
    ];

    // Fetch store status
    useEffect(() => {
        const fetchStoreStatus = async () => {
            try {
                setLoadingStatus(true);
                const token = localStorage.getItem('authToken');
                if (!token) return;

                const response = await fetch('http://localhost:8090/api/hub/ifood/merchant/status', {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (response.ok) {
                    const data = await response.json();
                    // Based on the API response you provided, we need to check data.data.state
                    if (data.data && data.data.state === 'OK') {
                        setStoreStatus('OPEN');
                    } else {
                        setStoreStatus('CLOSED');
                    }
                }
            } catch (error) {
                console.error('Error fetching store status:', error);
            } finally {
                setLoadingStatus(false);
            }
        };

        fetchStoreStatus();

        // Refresh status every 30 seconds
        const interval = setInterval(fetchStoreStatus, 120000);
        return () => clearInterval(interval);
    }, []);

    const getStatusColor = (status) => {
        if (status === 'OPEN') return '#4caf50'; // green
        if (status === 'CLOSED') return '#f44336'; // red
        return '#9e9e9e'; // grey
    };

    const getStatusText = (status) => {
        if (status === 'OPEN') return 'Ativa';
        if (status === 'CLOSED') return 'Inativa';
        return 'Status desconhecido';
    };

    return (
        <>
            <Toolbar />
            <List>
                {menuItems.map((item) => (
                    <ListItem
                        button
                        key={item.text}
                        onClick={() => {
                            navigate(item.path);
                            if (mobileOpen) handleDrawerToggle();
                        }}
                        selected={location.pathname === item.path}
                    >
                        <ListItemIcon>
                            {item.icon}
                        </ListItemIcon>
                        <ListItemText primary={item.text} />
                    </ListItem>
                ))}
            </List>
            <Box sx={{ flexGrow: 1 }} />
            <Divider />
            <Box sx={{ p: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                    Status da Loja
                </Typography>
                {loadingStatus ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <CircularProgress size={20} sx={{ mr: 1 }} />
                        <Typography variant="body2">Carregando...</Typography>
                    </Box>
                ) : storeStatus ? (
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box
                            sx={{
                                width: 12,
                                height: 12,
                                borderRadius: '50%',
                                bgcolor: getStatusColor(storeStatus),
                                mr: 1,
                                boxShadow: `0 0 4px 2px ${getStatusColor(storeStatus)}`
                            }}
                        />
                        <Typography variant="body2">
                            {getStatusText(storeStatus)}
                        </Typography>
                    </Box>
                ) : (
                    <Typography variant="body2" color="textSecondary">
                        Indisponível
                    </Typography>
                )}
            </Box>
        </>
    );
}

export default Sidebar;