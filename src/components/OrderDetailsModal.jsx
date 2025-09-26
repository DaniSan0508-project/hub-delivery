import { useState, useEffect } from 'react';
import {
    Button,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Box,
    Alert,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Paper,
    CircularProgress,
    Chip,
    Card,
    CardContent,
    List,
    ListItem,
    ListItemText,
    Grid,
    LinearProgress
} from '@mui/material';
import { AccessTime as AccessTimeIcon, Kitchen as KitchenIcon, DeliveryDining as DeliveryDiningIcon } from '@mui/icons-material';
import orderService from '../services/orderService';

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
    if (!payment?.requires_cash_change) return null;

    console.log('CashChangeInfo payment:', payment);
    console.log('CashChangeInfo payment.cash_change_for:', payment.cash_change_for)

    return (
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mt: 1 }}>
            <Typography variant="caption" color="warning.main">
                💵 Troco para: R$ {(parseFloat(payment.cash_change_for) || 0).toFixed(2).replace('.', ',')}
            </Typography>
        </Box>
    );
};

const ScheduledOrderBadge = ({ order }) => {
    if (!order?.is_scheduled) return null;

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
    if (!order?.is_scheduled) return null;

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

const getStatusColor = (status) => {
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
        case 'Dispatched':
            return 'default';
        case 'Concluded':
            return 'default';
        case 'Cancelled':
        case 'CAR':
            return 'error';
        case 'CANCELLATION_REQUESTED':
            return 'warning';
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
        case 'Separation Started':
            return 'Separação iniciada';
        case 'SPE':
        case 'Separation Ended':
            return 'Separação finalizada';
        case 'Dispatched':
            return 'Despachado';
        case 'Concluded':
            return 'Concluído';
        case 'DDCS':
            return 'Concluído';
        case 'Cancelled':
        case 'CAR':
            return 'Cancelado';
        case 'CANCELLATION_REQUESTED':
            return 'Cancelamento em andamento';
        default:
            return status;
    }
};

const OrderDetailsModal = ({ open, onClose, orderId }) => {
    const [order, setOrder] = useState(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const loadOrderDetails = async () => {
            try {
                console.log('Loading order details for orderId:', orderId);
                setLoading(true);
                setError(null);
                const token = localStorage.getItem('authToken');
                console.log('Using token:', token ? 'Token exists' : 'No token');
                const orderData = await orderService.getOrderDetails(orderId, token);
                console.log('Received order data:', orderData);
                setOrder(orderData);
            } catch (err) {
                console.error('Error loading order details:', err);
                setError(err.message || 'Erro ao carregar detalhes do pedido');
            } finally {
                setLoading(false);
            }
        };

        if (open && orderId) {
            console.log('Component opened with orderId:', orderId);
            loadOrderDetails();
        }
    }, [open, orderId]);

    const calculateOrderTotal = (items) => {
        if (!items || !Array.isArray(items)) return 0;
        return items.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
    };

    console.log('order:', order);
    const orderData = order && order.orders && Array.isArray(order.orders) && order.orders.length > 0
        ? order.orders[0]
        : (order && Array.isArray(order) && order.length > 0 ? order[0] : null);
    console.log('orderData:', orderData);

    return (
        <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
            <DialogTitle>Detalhes do Pedido #{String(orderId).substring(0, 8)}</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}

                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                        <CircularProgress />
                    </Box>
                ) : orderData ? (
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
                        {/* Order Info */}
                        <Box>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                                <Box>
                                    <Typography variant="h6">
                                        Cliente: {orderData.consumer?.name || 'Não informado'}
                                    </Typography>
                                    <Typography variant="body2">
                                        Documento: {orderData.consumer?.document?.type || ''} {orderData.consumer?.document?.number || ''}
                                    </Typography>
                                    <ScheduledOrderBadge order={orderData.order} />
                                </Box>
                                <Chip
                                    label={getStatusText(orderData.order?.status)}
                                    color={getStatusColor(orderData.order?.status)}
                                    size="small"
                                />
                            </Box>

                            {/* SEÇÃO DE AGENDAMENTO - APENAS PARA PEDIDOS AGENDADOS */}
                            {orderData.order?.is_scheduled && (
                                <TimeWindowDisplay order={orderData.order} />
                            )}

                            {/* Adicionar códigos do pedido */}
                            <Box sx={{ display: 'flex', gap: 2, mt: 1, flexWrap: 'wrap' }}>
                                {orderData.order?.pickup_code && (
                                    <Chip
                                        label={`Retirada: ${orderData.order.pickup_code}`}
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                                {orderData.order?.short_code && (
                                    <Chip
                                        label={`Pedido: ${orderData.order.short_code}`}
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                                {orderData.order?.delivery_code && (
                                    <Chip
                                        label={`Entrega: ${orderData.order.delivery_code}`}
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                                {orderData.order?.customer_code && (
                                    <Chip
                                        label={`Cliente: ${orderData.order.customer_code}`}
                                        variant="outlined"
                                        size="small"
                                    />
                                )}
                            </Box>
                            <Typography variant="h6" sx={{ mt: 1 }}>
                                Total: R$ {calculateOrderTotal(orderData.order?.items).toFixed(2).replace('.', ',')}
                            </Typography>
                        </Box>

                        {/* Payment Information */}
                        {orderData.order?.payment && (
                            <Card sx={{ mb: 2, p: 1, bgcolor: 'grey.50', borderRadius: 1 }}>
                                <Typography variant="subtitle2" gutterBottom>
                                    💰 Informações de Pagamento
                                </Typography>

                                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flexWrap: 'wrap' }}>
                                    <PaymentBadge payment={orderData.order.payment} />

                                    <Typography variant="body2">
                                        Valor: R$ {parseFloat(orderData.order.payment?.amount)?.toFixed(2).replace('.', ',')}
                                    </Typography>

                                    <Typography variant="body2" color="text.secondary">
                                        Responsável: {orderData.order.payment?.liability === 'IFOOD' ? 'iFood' : 'Estabelecimento'}
                                    </Typography>
                                </Box>

                                <CashChangeInfo payment={orderData.order.payment} />
                            </Card>
                        )}

                        {/* Items Table */}
                        <Typography variant="h6" gutterBottom>
                            Itens do Pedido
                        </Typography>

                        <TableContainer component={Paper}>
                            <Table>
                                <TableHead>
                                    <TableRow>
                                        <TableCell>Produto</TableCell>
                                        <TableCell>EAN</TableCell>
                                        <TableCell align="right">Quantidade</TableCell>
                                        <TableCell align="right">Preço Unitário</TableCell>
                                        <TableCell align="right">Total</TableCell>
                                    </TableRow>
                                </TableHead>
                                <TableBody>
                                    {orderData.order?.items && orderData.order.items.length > 0 ? (
                                        orderData.order.items.map((item, index) => (
                                            <TableRow key={index}>
                                                <TableCell>
                                                    {item.name || `Item #${index + 1}`}
                                                </TableCell>
                                                <TableCell>
                                                    {item.ean || 'Não informado'}
                                                </TableCell>
                                                <TableCell align="right">{item.quantity}</TableCell>
                                                <TableCell align="right">
                                                    R$ {parseFloat(item.unit_price).toFixed(2).replace('.', ',')}
                                                </TableCell>
                                                <TableCell align="right">
                                                    R$ {(item.unit_price * item.quantity).toFixed(2).replace('.', ',')}
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    ) : (
                                        <TableRow>
                                            <TableCell colSpan={5} align="center">
                                                Nenhum item encontrado
                                            </TableCell>
                                        </TableRow>
                                    )}
                                </TableBody>
                            </Table>
                        </TableContainer>
                    </Box>
                ) : (
                    !loading && (
                        <Typography variant="body1" sx={{ textAlign: 'center', my: 4 }}>
                            Nenhum dado de pedido disponível
                        </Typography>
                    )
                )}
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose} disabled={loading}>
                    Fechar
                </Button>
            </DialogActions>
        </Dialog>
    );
};

export default OrderDetailsModal;