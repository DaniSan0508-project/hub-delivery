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
    DialogActions,
    TablePagination,
    TextField,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    Grid,
    ToggleButton,
    ToggleButtonGroup
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Menu as MenuIcon, Visibility as VisibilityIcon, Search as SearchIcon } from '@mui/icons-material';
import Sidebar from '../../components/Sidebar';
import orderService from '../../services/orderService';
import OrderDetailsModal from '../../components/OrderDetailsModal';

const drawerWidth = 240;

function Pedidos() {
    const navigate = useNavigate();
    const [user, setUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [confirmDialog, setConfirmDialog] = useState({ open: false, orderId: null, action: null, actionLabel: '' });
    const [orderDetailsModal, setOrderDetailsModal] = useState({ open: false, orderId: null });
    const [completedActions, setCompletedActions] = useState(new Set()); // Track completed actions
    
    // Pagination states
    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);
    
    // Filter states
    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [sortBy, setSortBy] = useState('createdAt'); // Default sort by creation date
    const [sortOrder, setSortOrder] = useState('desc'); // Default descending (newest first)

    useEffect(() => {
        let isMounted = true;
        
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (!token) {
            if (isMounted) {
                navigate('/');
            }
        } else {
            // In a real app, you might want to decode the token to get user info
            if (isMounted) {
                setUser({ name: 'Usuário' });
                // Adicionar um pequeno atraso para evitar corrida com outras chamadas
                setTimeout(() => {
                    if (isMounted) {
                        fetchOrders(token);
                    }
                }, 150);
            }
        }
        
        return () => {
            isMounted = false;
        };
    }, [navigate]);

    const fetchOrders = async (token) => {
        try {
            setLoading(true);
            setError(null);
            console.log('Fetching orders with token:', token);

            const ordersData = await orderService.getOrders(token);
            console.log('Received orders data:', ordersData);
            
            // Verificar se ordersData existe
            if (!ordersData) {
                console.error('No orders data received');
                setOrders([]);
                return;
            }
            
            // Verificar se ordersData.data existe (nova estrutura da API)
            const ordersArray = ordersData.data || ordersData.orders || [];
            if (!Array.isArray(ordersArray)) {
                console.error('Invalid orders data structure:', ordersData);
                setOrders([]);
                return;
            }
            
            console.log('Number of orders received:', ordersArray.length);
            
            // Transform the API response to match our table structure
            const transformedOrders = ordersArray.map((order, index) => {
                console.log(`Processing order ${index}:`, order);
                
                // Verificar se a estrutura do pedido é válida
                if (!order || !order.order || !order.consumer) {
                    console.error(`Invalid order structure at index ${index}:`, order);
                    return null;
                }
                
                // Verificar se order.order.items existe
                const items = order.order.items || [];
                return {
                    id: order.order.id,
                    customer: order.consumer.name,
                    status: order.order.status || 'CONFIRMED', // Default to 'CONFIRMED' if status is not provided
                    total: items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0),
                    createdAt: 'Horário não disponível' // API doesn't provide this yet
                };
            }).filter(order => order !== null); // Remover pedidos inválidos
            
            console.log('Transformed orders:', transformedOrders);
            
            // Sort orders by creation date (newest first)
            const sortedOrders = [...transformedOrders].sort((a, b) => {
                // If createdAt is not available, we can't sort properly, so keep original order
                if (!a.createdAt || !b.createdAt) return 0;
                
                // Convert to Date objects for comparison
                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);
                
                // Sort descending (newest first)
                return dateB - dateA;
            });
            
            setOrders(sortedOrders);
            
            // Clear completed actions for orders that are no longer in the "Dispatched" status
            setCompletedActions(prev => {
                const updated = new Set(prev);
                transformedOrders.forEach(order => {
                    if (order.status !== 'Dispatched') {
                        updated.delete(order.id);
                    }
                });
                return updated;
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
            // Verificar se é um erro de token expirado
            if (error.message && error.message.includes('Sessão expirada')) {
                // O serviço já lidou com o redirecionamento
                return;
            }
            setError(error.message || 'Erro de conexão. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const handlePageChange = (event, newPage) => {
        setPage(newPage);
    };

    const handleRowsPerPageChange = (event) => {
        setRowsPerPage(parseInt(event.target.value, 10));
        setPage(0); // Reset to first page when changing rows per page
    };

    const handleSearchChange = (event) => {
        setSearchTerm(event.target.value);
        setPage(0); // Reset to first page when searching
    };

    const handleStatusFilterChange = (event) => {
        setStatusFilter(event.target.value);
        setPage(0); // Reset to first page when filtering
    };

    const handleSort = (column) => {
        if (sortBy === column) {
            setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
        } else {
            setSortBy(column);
            setSortOrder('asc');
        }
        setPage(0); // Reset to first page when sorting
    };

    // Filter and sort orders based on search term, status filter, and sorting
    const filteredAndSortedOrders = orders
        .filter(order => {
            // Apply search filter
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                // Search in order ID (both full ID and shortened version)
                const orderIdMatch = order.id.toLowerCase().includes(term) || 
                                   `#${order.id.substring(0, 8)}`.toLowerCase().includes(term);
                // Search in customer name
                const customerMatch = order.customer.toLowerCase().includes(term);
                // Search in total amount (convert to string and format)
                const totalMatch = `R$ ${parseFloat(order.total).toFixed(2).replace('.', ',')}`.includes(term);
                
                // Return true if any of the fields match
                if (!orderIdMatch && !customerMatch && !totalMatch) {
                    return false;
                }
            }
            
            // Apply status filter
            if (statusFilter !== 'all') {
                if (statusFilter === 'waitingWebhook') {
                    // Special filter for orders waiting for webhook
                    return order.status === 'Dispatched' && completedActions.has(order.id);
                } else if (statusFilter === 'Concluded') {
                    return order.status === 'Concluded';
                } else {
                    return order.status === statusFilter;
                }
            }
            
            return true;
        })
        .sort((a, b) => {
            // Apply sorting
            let aValue, bValue;
            
            switch (sortBy) {
                case 'id':
                    aValue = a.id;
                    bValue = b.id;
                    break;
                case 'customer':
                    aValue = a.customer || '';
                    bValue = b.customer || '';
                    break;
                case 'total':
                    aValue = a.total;
                    bValue = b.total;
                    break;
                case 'status':
                    aValue = a.status;
                    bValue = b.status;
                    break;
                case 'createdAt':
                default:
                    aValue = a.createdAt || '';
                    bValue = b.createdAt || '';
                    break;
            }
            
            // Handle numeric comparisons
            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }
            
            // Handle string comparisons
            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const comparison = aValue.localeCompare(bValue);
                return sortOrder === 'asc' ? comparison : -comparison;
            }
            
            return 0;
        });

    const updateOrderStatus = async (orderId, status) => {
        try {
            const token = localStorage.getItem('authToken');
            await orderService.updateOrderStatus(orderId, status, token);
            // Refresh orders after status update
            fetchOrders(token);
        } catch (error) {
            console.error('Error updating order status:', error);
            setError(error.message || 'Erro de conexão. Por favor, tente novamente.');
        }
    };

    const dispatchOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            await orderService.dispatchOrder(orderId, token);
            // Refresh orders after dispatch
            fetchOrders(token);
        } catch (error) {
            console.error('Error dispatching order:', error);
            setError(error.message || 'Erro de conexão. Por favor, tente novamente.');
        }
    };

    const endSeparation = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            await orderService.endSeparation(orderId, token);
            // Refresh orders after ending separation
            fetchOrders(token);
        } catch (error) {
            console.error('Error ending separation:', error);
            setError(error.message || 'Erro de conexão. Por favor, tente novamente.');
        }
    };

    const startSeparation = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            await orderService.startSeparation(orderId, token);
            // Refresh orders after starting separation
            fetchOrders(token);
        } catch (error) {
            console.error('Error starting separation:', error);
            setError(error.message || 'Erro de conexão. Por favor, tente novamente.');
        }
    };

    const arriveAtDestination = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            await orderService.arriveAtDestination(orderId, token);
            // Mark this action as completed to disable the button
            setCompletedActions(prev => new Set(prev).add(orderId));
            // Refresh orders after arriving at destination
            fetchOrders(token);
        } catch (error) {
            console.error('Error arriving at destination:', error);
            setError(error.message || 'Erro de conexão. Por favor, tente novamente.');
        }
    };

    const requestIfoodDriver = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            await orderService.requestIfoodDriver(orderId, token);
            // Refresh orders after requesting iFood driver
            fetchOrders(token);
        } catch (error) {
            console.error('Error requesting iFood driver:', error);
            
            // Tratar mensagens de erro mais comuns
            let errorMessage = 'Erro de conexão. Por favor, tente novamente.';
            
            if (error.message) {
                // Verificar se é um erro do iFood com detalhes
                if (error.message.includes('Failed to request iFood driver')) {
                    // Tentar extrair a mensagem de erro detalhada
                    try {
                        const errorDetails = JSON.parse(error.message.replace('Failed to request iFood driver.', '').trim());
                        if (errorDetails.message) {
                            errorMessage = errorDetails.message;
                        }
                    } catch (parseError) {
                        // Se não conseguir parsear, usar a mensagem original
                        errorMessage = 'Erro ao solicitar entregador iFood. Por favor, tente novamente.';
                    }
                } else {
                    errorMessage = error.message;
                }
            }
            
            setError(errorMessage);
        }
    };

    const readyToPickup = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            await orderService.readyToPickup(orderId, token);
            // Refresh orders after marking as ready to pickup
            fetchOrders(token);
        } catch (error) {
            console.error('Error marking order as ready to pickup:', error);
            setError(error.message || 'Erro de conexão. Por favor, tente novamente.');
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
            case 'readyToPickup':
                await readyToPickup(orderId);
                break;
            case 'dispatch':
                await dispatchOrder(orderId);
                break;
            case 'arriveAtDestination':
                await arriveAtDestination(orderId);
                break;
            case 'requestIfoodDriver':
                await requestIfoodDriver(orderId);
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

    const handleViewOrderDetails = (orderId) => {
        setOrderDetailsModal({ open: true, orderId });
    };

    const handleCloseOrderDetails = () => {
        setOrderDetailsModal({ open: false, orderId: null });
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const getStatusColor = (status, orderId) => {
        // Check if this order is waiting for webhook update
        const isWaitingWebhook = status === 'Dispatched' && completedActions.has(orderId);
        if (isWaitingWebhook) {
            return 'info'; // Show as info color while waiting for webhook
        }
        
        switch (status) {
            case 'Placed':
                return 'info';
            case 'Confirmed':
                return 'success';
            case 'SPS':
            case 'Separation Started':
                return 'warning';
            case 'SPE':
            case 'Separation Ended':
                return 'info';
            case 'READY_TO_PICKUP':
            case 'Ready to Pickup':
                return 'warning';
            case 'Dispatched':
                return 'default';
            case 'Arrived':
            case 'Arrived at Destination':
                return 'success';
            case 'Concluded':
                return 'success';
            default:
                return 'default';
        }
    };

    const getStatusText = (status, orderId) => {
        // Check if this order is waiting for webhook update
        const isWaitingWebhook = status === 'Dispatched' && completedActions.has(orderId);
        if (isWaitingWebhook) {
            return 'Aguardando atualização do iFood';
        }
        
        switch (status) {
            case 'Placed':
                return 'Recebido';
            case 'Confirmed':
                return 'Confirmado';
            case 'SPS':
            case 'Separation Started':
                return 'Separação iniciada';
            case 'SPE':
            case 'Separation Ended':
                return 'Separação finalizada';
            case 'READY_TO_PICKUP':
            case 'Ready to Pickup':
                return 'Pronto para Retirada';
            case 'Dispatched':
                return 'Despachado';
            case 'Arrived':
            case 'Arrived at Destination':
                return 'Chegou ao Destino';
            case 'Concluded':
                return 'Concluído';
            default:
                return status;
        }
    };

    const getAvailableActions = (status, orderId) => {
        switch (status) {
            case 'Placed':
                return [{ action: 'confirm', label: 'Confirmar Pedido', color: 'primary' }];
            case 'Confirmed':
                return [{ action: 'startSeparation', label: 'Iniciar Separação', color: 'primary' }];
            case 'SPS':
            case 'Separation Started':
                return [{ action: 'endSeparation', label: 'Finalizar Separação', color: 'secondary' }];
            case 'SPE':
            case 'Separation Ended':
                return [{ action: 'readyToPickup', label: 'Pronto para Retirada', color: 'warning' }];
            case 'READY_TO_PICKUP':
            case 'Ready to Pickup':
                return [
                    { action: 'dispatch', label: 'Despachar', color: 'success' },
                    { action: 'requestIfoodDriver', label: 'Entregador iFood Parceiro', color: 'primary' }
                ];
            case 'Dispatched':
                // Check if the arrive at destination action has already been completed
                const isArriveCompleted = completedActions.has(orderId);
                return isArriveCompleted 
                    ? [] // No actions available if already completed
                    : [{ action: 'arriveAtDestination', label: 'Chegou ao Destino', color: 'info' }];
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
            Sysfar HubDelivery - Pedidos
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
                            <Button variant="contained" onClick={() => {
                                // Clear filters when refreshing
                                setSearchTerm('');
                                setStatusFilter('all');
                                setPage(0);
                                
                                const token = localStorage.getItem('authToken');
                                if (token) {
                                    fetchOrders(token);
                                }
                            }}>
                                Atualizar
                            </Button>
                        </Box>

                        {loading ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                {/* Filter and search controls */}
                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                    <Grid item xs={12} md={4}>
                                        <TextField
                                            fullWidth
                                            label="Buscar pedido"
                                            variant="outlined"
                                            size="small"
                                            value={searchTerm}
                                            onChange={handleSearchChange}
                                            InputProps={{
                                                endAdornment: <SearchIcon />
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Status</InputLabel>
                                            <Select
                                                value={statusFilter}
                                                label="Status"
                                                onChange={handleStatusFilterChange}
                                            >
                                                <MenuItem value="all">Todos</MenuItem>
                                                <MenuItem value="Placed">Recebido</MenuItem>
                                                <MenuItem value="Confirmed">Confirmado</MenuItem>
                                                <MenuItem value="SPS">Separação iniciada</MenuItem>
                                                <MenuItem value="Separation Started">Separação iniciada</MenuItem>
                                                <MenuItem value="SPE">Separação finalizada</MenuItem>
                                                <MenuItem value="Separation Ended">Separação finalizada</MenuItem>
                                                <MenuItem value="READY_TO_PICKUP">Pronto para Retirada</MenuItem>
                                                <MenuItem value="Ready to Pickup">Pronto para Retirada</MenuItem>
                                                <MenuItem value="Dispatched">Despachado</MenuItem>
                                                <MenuItem value="waitingWebhook">Aguardando iFood</MenuItem>
                                                <MenuItem value="Arrived">Chegou ao Destino</MenuItem>
                                                <MenuItem value="Arrived at Destination">Chegou ao Destino</MenuItem>
                                                <MenuItem value="Concluded">Concluído</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={4}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Itens por página</InputLabel>
                                            <Select
                                                value={rowsPerPage}
                                                label="Itens por página"
                                                onChange={handleRowsPerPageChange}
                                            >
                                                <MenuItem value={5}>5</MenuItem>
                                                <MenuItem value={10}>10</MenuItem>
                                                <MenuItem value={20}>20</MenuItem>
                                                <MenuItem value={50}>50</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                </Grid>

                                <TableContainer>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell 
                                                    onClick={() => handleSort('id')}
                                                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    Nº Pedido {sortBy === 'id' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                </TableCell>
                                                <TableCell 
                                                    onClick={() => handleSort('customer')}
                                                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    Cliente {sortBy === 'customer' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                </TableCell>
                                                <TableCell 
                                                    onClick={() => handleSort('total')}
                                                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    Total {sortBy === 'total' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                </TableCell>
                                                <TableCell 
                                                    onClick={() => handleSort('status')}
                                                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    Status {sortBy === 'status' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                </TableCell>
                                                <TableCell 
                                                    onClick={() => handleSort('createdAt')}
                                                    sx={{ cursor: 'pointer', fontWeight: 'bold' }}
                                                >
                                                    Horário {sortBy === 'createdAt' && (sortOrder === 'asc' ? '↑' : '↓')}
                                                </TableCell>
                                                <TableCell>Ações</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {filteredAndSortedOrders.length > 0 ? (
                                                filteredAndSortedOrders
                                                    .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                                    .map((order, index) => {
                                                        const actions = getAvailableActions(order.status, order.id);
                                                        return (
                                                            <TableRow 
                                                                key={order.id} 
                                                                sx={{
                                                                    // Zebrada nas linhas
                                                                    backgroundColor: index % 2 === 0 ? 'rgba(0, 0, 0, 0.02)' : 'white',
                                                                    '&:hover': {
                                                                        backgroundColor: 'rgba(0, 0, 0, 0.04)'
                                                                    }
                                                                }}
                                                            >
                                                                <TableCell>#{order.id.substring(0, 8)}</TableCell>
                                                                <TableCell>{order.customer || 'Cliente não informado'}</TableCell>
                                                                <TableCell>
                                                                    R$ {parseFloat(order.total).toFixed(2).replace('.', ',')}
                                                                </TableCell>
                                                                <TableCell>
                                                                    <Chip
                                                                        label={getStatusText(order.status, order.id)}
                                                                        color={getStatusColor(order.status, order.id)}
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
                                                                                onClick={() => {
                                                                                    handleActionClick(order.id, action.action, action.label);
                                                                                }}
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
                                                                    <Button
                                                                        size="small"
                                                                        variant="outlined"
                                                                        startIcon={<VisibilityIcon />}
                                                                        onClick={() => handleViewOrderDetails(order.id)}
                                                                        sx={{ ml: 1 }}
                                                                    >
                                                                        Ver Detalhes
                                                                    </Button>
                                                                    {order.status === 'Dispatched' && completedActions.has(order.id) && (
                                                                        <Button
                                                                            size="small"
                                                                            variant="outlined"
                                                                            disabled
                                                                            sx={{ ml: 1, borderColor: 'info.main', color: 'info.main' }}
                                                                        >
                                                                            Aguardando iFood
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
                                
                                {/* Pagination */}
                                <TablePagination
                                    component="div"
                                    count={filteredAndSortedOrders.length}
                                    page={page}
                                    onPageChange={handlePageChange}
                                    rowsPerPage={rowsPerPage}
                                    onRowsPerPageChange={handleRowsPerPageChange}
                                    rowsPerPageOptions={[5, 10, 20, 50]}
                                    labelRowsPerPage="Itens por página:"
                                    labelDisplayedRows={({ from, to, count }) => 
                                        `${from}-${to} de ${count !== -1 ? count : `mais de ${to}`}`
                                    }
                                />
                            </>
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

                {/* Order Details Modal */}
                <OrderDetailsModal 
                    open={orderDetailsModal.open} 
                    onClose={handleCloseOrderDetails} 
                    orderId={orderDetailsModal.orderId}
                />
            </Box>
        </Box>
    );
}

export default Pedidos;