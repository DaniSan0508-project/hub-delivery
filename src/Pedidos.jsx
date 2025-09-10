import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Toolbar,
    Button,
    Paper,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Chip,
    Drawer,
    CssBaseline,
    AppBar,
    IconButton,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    CircularProgress,
    Alert
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Dashboard as DashboardIcon,
    Restaurant as RestaurantIcon,
    Sync as SyncIcon,
    Store as StoreIcon,
    Category as CategoryIcon,
    Menu as MenuIcon
} from '@mui/icons-material';

const drawerWidth = 240;

function Pedidos() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/');
        } else {
            // In a real app, you might want to decode the token to get user info
            setUser({ name: 'Usuário' });
            // Fetch orders from API
            fetchOrders(token);
        }
    }, [navigate]);

    const fetchOrders = async (token) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:8090/api/erp/orders', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                // Transform the API response to match our table structure
                const transformedOrders = data.orders.map(order => ({
                    id: order.order.id,
                    customer: order.consumer.name,
                    status: order.order.status || 'cfm', // Default to 'cfm' if status is not provided
                    total: order.order.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0),
                    createdAt: 'Horário não disponível' // API doesn't provide this yet
                }));
                setOrders(transformedOrders);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Erro ao carregar pedidos');
            }
        } catch (error) {
            console.error('Error fetching orders:', error);
            setError('Erro de conexão. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Sincronização', icon: <SyncIcon />, path: '/sincronizacao' },
        { text: 'Catálogo', icon: <CategoryIcon />, path: '/catalogo' },
        { text: 'Pedidos', icon: <RestaurantIcon />, path: '/pedidos' },
        { text: 'Loja', icon: <StoreIcon />, path: '/loja' },
    ];

    const getStatusColor = (status) => {
        switch (status) {
            case 'Confirmed':
                return 'success';
            case 'SPE':
                return 'warning';
            case 'Dispatched':
                return 'info';
            case 'CON':
                return 'default';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Confirmed':
                return 'Confirmado';
            case 'SPS':
                return 'Iniciando separação';
            case 'SPE':
                return 'Separação finalizada';
            case 'Dispatched':
                return 'Despachado';
            case 'CON':
                return 'Concluído';
            default:
                return status;
        }
    };

    if (!user) {
        return null; // or a loading spinner
    }

    return (
        <Box sx={{ display: 'flex' }}>
            <CssBaseline />
            <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
                <Toolbar>
                    <IconButton
                        color="inherit"
                        aria-label="open drawer"
                        edge="start"
                        onClick={handleDrawerToggle}
                        sx={{ mr: 2, display: { sm: 'none' } }}
                    >
                        <MenuIcon />
                    </IconButton>
                    <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
                        Portal iFood - Pedidos
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>Sair</Button>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
                aria-label="menu"
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true, // Better open performance on mobile.
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    <Toolbar />
                    <List>
                        {menuItems.map((item) => (
                            <ListItem
                                button
                                key={item.text}
                                onClick={() => {
                                    navigate(item.path);
                                    setMobileOpen(false);
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
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    <Toolbar />
                    <List>
                        {menuItems.map((item) => (
                            <ListItem
                                button
                                key={item.text}
                                onClick={() => navigate(item.path)}
                                selected={location.pathname === item.path}
                            >
                                <ListItemIcon>
                                    {item.icon}
                                </ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}
                    </List>
                </Drawer>
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                <Toolbar />
                <Container maxWidth="lg">
                    <Typography variant="h4" gutterBottom>
                        Pedidos
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">
                                Pedidos Recentes
                            </Typography>
                            <Button variant="contained" onClick={() => fetchOrders(localStorage.getItem('authToken'))}>
                                Atualizar
                            </Button>
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <TableContainer>
                                <Table>
                                    <TableHead>
                                        <TableRow>
                                            <TableCell>Nº Pedido</TableCell>
                                            <TableCell>Cliente</TableCell>
                                            <TableCell>Total</TableCell>
                                            <TableCell>Status</TableCell>
                                            <TableCell>Horário</TableCell>
                                            <TableCell>Ações</TableCell>
                                        </TableRow>
                                    </TableHead>
                                    <TableBody>
                                        {orders.length > 0 ? (
                                            orders.map((order) => (
                                                <TableRow key={order.id}>
                                                    <TableCell>#{order.id.substring(0, 8)}</TableCell>
                                                    <TableCell>{order.customer || 'Cliente não informado'}</TableCell>
                                                    <TableCell>
                                                        R$ {parseFloat(order.total).toFixed(2).replace('.', ',')}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Chip
                                                            label={getStatusText(order.status)}
                                                            color={getStatusColor(order.status)}
                                                            size="small"
                                                        />
                                                    </TableCell>
                                                    <TableCell>
                                                        {order.createdAt || 'Horário não informado'}
                                                    </TableCell>
                                                    <TableCell>
                                                        <Button size="small" variant="outlined">Ver</Button>
                                                    </TableCell>
                                                </TableRow>
                                            ))
                                        ) : (
                                            <TableRow>
                                                <TableCell colSpan={6} align="center">
                                                    Nenhum pedido encontrado
                                                </TableCell>
                                            </TableRow>
                                        )}
                                    </TableBody>
                                </Table>
                            </TableContainer>
                        )}
                    </Paper>
                </Container>
            </Box>
        </Box>
    );
}

export default Pedidos;