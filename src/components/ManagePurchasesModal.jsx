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
  TextField
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import purchaseService from '../services/purchaseService';

const ManagePurchasesModal = ({ open, onClose, orderId }) => {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (open) {
      loadProducts();
    }
  }, [open]);

  const loadProducts = async () => {
    try {
      setLoading(true);
      setError(null);
      const token = localStorage.getItem('authToken');
      const productsData = await purchaseService.getProducts(token);
      setProducts(productsData.products || []);
    } catch (err) {
      console.error('Error loading products:', err);
      setError(err.message || 'Erro ao carregar produtos');
    } finally {
      setLoading(false);
    }
  };

  const handleAddToPurchase = async (product) => {
    try {
      setLoading(true);
      setError(null);
      setSuccess(null);
      const token = localStorage.getItem('authToken');
      
      const productData = {
        product_id: product.id,
        name: product.name,
        quantity: 1, // Default quantity
        unit_price: product.price
      };
      
      await purchaseService.addProductToPurchase(orderId, productData, token);
      setSuccess(`Produto "${product.name}" adicionado à compra com sucesso!`);
      
      // Clear success message after 3 seconds
      setTimeout(() => {
        setSuccess(null);
      }, 3000);
    } catch (err) {
      console.error('Error adding product to purchase:', err);
      setError(err.message || 'Erro ao adicionar produto à compra');
    } finally {
      setLoading(false);
    }
  };

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (product.ean && product.ean.includes(searchTerm))
  );

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
          {/* Search Field */}
          <TextField
            label="Buscar produtos"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquise por nome ou EAN"
            fullWidth
          />

          {/* Products List */}
          <Box>
            <Typography variant="h6" gutterBottom>
              Produtos Disponíveis
            </Typography>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <List>
                {filteredProducts.length > 0 ? (
                  filteredProducts.map((product) => (
                    <div key={product.id}>
                      <ListItem>
                        <ListItemText
                          primary={`${product.name || 'Nome não informado'}`}
                          secondary={
                            <>
                              <Typography component="span" variant="body2">
                                Preço: R$ {parseFloat(product.price).toFixed(2).replace('.', ',')} | 
                                EAN: {product.ean || 'Não informado'} | 
                                Código: {product.id}
                              </Typography>
                            </>
                          }
                        />
                        <ListItemSecondaryAction>
                          <Button
                            variant="contained"
                            startIcon={<AddIcon />}
                            onClick={() => handleAddToPurchase(product)}
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
                    <ListItemText primary="Nenhum produto encontrado" />
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