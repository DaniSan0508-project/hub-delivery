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
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider,
  CircularProgress,
  TextField,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import sellableItemsService from '../services/sellableItemsService';
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
      return 'Separação finalizada';
    case 'Dispatched':
      return 'Despachado';
    case 'Concluded':
      return 'Concluído';
    default:
      return status;
  }
};

const ManagePurchasesModal = ({ open, onClose, orderId }) => {
  const [sellableItems, setSellableItems] = useState([]);
  const [order, setOrder] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const loadOrderDetails = async () => {
      try {
        const token = localStorage.getItem('authToken');
        const orderData = await orderService.getOrderDetails(orderId, token);
        setOrder(orderData);
      } catch (err) {
        console.error('Error loading order details:', err);
        setError(err.message || 'Erro ao carregar detalhes do pedido');
      }
    };

    const loadSellableItems = async (search = '') => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        const items = await sellableItemsService.getSellableItems(token);
        
        // Filtrar itens com base no termo de busca
        const filteredItems = search 
          ? items.filter(item => 
              item.itemName?.toLowerCase().includes(search.toLowerCase()) ||
              item.itemEan?.toLowerCase().includes(search.toLowerCase()) ||
              item.itemExternalCode?.toLowerCase().includes(search.toLowerCase())
            )
          : items;
          
        setSellableItems(filteredItems);
      } catch (err) {
        console.error('Error loading sellable items:', err);
        setError(err.message || 'Erro ao carregar itens vendáveis');
      } finally {
        setLoading(false);
      }
    };

    if (open) {
      loadSellableItems();
      loadOrderDetails();
    }
  }, [open, orderId]);

  const handleSearch = (term) => {
    setSearchTerm(term);
    const loadSellableItems = async (search = '') => {
      try {
        setLoading(true);
        setError(null);
        const token = localStorage.getItem('authToken');
        const items = await sellableItemsService.getSellableItems(token);
        
        // Filtrar itens com base no termo de busca
        const filteredItems = search 
          ? items.filter(item => 
              item.itemName?.toLowerCase().includes(search.toLowerCase()) ||
              item.itemEan?.toLowerCase().includes(search.toLowerCase()) ||
              item.itemExternalCode?.toLowerCase().includes(search.toLowerCase())
            )
          : items;
          
        setSellableItems(filteredItems);
      } catch (err) {
        console.error('Error loading sellable items:', err);
        setError(err.message || 'Erro ao carregar itens vendáveis');
      } finally {
        setLoading(false);
      }
    };
    loadSellableItems(term);
  };

  const handleAddToPurchase = async (item) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem('authToken');
      
      // Obter o ID do pedido no nosso sistema
      const orderData = order && order.orders && Array.isArray(order.orders) && order.orders.length > 0 
        ? order.orders[0] 
        : (order && Array.isArray(order) && order.length > 0 ? order[0] : null);
      
      const internalOrderId = orderData?.order?.id;
      
      if (!internalOrderId) {
        throw new Error('Não foi possível obter o ID do pedido');
      }
      
      // Usar a estrutura de dados correta para adicionar item ao pedido
      const itemData = {
        item_id: item.itemId,
        quantity: 1, // Default quantity
        ean: item.itemEan || null
      };
      
      await orderService.addOrderItem(internalOrderId, itemData, token);
      setSuccess(`Produto "${item.itemName}" adicionado à compra com sucesso!`);
      
      // Reload order details to show updated items
      const loadOrderDetails = async () => {
        try {
          const token = localStorage.getItem('authToken');
          const orderData = await orderService.getOrderDetails(orderId, token);
          setOrder(orderData);
        } catch (err) {
          console.error('Error loading order details:', err);
          setError(err.message || 'Erro ao carregar detalhes do pedido');
        }
      };
      await loadOrderDetails();
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error adding item to purchase:', err);
      setError(err.message || 'Erro ao adicionar item à compra');
    } finally {
      setLoading(false);
    }
  };

  // Calculate total order value
  const calculateOrderTotal = (items) => {
    if (!items || !Array.isArray(items)) return 0;
    return items.reduce((total, item) => total + (item.unit_price * item.quantity), 0);
  };

  // Get the first order from the array
  const orderData = order && order.orders && Array.isArray(order.orders) && order.orders.length > 0 
    ? order.orders[0] 
    : (order && Array.isArray(order) && order.length > 0 ? order[0] : null);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="md" fullWidth>
      <DialogTitle>Gerenciar Compras - Pedido #{String(orderId).substring(0, 8)}</DialogTitle>
      <DialogContent>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 2 }}>
            {success}
          </Alert>
        )}

        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
          {/* Order Info */}
          {orderData && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Box>
                <Typography variant="h6">
                  Cliente: {orderData.consumer?.name || 'Não informado'}
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
          )}

          {/* Order Items */}
          {orderData && orderData.order?.items && orderData.order.items.length > 0 && (
            <Box sx={{ mb: 3 }}>
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
                    {orderData.order.items.map((item, index) => (
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
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </Box>
          )}

          {/* Search Field */}
          <TextField
            label="Buscar itens vendáveis"
            value={searchTerm}
            onChange={(e) => handleSearch(e.target.value)}
            placeholder="Pesquise por nome, EAN ou código externo"
            fullWidth
          />

          {/* Sellable Items List */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Itens Vendáveis Disponíveis
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {sellableItems.length > 0 ? (
                  sellableItems.map((item) => (
                    <div key={item.itemId}>
                      <ListItem>
                        <ListItemText
                          primary={`${item.itemName || 'Nome não informado'}`}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                Preço: R$ {parseFloat(item.itemPrice?.value || 0).toFixed(2).replace('.', ',')} | 
                                EAN: {item.itemEan || 'Não informado'} | 
                                Código Externo: {item.itemExternalCode || 'Não informado'}
                              </Typography>
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddToPurchase(item)}
                            disabled={loading}
                          >
                            Adicionar à Compra
                          </Button>
                        </ListItemSecondaryAction>
                      </ListItem>
                      <Divider />
                    </div>
                  ))
                ) : (
                  <ListItem>
                    <ListItemText primary="Nenhum item vendável encontrado" />
                  </ListItem>
                )}
              </List>
            )}
          </Box>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose} disabled={loading}>
          Fechar
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default ManagePurchasesModal;