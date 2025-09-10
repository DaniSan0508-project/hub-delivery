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
    CircularProgress,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogContentText,
    DialogActions
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from './Sidebar';

const drawerWidth = 240;

function Pedidos() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, orderId: null, action: null, actionLabel: '' });

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
                    status: order.order.status || 'CONFIRMED', // Default to 'CONFIRMED' if status is not provided
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

    const updateOrderStatus = async (orderId, status) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:8090/api/orders/${orderId}/status`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status })
            });

            if (response.ok) {
                // Refresh orders after status update
                fetchOrders(token);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Erro ao atualizar status do pedido');
            }
        } catch (error) {
            console.error('Error updating order status:', error);
            setError('Erro de conexão. Por favor, tente novamente.');
        }
    };

    const startSeparation = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:8090/api/orders/${orderId}/start-separation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Refresh orders after starting separation
                fetchOrders(token);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Erro ao iniciar separação do pedido');
            }
        } catch (error) {
            console.error('Error starting separation:', error);
            setError('Erro de conexão. Por favor, tente novamente.');
        }
    };

    const endSeparation = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:8090/api/orders/${orderId}/end-separation`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                // Refresh orders after ending separation
                fetchOrders(token);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Erro ao finalizar separação do pedido');
            }
        } catch (error) {
            console.error('Error ending separation:', error);
            setError('Erro de conexão. Por favor, tente novamente.');
        }
    };

    const handleActionClick = (orderId, action, actionLabel) => {
        setConfirmDialog({ open: true, orderId, action, actionLabel });
    };

    const handleConfirmAction = async () => {
        const { orderId, action } = confirmDialog;
        setConfirmDialog({ open: false, orderId: null, action: null, actionLabel: '' });

        switch (action) {
            case 'startSeparation':
                await startSeparation(orderId);
                break;
            case 'endSeparation':
                await endSeparation(orderId);
                break;
            case 'dispatch':
                await updateOrderStatus(orderId, 'DISPATCHED');
                break;
            case 'confirm':
                await updateOrderStatus(orderId, 'CONFIRMED');
                break;
            default:
                break;
        }
    };

    const handleCloseDialog = () => {
        setConfirmDialog({ open: false, orderId: null, action: null, actionLabel: '' });
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Placed':
                return 'info';
            case 'Confirmed':
                return 'success';
            case 'SPS':
                return 'warning';
            case 'SPE':
                return 'info';
            case 'Dispatched':
                return 'default';
            case 'Concluded':
                return 'default';
            default:
                return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Placed':
                return 'Recebido';
            case 'Confirmed':
                return 'Confirmado';
            case 'SPS':
                return 'Separação iniciada';
            case 'SPE':
                return 'Separação finalizada';
            case 'Dispatched':
                return 'Despachado';
            case 'Concluded':
                return 'Concluído';
            default:
                return status;
        }
    };

    const getAvailableActions = (status) => {
        switch (status) {
            case 'Placed':
                return [{ action: 'confirm', label: 'Confirmar Pedido', color: 'primary' }];
            case 'Confirmed':
                return [{ action: 'startSeparation', label: 'Iniciar Separação', color: 'primary' }];
            case 'SPS':
                return [{ action: 'endSeparation', label: 'Finalizar Separação', color: 'secondary' }];
            case 'SPE':
                return [{ action: 'dispatch', label: 'Despachar', color: 'success' }];
            default:
                return [];
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
                    <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
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
                                            orders.map((order) => {
                                                const actions = getAvailableActions(order.status);
                                                return (
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
                                                            {actions.length > 0 ? (
                                                                actions.map((action, index) => (
                                                                    <Button
                                                                        key={index}
                                                                        size="small"
                                                                        variant="contained"
                                                                        color={action.color}
                                                                        onClick={() => handleActionClick(order.id, action.action, action.label)}
                                                                        sx={{ ml: index > 0 ? 1 : 0 }}
                                                                    >
                                                                        {action.label}
                                                                    </Button>
                                                                ))
                                                            ) : (
                                                                <Button size="small" variant="outlined" disabled>
                                                                    Nenhuma ação disponível
                                                                </Button>
                                                            )}
                                                        </TableCell>
                                                    </TableRow>
                                                );
                                            })
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

                {/* Confirmation Dialog */}
                <Dialog open={confirmDialog.open} onClose={handleCloseDialog}>
                    <DialogTitle>Confirmar Ação</DialogTitle>
                    <DialogContent>
                        <DialogContentText>
                            Tem certeza que deseja {confirmDialog.actionLabel?.toLowerCase()} este pedido?
                        </DialogContentText>
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={handleCloseDialog} color="primary">
                            Cancelar
                        </Button>
                        <Button onClick={handleConfirmAction} color="primary" variant="contained">
                            Confirmar
                        </Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box>
    );
}

export default Pedidos;