import { useState, useEffect, useCallback } from 'react';
import {
    Box,
    Typography,
    Container,
    Toolbar,
    Button,
    Paper,
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
    ToggleButtonGroup,
    Tooltip,
    Snackbar,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    LinearProgress,
    InputAdornment
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import {
    Menu as MenuIcon,
    Visibility as VisibilityIcon,
    Search as SearchIcon,
    Settings as SettingsIcon,
    VisibilityOff as VisibilityOffIcon,
    Check as CheckIcon,
    Cancel as CancelIcon,
    PlayArrow as PlayArrowIcon,
    Stop as StopIcon,
    Send as SendIcon,
    LocalShipping as LocalShippingIcon,
    Person as PersonIcon,
    AccessTime as AccessTimeIcon,
    Kitchen as KitchenIcon,
    DeliveryDining as DeliveryDiningIcon
} from '@mui/icons-material';
import { Alert as MuiAlert } from '@mui/material';
import Sidebar from '../../components/Sidebar';
import orderService from '../../services/orderService';
import OrderDetailsModal from '../../components/OrderDetailsModal';

const drawerWidth = 240;

const PaymentBadge = ({ payment }) => {
    if (!payment) return null;

    const getPaymentConfig = () => {
        const isOnline = !payment.in_person;
        const method = payment.method;

        if (method === 'CASH') {
            return {
                label: `Dinheiro ${isOnline ? '(Online)' : '(Na Entrega)'}`,
                color: isOnline ? 'success' : 'warning',
                icon: '💰'
            };
        }

        if (method === 'CREDIT') {
            return {
                label: `Crédito ${isOnline ? '(Online)' : '(Na Entrega)'}`,
                color: isOnline ? 'success' : 'warning',
                icon: '💳'
            };
        }

        if (method === 'DEBIT') {
            return {
                label: `Débito ${isOnline ? '(Online)' : '(Na Entrega)'}`,
                color: isOnline ? 'success' : 'warning',
                icon: '💳'
            };
        }

        return { label: method, color: 'default', icon: 'Não informado' };
    };

    const config = getPaymentConfig();

    return (
        <Chip
            icon={<span>{config.icon}</span>}
            label={config.label}
            color={config.color}
            variant="outlined"
            size="small"
        />
    );
};

const CashChangeInfo = ({ payment }) => {
    const changeValue = parseFloat(payment?.cash_change_for) || 0;

    if (changeValue <= 0) {
        return null;
    }

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography variant="caption" color="warning.main">
                💵 Troco para: R$ {changeValue.toFixed(2).replace('.', ',')}
            </Typography>
        </Box>
    );
};

const ScheduledOrderBadge = ({ order }) => {
    if (!order.is_scheduled) return null;

    return (
        <Chip
            icon={<AccessTimeIcon />}
            label="Pedido Agendado"
            color="warning"
            variant="filled"
            size="small"
            sx={{ mb: 1 }}
        />
    );
};

const formatTime = (dateTimeStr) => {
    if (!dateTimeStr) return 'N/A';
    const date = new Date(dateTimeStr);
    return date.toLocaleTimeString('pt-BR', {
        hour: '2-digit',
        minute: '2-digit',
        timeZone: 'America/Sao_Paulo'
    });
};

const getTimeStatus = (order) => {
    if (!order?.preparation_start_time || !order?.delivery_window?.start) return 'Horário não definido';

    const now = new Date();
    const prepStart = new Date(order.preparation_start_time);
    const deliveryStart = new Date(order.delivery_window.start);

    if (now < prepStart) {
        const diffHours = Math.ceil((prepStart - now) / (1000 * 60 * 60));
        return `Preparo inicia em ${diffHours}h`;
    } else if (now < deliveryStart) {
        return "Em preparação";
    } else {
        return "Pronto para entrega";
    }
};

const calculateProgress = (order) => {
    if (!order?.preparation_start_time || !order?.delivery_window?.end) return 0;

    const now = new Date();
    const prepStart = new Date(order.preparation_start_time);
    const deliveryEnd = new Date(order.delivery_window.end);

    const totalTime = deliveryEnd - prepStart;
    const elapsed = now - prepStart;

    if (elapsed <= 0) return 0;
    if (elapsed >= totalTime) return 100;

    return Math.min(100, Math.max(0, (elapsed / totalTime) * 100));
};

const getProgressLabel = (order) => {
    if (!order) return "Informações insuficientes";

    const progress = calculateProgress(order);
    if (progress === 0) return "Aguardando início do preparo";
    if (progress < 50) return "Em preparação";
    if (progress < 100) return "Pronto para entrega";
    return "Janela de entrega encerrada";
};

const TimeWindowDisplay = ({ order }) => {
    if (!order.is_scheduled) return null;

    const showUrgentAlert = order.preparation_start_time &&
        new Date() > new Date(order.preparation_start_time);

    return (
        <Box sx={{
            p: 2,
            bgcolor: 'warning.light',
            borderRadius: 2,
            border: '1px solid',
            borderColor: 'warning.main',
            mb: 2
        }}>
            <Typography variant="subtitle1" fontWeight="bold" gutterBottom>
                ⏰ Pedido Agendado - {getTimeStatus(order)}
            </Typography>

            {/* Alerta para pedidos que precisam de atenção */}
            {showUrgentAlert && (
                <Alert severity="warning" sx={{ mt: 1, mb: 2 }}>
                    ⚠️ Preparo deveria ter iniciado
                </Alert>
            )}

            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <KitchenIcon color="primary" />
                        <Box>
                            <Typography variant="caption" display="block" color="text.secondary">
                                Início do Preparo
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {formatTime(order.preparation_start_time)}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>

                <Grid item xs={12} sm={6}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <DeliveryDiningIcon color="primary" />
                        <Box>
                            <Typography variant="caption" display="block" color="text.secondary">
                                Janela de Entrega
                            </Typography>
                            <Typography variant="body2" fontWeight="medium">
                                {formatTime(order.delivery_window?.start)} - {formatTime(order.delivery_window?.end)}
                            </Typography>
                        </Box>
                    </Box>
                </Grid>
            </Grid>

            {/* Barra de progresso visual */}
            <Box sx={{ mt: 2 }}>
                <LinearProgress
                    variant="determinate"
                    value={calculateProgress(order)}
                    color="warning"
                />
                <Typography variant="caption" display="block" textAlign="center" mt={0.5}>
                    {getProgressLabel(order)}
                </Typography>
            </Box>
        </Box>
    );
};

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

    const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'info' });

    const [page, setPage] = useState(0);
    const [rowsPerPage, setRowsPerPage] = useState(10);

    const [searchTerm, setSearchTerm] = useState('');
    const [statusFilter, setStatusFilter] = useState('all');
    const [paymentFilter, setPaymentFilter] = useState('all'); // Novo filtro para pagamento
    const [orderTypeFilter, setOrderTypeFilter] = useState('all'); // Filtro para tipo de pedido
    const [dateFilterStart, setDateFilterStart] = useState(''); // Data inicial para filtro
    const [dateFilterEnd, setDateFilterEnd] = useState(''); // Data final para filtro
    const [showFilters, setShowFilters] = useState(false); // Control visibility of filters
    const [sortBy, setSortBy] = useState('createdAt'); // Default sort by creation date
    const [sortOrder, setSortOrder] = useState('desc'); // Default descending (newest first)

    const [isPolling, setIsPolling] = useState(true);

    const [notifiedOrders, setNotifiedOrders] = useState(new Set());

    const fetchOrders = useCallback(async (token, isPolling = false) => {
        try {
            if (!isPolling) {
                setLoading(true);
            }
            setError(null);
            console.log('Fetching orders with token:', token);

            const ordersData = await orderService.getOrders(token);
            console.log('Received orders data:', ordersData);

            if (!ordersData) {
                console.error('No orders data received');
                setOrders([]);
                return;
            }

            const ordersArray = ordersData.data || ordersData.orders || [];
            if (!Array.isArray(ordersArray)) {
                console.error('Invalid orders data structure:', ordersData);
                setOrders([]);
                return;
            }

            console.log('Number of orders received:', ordersArray.length);

            if (isPolling) {
                const currentOrderIds = new Set(orders.map(order => order.id));
                const newOrders = ordersArray.filter(order => {
                    if (!order || !order.order || !order.consumer) {
                        return false;
                    }
                    const isNewOrder = !currentOrderIds.has(order.order.id);
                    const isPlacedOrder = order.order.status === 'Placed';
                    const isAlreadyNotified = notifiedOrders.has(order.order.id);

                    return isNewOrder && isPlacedOrder && !isAlreadyNotified;
                });

                if (newOrders.length > 0) {
                    setNotifiedOrders(prev => {
                        const updated = new Set(prev);
                        newOrders.forEach(order => updated.add(order.order.id));
                        return updated;
                    });

                    setSnackbar({
                        open: true,
                        message: `Você tem ${newOrders.length} novo(s) pedido(s) confirmado(s)!`,
                        severity: 'success'
                    });
                }
            }

            const transformedOrders = ordersArray.map((order, index) => {
                console.log(`Processing order ${index}:`, order);

                if (!order || !order.order || !order.consumer) {
                    console.error(`Invalid order structure at index ${index}:`, order);
                    return null;
                }

                const items = order.order.items || [];
                return {
                    id: order.order.id,
                    customer: order.consumer.name,
                    status: order.order.status || 'CONFIRMED', // Default to 'CONFIRMED' if status is not provided
                    total: items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0),
                    createdAt: order.order.created_at || 'Horário não disponível', // Usar horário retornado pela API
                    delivery_provider: order.order.delivery_provider,
                    payment: order.order.payment,
                    is_scheduled: order.order.is_scheduled,
                    scheduling_type: order.order.scheduling_type,
                    delivery_window: order.order.delivery_window,
                    preparation_start_time: order.order.preparation_start_time,
                    short_code: order.order.short_code,
                    delivery_code: order.order.delivery_code,
                    pickup_code: order.order.pickup_code,
                    customer_code: order.order.customer_code
                };
            }).filter(order => order !== null); // Remover pedidos inválidos

            console.log('Transformed orders:', transformedOrders);

            const sortedOrders = [...transformedOrders].sort((a, b) => {
                if (!a.createdAt || !b.createdAt) return 0;

                const dateA = new Date(a.createdAt);
                const dateB = new Date(b.createdAt);

                return dateB - dateA;
            });

            setOrders(sortedOrders);

            setCompletedActions(prev => {
                const updated = new Set(prev);
                transformedOrders.forEach(order => {
                    if (order.status !== 'Dispatched') {
                        updated.delete(order.id);
                    }
                });
                return updated;
            });

            setNotifiedOrders(prev => {
                const updated = new Set(prev);
                const transformedOrderIds = new Set(transformedOrders.map(order => order.id));
                prev.forEach(orderId => {
                    if (!transformedOrderIds.has(orderId)) {
                        updated.delete(orderId);
                    }
                });
                return updated;
            });
        } catch (error) {
            console.error('Error fetching orders:', error);
            if (error.message && error.message.includes('Sessão expirada')) {
                return;
            }

            let errorMessage = 'Erro de conexão. Por favor, tente novamente.';
            if (error.message) {
                if (error.message.includes('Network Error')) {
                    errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
                } else if (error.message.includes('401')) {
                    errorMessage = 'Sessão expirada. Faça login novamente.';
                } else if (error.message.includes('403')) {
                    errorMessage = 'Acesso negado. Você não tem permissão para acessar esses dados.';
                } else if (error.message.includes('500')) {
                    errorMessage = 'Erro no servidor. Tente novamente em alguns minutos.';
                } else {
                    errorMessage = error.message;
                }
            }

            setError(errorMessage);
        } finally {
            if (!isPolling) {
                setLoading(false);
            }
        }
    }, [navigate, isPolling]); // fetchOrders is wrapped in useCallback with proper dependencies

    useEffect(() => {
        let isMounted = true;
        let pollingInterval;

        const token = localStorage.getItem('authToken');
        if (!token) {
            if (isMounted) {
                navigate('/');
            }
        } else {
            if (isMounted) {
                setUser({ name: 'Usuário' });
                setTimeout(() => {
                    if (isMounted) {
                        fetchOrders(token);
                    }
                }, 150);

                if (isPolling) {
                    pollingInterval = setInterval(() => {
                        if (isMounted) {
                            const token = localStorage.getItem('authToken');
                            if (token) {
                                fetchOrders(token, true); // Pass true to indicate this is a polling call
                            }
                        }
                    }, 10000); // 10 segundos
                }
            }
        }

        return () => {
            isMounted = false;
            if (pollingInterval) {
                clearInterval(pollingInterval);
            }
        };
    }, [navigate, isPolling, fetchOrders]); // fetchOrders is now properly defined before this useEffect

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

    const filteredAndSortedOrders = orders
        .filter(order => {
            if (searchTerm) {
                const term = searchTerm.toLowerCase();
                const orderIdMatch = order.id.toLowerCase().includes(term) ||
                    `#${order.id.substring(0, 8)}`.toLowerCase().includes(term);
                const customerMatch = order.customer.toLowerCase().includes(term);
                const totalMatch = `R$ ${parseFloat(order.total).toFixed(2).replace('.', ',')}`.includes(term);

                if (!orderIdMatch && !customerMatch && !totalMatch) {
                    return false;
                }
            }

            if (statusFilter !== 'all') {
                if (statusFilter === 'waitingWebhook') {
                    return order.status === 'Dispatched' && completedActions.has(order.id);
                } else if (statusFilter === 'Concluded') {
                    return order.status === 'Concluded';
                } else if (statusFilter === 'RFI') {
                    return order.status === 'READY_TO_PICKUP' || order.status === 'Ready to Pickup' || order.status === 'RFI';
                } else if (statusFilter === 'Cancelled') {
                    return order.status === 'Cancelled' || order.status === 'CAR';
                } else if (statusFilter === 'SPS') {
                    return order.status === 'SPS' || order.status === 'Separation Started';
                } else if (statusFilter === 'SPE') {
                    return order.status === 'SPE' || order.status === 'Separation Ended';
                } else if (statusFilter === 'READY_TO_PICKUP') {
                    return order.status === 'READY_TO_PICKUP' || order.status === 'Ready to Pickup';
                } else if (statusFilter === 'Arrived') {
                    return order.status === 'Arrived' || order.status === 'Arrived at Destination';
                } else {
                    return order.status === statusFilter;
                }
            }

            if (paymentFilter !== 'all' && order.payment) {
                switch (paymentFilter) {
                    case 'online':
                        return !order.payment.in_person; // Online payments
                    case 'in_person':
                        return order.payment.in_person; // In-person payments
                    case 'cash':
                        return order.payment.method === 'CASH';
                    case 'credit':
                        return order.payment.method === 'CREDIT';
                    case 'debit':
                        return order.payment.method === 'DEBIT';
                    default:
                        return true;
                }
            }

            if (orderTypeFilter !== 'all') {
                if (orderTypeFilter === 'scheduled') {
                    return order.is_scheduled === true;
                } else if (orderTypeFilter === 'immediate') {
                    return !order.is_scheduled || order.is_scheduled === false;
                } else if (orderTypeFilter === 'takeout') {
                    return order.delivery_provider === 'TAKEOUT';
                }
            }

            if (dateFilterStart || dateFilterEnd) {
                let orderDate;
                if (order.createdAt) {
                    if (order.createdAt instanceof Date) {
                        orderDate = order.createdAt;
                    } else {
                        orderDate = new Date(order.createdAt.replace(' ', 'T'));
                    }
                } else {
                    return true;
                }

                if (isNaN(orderDate.getTime())) {
                    return true;
                }

                if (dateFilterStart) {
                    const startDate = new Date(dateFilterStart);
                    if (orderDate < startDate) {
                        return false;
                    }
                }

                if (dateFilterEnd) {
                    const endDate = new Date(dateFilterEnd);
                    endDate.setDate(endDate.getDate() + 1);
                    if (orderDate >= endDate) {
                        return false;
                    }
                }
            }

            return true;
        })
        .sort((a, b) => {
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

            if (typeof aValue === 'number' && typeof bValue === 'number') {
                return sortOrder === 'asc' ? aValue - bValue : bValue - aValue;
            }

            if (typeof aValue === 'string' && typeof bValue === 'string') {
                const comparison = aValue.localeCompare(bValue);
                return sortOrder === 'asc' ? comparison : -comparison;
            }

            if (!a.createdAt && !b.createdAt) {
                return b.id.localeCompare(a.id); // Comparar IDs se não tiver datas
            }

            if (!a.createdAt) return 1;
            if (!b.createdAt) return -1;

            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        });

    const sortScheduledOrders = (ordersList) => {
        return [...ordersList].sort((a, b) => {
            if (a.is_scheduled && !b.is_scheduled) return -1;
            if (!a.is_scheduled && b.is_scheduled) return 1;

            if (a.is_scheduled && b.is_scheduled) {
                const prepA = new Date(a.preparation_start_time);
                const prepB = new Date(b.preparation_start_time);
                return prepA - prepB;
            }

            const dateA = new Date(a.createdAt);
            const dateB = new Date(b.createdAt);
            return dateB - dateA;
        });
    };

    const orderedOrders = orderTypeFilter === 'scheduled' ? sortScheduledOrders(filteredAndSortedOrders) : filteredAndSortedOrders;



    const confirmOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            await orderService.confirmOrder(orderId, token);
            fetchOrders(token);

            setSnackbar({
                open: true,
                message: 'Pedido confirmado com sucesso!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error confirming order:', error);

            let errorMessage = 'Erro de conexão. Por favor, tente novamente.';
            if (error.message) {
                if (error.message.includes('Network Error')) {
                    errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
                } else if (error.message.includes('401')) {
                    errorMessage = 'Sessão expirada. Faça login novamente.';
                } else if (error.message.includes('403')) {
                    errorMessage = 'Acesso negado. Você não tem permissão para realizar esta ação.';
                } else if (error.message.includes('500')) {
                    errorMessage = 'Erro no servidor. Tente novamente em alguns minutos.';
                } else {
                    errorMessage = error.message;
                }
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const dispatchOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            await orderService.dispatchOrder(orderId, token);
            fetchOrders(token);

            setSnackbar({
                open: true,
                message: 'Pedido despachado com sucesso!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error dispatching order:', error);

            let errorMessage = 'Erro de conexão. Por favor, tente novamente.';
            if (error.message) {
                if (error.message.includes('Network Error')) {
                    errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
                } else if (error.message.includes('401')) {
                    errorMessage = 'Sessão expirada. Faça login novamente.';
                } else if (error.message.includes('403')) {
                    errorMessage = 'Acesso negado. Você não tem permissão para realizar esta ação.';
                } else if (error.message.includes('500')) {
                    errorMessage = 'Erro no servidor. Tente novamente em alguns minutos.';
                } else {
                    errorMessage = error.message;
                }
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const dispatchOrderToIfood = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            await orderService.dispatchOrderToIfood(orderId, token);
            fetchOrders(token);

            setSnackbar({
                open: true,
                message: 'Pedido despachado para o iFood com sucesso!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error dispatching order to iFood:', error);

            let errorMessage = 'Erro de conexão. Por favor, tente novamente.';
            if (error.message) {
                if (error.message.includes('Network Error')) {
                    errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
                } else if (error.message.includes('401')) {
                    errorMessage = 'Sessão expirada. Faça login novamente.';
                } else if (error.message.includes('403')) {
                    errorMessage = 'Acesso negado. Você não tem permissão para realizar esta ação.';
                } else if (error.message.includes('500')) {
                    errorMessage = 'Erro no servidor. Tente novamente em alguns minutos.';
                } else {
                    errorMessage = error.message;
                }
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const endSeparation = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            await orderService.endSeparation(orderId, token);
            fetchOrders(token);

            setSnackbar({
                open: true,
                message: 'Separação finalizada com sucesso!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error ending separation:', error);

            let errorMessage = 'Erro de conexão. Por favor, tente novamente.';
            if (error.message) {
                if (error.message.includes('Network Error')) {
                    errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
                } else if (error.message.includes('401')) {
                    errorMessage = 'Sessão expirada. Faça login novamente.';
                } else if (error.message.includes('403')) {
                    errorMessage = 'Acesso negado. Você não tem permissão para realizar esta ação.';
                } else if (error.message.includes('500')) {
                    errorMessage = 'Erro no servidor. Tente novamente em alguns minutos.';
                } else {
                    errorMessage = error.message;
                }
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const startSeparation = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            await orderService.startSeparation(orderId, token);
            fetchOrders(token);

            setSnackbar({
                open: true,
                message: 'Separação iniciada com sucesso!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error starting separation:', error);

            let errorMessage = 'Erro de conexão. Por favor, tente novamente.';
            if (error.message) {
                if (error.message.includes('Network Error')) {
                    errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
                } else if (error.message.includes('401')) {
                    errorMessage = 'Sessão expirada. Faça login novamente.';
                } else if (error.message.includes('403')) {
                    errorMessage = 'Acesso negado. Você não tem permissão para realizar esta ação.';
                } else if (error.message.includes('500')) {
                    errorMessage = 'Erro no servidor. Tente novamente em alguns minutos.';
                } else {
                    errorMessage = error.message;
                }
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const requestIfoodDriver = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            await orderService.requestIfoodDriver(orderId, token);
            fetchOrders(token);

            setSnackbar({
                open: true,
                message: 'Solicitação de entregador iFood enviada com sucesso!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error requesting iFood driver:', error);

            let errorMessage = 'Erro de conexão. Por favor, tente novamente.';

            if (error.message) {
                if (error.message.includes('Failed to request iFood driver')) {
                    try {
                        const errorDetails = JSON.parse(error.message.replace('Failed to request iFood driver.', '').trim());
                        if (errorDetails.message) {
                            errorMessage = errorDetails.message;
                        }
                    } catch {
                        errorMessage = 'Erro ao solicitar entregador iFood. Por favor, tente novamente.';
                    }
                } else {
                    errorMessage = error.message;
                }
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const cancelOrder = async (orderId) => {
        try {
            const token = localStorage.getItem('authToken');
            await orderService.cancelOrder(orderId, token);
            fetchOrders(token);

            setSnackbar({
                open: true,
                message: 'Pedido cancelado com sucesso!',
                severity: 'success'
            });
        } catch (error) {
            console.error('Error canceling order:', error);

            let errorMessage = 'Erro de conexão. Por favor, tente novamente.';
            if (error.message) {
                if (error.message.includes('Network Error')) {
                    errorMessage = 'Erro de conexão. Verifique sua internet e tente novamente.';
                } else if (error.message.includes('401')) {
                    errorMessage = 'Sessão expirada. Faça login novamente.';
                } else if (error.message.includes('403')) {
                    errorMessage = 'Acesso negado. Você não tem permissão para realizar esta ação.';
                } else if (error.message.includes('500')) {
                    errorMessage = 'Erro no servidor. Tente novamente em alguns minutos.';
                } else {
                    errorMessage = error.message;
                }
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
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
                await dispatchOrder(orderId);
                break;
            case 'dispatchToIfood':
                await dispatchOrderToIfood(orderId);
                break;
            case 'requestIfoodDriver':
                await requestIfoodDriver(orderId);
                break;
            case 'confirm':
                await confirmOrder(orderId);
                break;
            case 'cancel':
                await cancelOrder(orderId);
                break;
            default:
                break;
        }
    };

    const handleCloseSnackbar = (event, reason) => {
        if (reason === 'clickaway') {
            return;
        }
        setSnackbar({ ...snackbar, open: false });
    };

    const handleViewOrderDetails = (orderId) => {
        setOrderDetailsModal({ open: true, orderId });
    };

    const handleCloseDialog = () => {
        setConfirmDialog({ open: false, orderId: null, action: null, actionLabel: '' });
    };

    const handleCloseOrderDetails = () => {
        setOrderDetailsModal({ open: false, orderId: null });
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const getStatusColor = (status, orderId) => {
        const isWaitingWebhook = status === 'Dispatched' && completedActions.has(orderId);
        if (isWaitingWebhook) {
            return '#2196f3'; // Azul para aguardando webhook
        }

        switch (status) {
            case 'Placed':
                return '#ff9800'; // Laranja para Recebido
            case 'Confirmed':
                return '#4caf50'; // Verde para Confirmado
            case 'SPS':
            case 'Separation Started':
                return '#ffeb3b'; // Amarelo para Separação iniciada
            case 'SPE':
            case 'Separation Ended':
                return '#ffc107'; // Âmbar para Separação finalizada
            case 'READY_TO_PICKUP':
            case 'Ready to Pickup':
            case 'RFI':
                return '#ff5722'; // Laranja escuro para Pronto para Retirada e RFI
            case 'Dispatched':
                return '#9c27b0'; // Roxo para Despachado
            case 'Arrived':
            case 'Arrived at Destination':
                return '#3f51b5'; // Índigo para Chegou ao Destino
            case 'Concluded':
                return '#009688'; // Verde-azulado para Concluído
            case 'DDCS':
                return '#009688';
            case 'Cancelled':
            case 'CAR': // Cancelado
                return '#f44336'; // Vermelho para Cancelado
            case 'CANCELLATION_REQUESTED': // Cancelamento em andamento
                return '#ff9800'; // Laranja para Cancelamento em andamento
            default:
                return '#9e9e9e'; // Cinza para status desconhecido
        }
    };

    const getStatusText = (status, orderId) => {
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
            case 'RFI':
                return 'Pronto para Retirada';
            case 'Dispatched':
                return 'Despachado';
            case 'Arrived':
            case 'Arrived at Destination':
                return 'Chegou ao Destino';
            case 'Concluded':
                return 'Concluído';
            case 'DDCS':
                return 'Concluído';
            case 'Cancelled':
            case 'CAR':
                return 'Cancelado';
            case 'CANCELLATION_REQUESTED': // Cancelamento em andamento
                return 'Cancelamento em andamento';
            default:
                return status;
        }
    };

    const getAvailableActions = (order) => {
        const { status, delivery_provider } = order;

        if (status === 'CANCELLATION_REQUESTED' || status === 'Cancelled' || status === 'CAR') {
            return [];
        }

        const isTakeout = delivery_provider === 'TAKEOUT';

        if (isTakeout) {
            switch (status) {
                case 'Placed':
                    return [
                        { action: 'confirm', label: 'Confirmar Pedido', color: '#4caf50', icon: <CheckIcon /> }, // Verde
                        { action: 'cancel', label: 'Cancelar Pedido', color: '#f44336', icon: <StopIcon /> } // Vermelho
                    ];
                case 'Confirmed':
                    return [
                        { action: 'startSeparation', label: 'Iniciar Separação', color: '#2196f3', icon: <PlayArrowIcon /> }, // Azul
                        { action: 'cancel', label: 'Cancelar Pedido', color: '#f44336', icon: <StopIcon /> } // Vermelho
                    ];
                case 'SPS':
                case 'Separation Started':
                    return [
                        { action: 'endSeparation', label: 'Finalizar Separação', color: '#ff9800', icon: <StopIcon /> }, // Laranja
                        { action: 'cancel', label: 'Cancelar Pedido', color: '#f44336', icon: <StopIcon /> } // Vermelho
                    ];
                default:
                    return [];
            }
        } else {
            switch (status) {
                case 'Placed':
                    return [
                        { action: 'confirm', label: 'Confirmar Pedido', color: '#4caf50', icon: <CheckIcon /> }, // Verde
                        { action: 'cancel', label: 'Cancelar Pedido', color: '#f44336', icon: <StopIcon /> } // Vermelho
                    ];
                case 'Confirmed':
                    return [
                        { action: 'startSeparation', label: 'Iniciar Separação', color: '#2196f3', icon: <PlayArrowIcon /> }, // Azul
                        { action: 'cancel', label: 'Cancelar Pedido', color: '#f44336', icon: <StopIcon /> } // Vermelho
                    ];
                case 'SPS':
                case 'Separation Started':
                    return [
                        { action: 'dispatch', label: 'Despachar', color: '#ff5722', icon: <SendIcon /> }, // Laranja escuro
                        { action: 'cancel', label: 'Cancelar Pedido', color: '#f44336', icon: <StopIcon /> } // Vermelho
                    ];
                case 'Dispatched':
                    return [];
                default:
                    return [];
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
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
                <Typography variant="h6" color="grey">
                    Pedidos
                </Typography>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
                    {/* <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Box>
                            <Button
                                variant="contained"
                                onClick={() => {
                                    setSearchTerm('');
                                    setStatusFilter('all');
                                    setPage(0);

                                    const token = localStorage.getItem('authToken');
                                    if (token) {
                                        fetchOrders(token, false); // Pass false to indicate this is a manual refresh
                                    }
                                }}
                                sx={{ mr: 2 }}
                            >
                                Atualizar
                            </Button>
                            <Button
                                variant="outlined"
                                onClick={() => setIsPolling(!isPolling)}
                            >
                                {isPolling ? 'Parar Atualização' : 'Iniciar Atualização'}
                            </Button>
                        </Box>
                    </Box> */}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {/* Filter and search controls */}
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                <Typography variant="h6">Filtros</Typography>
                                <IconButton
                                    onClick={() => setShowFilters(!showFilters)}
                                    color="primary"
                                >
                                    {showFilters ? <SettingsIcon /> : <SettingsIcon />}
                                </IconButton>
                            </Box>

                            {showFilters && (
                                <Grid container spacing={2} sx={{ mb: 2 }}>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Buscar pedido"
                                            variant="outlined"
                                            size="small"
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            InputProps={{
                                                endAdornment: (
                                                    <InputAdornment position="end">
                                                        <SearchIcon />
                                                    </InputAdornment>
                                                ),
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
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
                                                <MenuItem value="SPE">Separação finalizada</MenuItem>
                                                <MenuItem value="READY_TO_PICKUP">Pronto para Retirada</MenuItem>
                                                <MenuItem value="RFI">Pronto para Retirada (RFI)</MenuItem>
                                                <MenuItem value="Dispatched">Despachado</MenuItem>
                                                <MenuItem value="waitingWebhook">Aguardando iFood</MenuItem>
                                                <MenuItem value="Arrived">Chegou ao Destino</MenuItem>
                                                <MenuItem value="Concluded">Concluído</MenuItem>
                                                <MenuItem value="CANCELLATION_REQUESTED">Cancelamento em andamento</MenuItem>
                                                <MenuItem value="Cancelled">Cancelado</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Filtrar por Pagamento</InputLabel>
                                            <Select
                                                value={paymentFilter}
                                                label="Filtrar por Pagamento"
                                                onChange={(e) => setPaymentFilter(e.target.value)}
                                            >
                                                <MenuItem value="all">Todos os Pagamentos</MenuItem>
                                                <MenuItem value="online">Pagos Online</MenuItem>
                                                <MenuItem value="in_person">Pagos na Entrega</MenuItem>
                                                <MenuItem value="cash">Dinheiro</MenuItem>
                                                <MenuItem value="credit">Cartão Crédito</MenuItem>
                                                <MenuItem value="debit">Cartão Débito</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <FormControl fullWidth size="small">
                                            <InputLabel>Tipo de Pedido</InputLabel>
                                            <Select
                                                value={orderTypeFilter}
                                                label="Tipo de Pedido"
                                                onChange={(e) => setOrderTypeFilter(e.target.value)}
                                            >
                                                <MenuItem value="all">Todos os Pedidos</MenuItem>
                                                <MenuItem value="scheduled">Pedidos Agendados</MenuItem>
                                                <MenuItem value="immediate">Pedidos Imediatos</MenuItem>
                                                <MenuItem value="takeout">Retirada em Loja</MenuItem>
                                            </Select>
                                        </FormControl>
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Data Início"
                                            type="datetime-local"
                                            value={dateFilterStart}
                                            onChange={(e) => setDateFilterStart(e.target.value)}
                                            size="small"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                    <Grid item xs={12} md={3}>
                                        <TextField
                                            fullWidth
                                            label="Data Fim"
                                            type="datetime-local"
                                            value={dateFilterEnd}
                                            onChange={(e) => setDateFilterEnd(e.target.value)}
                                            size="small"
                                            InputLabelProps={{
                                                shrink: true,
                                            }}
                                        />
                                    </Grid>
                                </Grid>
                            )}

                            <Box>
                                {orderedOrders.length > 0 ? (
                                    orderedOrders
                                        .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                                        .map((order, index) => {
                                            const actions = getAvailableActions(order);
                                            return (
                                                <Card key={order.id} sx={{
                                                    mb: 2,
                                                    border: order.is_scheduled ? '2px solid' : '1px solid',
                                                    borderColor: order.is_scheduled ? 'warning.main' : 'divider'
                                                }}>
                                                    <CardContent>
                                                        {/* Cabeçalho com badge de agendado */}
                                                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                                            <Box>
                                                                <Typography variant="h6">Pedido #{order.id.substring(0, 8)}</Typography>
                                                                <ScheduledOrderBadge order={order} />
                                                            </Box>
                                                            <Box sx={{ display: 'flex', gap: 1, alignItems: 'center' }}>
                                                                <Chip
                                                                    label={getStatusText(order.status, order.id)}
                                                                    sx={{
                                                                        backgroundColor: getStatusColor(order.status, order.id),
                                                                        color: 'white',
                                                                        fontWeight: 'bold'
                                                                    }}
                                                                    size="small"
                                                                />
                                                                {order.delivery_provider === 'TAKEOUT' && (
                                                                    <Chip
                                                                        label="RETIRADA EM LOJA"
                                                                        sx={{
                                                                            backgroundColor: '#1976d2',
                                                                            color: 'white',
                                                                            fontWeight: 'bold'
                                                                        }}
                                                                        size="small"
                                                                    />
                                                                )}
                                                            </Box>
                                                        </Box>

                                                        {/* SEÇÃO DE AGENDAMENTO - APENAS PARA PEDIDOS AGENDADOS */}
                                                        {order.is_scheduled && (
                                                            <TimeWindowDisplay order={order} />
                                                        )}

                                                        {/* SEÇÃO DE PAGAMENTO */}
                                                        <Box sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                                            <PaymentBadge payment={order.payment} />
                                                            <CashChangeInfo payment={order.payment} />
                                                            <Typography variant="body2" sx={{ mt: 1 }}>
                                                                <strong>Valor Total:</strong> R$ {parseFloat(order.total).toFixed(2).replace('.', ',')}
                                                            </Typography>
                                                        </Box>

                                                        {/* Informações do cliente */}
                                                        <Typography variant="body2">
                                                            <strong>Cliente:</strong> {order.customer || 'Cliente não informado'}
                                                        </Typography>

                                                        {/* Códigos de entrega/retirada */}
                                                        <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                                                            {order.delivery_code && (
                                                                <Chip
                                                                    label={`Entrega: ${order.delivery_code}`}
                                                                    variant="outlined"
                                                                    size="small"
                                                                />
                                                            )}
                                                            {order.pickup_code && (
                                                                <Chip
                                                                    label={`Retirada: ${order.pickup_code}`}
                                                                    variant="outlined"
                                                                    size="small"
                                                                />
                                                            )}
                                                            {order.customer_code && (
                                                                <Chip
                                                                    label={`Cliente: ${order.customer_code}`}
                                                                    variant="outlined"
                                                                    size="small"
                                                                />
                                                            )}
                                                        </Box>

                                                        {/* Ações do pedido */}
                                                        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1, mt: 2 }}>
                                                            {actions.length > 0 ? (
                                                                actions.map((action, idx) => (
                                                                    <Tooltip key={idx} title={action.label}>
                                                                        <Button
                                                                            variant="contained"
                                                                            onClick={() => {
                                                                                handleActionClick(order.id, action.action, action.label);
                                                                            }}
                                                                            sx={{
                                                                                backgroundColor: action.color,
                                                                                color: 'white',
                                                                                '&:hover': {
                                                                                    backgroundColor: `${action.color}dd`, // Opacidade um pouco menor no hover
                                                                                },
                                                                                minWidth: 'auto',
                                                                                height: 36,
                                                                                '& .MuiSvgIcon-root': {
                                                                                    fontSize: 20
                                                                                }
                                                                            }}
                                                                            startIcon={action.icon}
                                                                            size="small"
                                                                        >
                                                                            {action.label}
                                                                        </Button>
                                                                    </Tooltip>
                                                                ))
                                                            ) : (
                                                                <Button
                                                                    variant="outlined"
                                                                    disabled
                                                                    size="small"
                                                                    sx={{ minWidth: 'auto', height: 36 }}
                                                                >
                                                                    Nenhuma ação
                                                                </Button>
                                                            )}
                                                            <Button
                                                                variant="outlined"
                                                                onClick={() => handleViewOrderDetails(order.id)}
                                                                sx={{ minWidth: 'auto', height: 36 }}
                                                                startIcon={<VisibilityIcon />}
                                                                size="small"
                                                            >
                                                                Detalhes
                                                            </Button>
                                                            {order.status === 'Dispatched' && completedActions.has(order.id) && (
                                                                <Tooltip title="Aguardando iFood">
                                                                    <Box sx={{
                                                                        ml: 1,
                                                                        display: 'flex',
                                                                        alignItems: 'center',
                                                                        backgroundColor: '#2196f3',
                                                                        color: 'white',
                                                                        borderRadius: 1,
                                                                        px: 1,
                                                                        height: 36
                                                                    }}>
                                                                        <CircularProgress size={20} color="inherit" />
                                                                        <Typography variant="caption" sx={{ ml: 1, color: 'white' }}>
                                                                            Aguardando iFood
                                                                        </Typography>
                                                                    </Box>
                                                                </Tooltip>
                                                            )}
                                                        </Box>
                                                    </CardContent>
                                                </Card>
                                            );
                                        })
                                ) : (
                                    <Typography variant="body1" align="center" sx={{ py: 4 }}>
                                        Nenhum pedido encontrado
                                    </Typography>
                                )}
                            </Box>

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

                {/* Snackbar for notifications */}
                <Snackbar
                    open={snackbar.open}
                    autoHideDuration={6000}
                    onClose={handleCloseSnackbar}
                    anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
                >
                    <MuiAlert
                        onClose={handleCloseSnackbar}
                        severity={snackbar.severity}
                        sx={{ width: '100%' }}
                    >
                        {snackbar.message}
                    </MuiAlert>
                </Snackbar>
            </Box>
        </Box>
    );
}

export default Pedidos;