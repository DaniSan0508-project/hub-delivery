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
    LocalPharmacy as LocalPharmacyIcon,
    Sync as SyncIcon,
    Store as StoreIcon,
    LocalOffer as LocalOfferIcon
} from '@mui/icons-material';
import { useStoreStatus } from '../hooks/useStoreStatus';

const drawerWidth = 240;

function Sidebar({ mobileOpen, handleDrawerToggle }) {
    const navigate = useNavigate();
    const location = useLocation();
    const { storeStatus, loadingStatus, getStatusColor, getStatusText } = useStoreStatus();

    const menuItems = [
        { text: 'Inicio', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Pedidos', icon: <LocalPharmacyIcon />, path: '/pedidos' },
        { text: 'Sync Produtos', icon: <SyncIcon />, path: '/sincronizacao' },
        { text: 'Loja', icon: <StoreIcon />, path: '/loja' },
        { text: 'Promoções', icon: <LocalOfferIcon />, path: '/promocoes' },
    ];

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