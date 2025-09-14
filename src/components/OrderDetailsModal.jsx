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
  Chip
} from '@mui/material';
import orderService from '../services/orderService';

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

  // Calculate total order value
  const calculateOrderTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
  };

  // Get the first order from the array
  console.log('order:', order);
  // Verificar se order é um objeto com propriedade orders que é um array
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
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Box>
                <Typography variant="h6">
                  Cliente: {orderData.consumer?.name || 'Não informado'}
                </Typography>
                <Typography variant="body2">
                  Documento: {orderData.consumer?.document?.type || ''} {orderData.consumer?.document?.number || ''}
                </Typography>
                <Chip
                  label={getStatusText(orderData.order?.status)}
                  color={getStatusColor(orderData.order?.status)}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </Box>
              <Typography variant="h6">
                Total: R$ {calculateOrderTotal(orderData.order?.items).toFixed(2).replace('.', ',')}
              </Typography>
            </Box>

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