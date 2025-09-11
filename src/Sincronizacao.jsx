import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Toolbar,
    Button,
    Paper,
    List,
    ListItem,
    ListItemText,
    Divider,
    Drawer,
    CssBaseline,
    AppBar,
    IconButton,
    CircularProgress,
    Alert,
    TextField,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Grid
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from './Sidebar';

const drawerWidth = 240;

function Sincronizacao() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [syncData, setSyncData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [successMessage, setSuccessMessage] = useState(null);

    // State for product sync functionality
    const [productsToSync, setProductsToSync] = useState([]);
    const [newProduct, setNewProduct] = useState({
        barcode: '',
        name: '',
        value: '',
        stock: '',
        status: true
    });

    useEffect(() => {
        // Check if user is logged in
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/');
        } else {
            // In a real app, you might want to decode the token to get user info
            setUser({ name: 'Usuário' });
            // Fetch sync data from API
            fetchSyncData(token);
        }
    }, [navigate]);

    const fetchSyncData = async (token) => {
        try {
            setLoading(true);
            setError(null);

            const response = await fetch('http://localhost:8090/api/erp/sync/status', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setSyncData(data);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Erro ao carregar status de sincronização');
            }
        } catch (error) {
            console.error('Error fetching sync data:', error);
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

    // Handle input changes for new product
    const handleProductInputChange = (e) => {
        const { name, value } = e.target;
        setNewProduct({
            ...newProduct,
            [name]: name === 'value' || name === 'stock' ? value : value
        });
    };

    // Add product to sync list
    const handleAddProduct = () => {
        if (!newProduct.barcode || !newProduct.name || !newProduct.value || !newProduct.stock) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const product = {
            ...newProduct,
            value: parseFloat(newProduct.value),
            stock: parseInt(newProduct.stock),
            status: newProduct.status === true || newProduct.status === 'true'
        };

        setProductsToSync([...productsToSync, product]);

        // Reset form
        setNewProduct({
            barcode: '',
            name: '',
            value: '',
            stock: '',
            status: true
        });

        setSuccessMessage('Produto adicionado à lista de sincronização.');
        setTimeout(() => setSuccessMessage(null), 3000);
    };

    // Remove product from sync list
    const handleRemoveProduct = (index) => {
        const updatedProducts = [...productsToSync];
        updatedProducts.splice(index, 1);
        setProductsToSync(updatedProducts);
    };

    // Send products to sync endpoint
    const handleSyncProducts = async () => {
        if (productsToSync.length === 0) {
            setError('Adicione pelo menos um produto para sincronizar.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8090/api/erp/products/sync', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ products: productsToSync })
            });

            if (response.ok) {
                setSuccessMessage(`Produtos sincronizados com sucesso! ${productsToSync.length} produtos enviados.`);
                setProductsToSync([]);
                // Refresh sync data
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Erro ao sincronizar produtos');
            }
        } catch (error) {
            console.error('Error syncing products:', error);
            setError('Erro de conexão. Por favor, tente novamente.');
        } finally {
            setLoading(false);
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
                        Portal iFood - Sincronização
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
                        Sincronização
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {successMessage && (
                        <Alert severity="success" sx={{ mb: 2 }}>
                            {successMessage}
                        </Alert>
                    )}

                    <Grid container spacing={3}>
                        {/* Product Sync Section */}
                        <Grid item xs={12} md={6}>
                            <Paper elevation={3} sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Sincronizar Produtos
                                </Typography>

                                <Box sx={{ mb: 3 }}>
                                    <Typography variant="subtitle1" gutterBottom>
                                        Adicionar Produto
                                    </Typography>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Código de Barras"
                                                name="barcode"
                                                value={newProduct.barcode}
                                                onChange={handleProductInputChange}
                                                size="small"
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Nome do Produto"
                                                name="name"
                                                value={newProduct.name}
                                                onChange={handleProductInputChange}
                                                size="small"
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Preço (R$)"
                                                name="value"
                                                type="number"
                                                value={newProduct.value}
                                                onChange={handleProductInputChange}
                                                size="small"
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12} sm={6}>
                                            <TextField
                                                fullWidth
                                                label="Estoque"
                                                name="stock"
                                                type="number"
                                                value={newProduct.stock}
                                                onChange={handleProductInputChange}
                                                size="small"
                                                required
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Button
                                                variant="contained"
                                                onClick={handleAddProduct}
                                                fullWidth
                                            >
                                                Adicionar à Lista
                                            </Button>
                                        </Grid>
                                    </Grid>
                                </Box>

                                <Divider sx={{ my: 2 }} />

                                <Typography variant="subtitle1" gutterBottom>
                                    Produtos para Sincronizar ({productsToSync.length})
                                </Typography>

                                {productsToSync.length > 0 ? (
                                    <>
                                        <TableContainer>
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Nome</TableCell>
                                                        <TableCell align="right">Ações</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {productsToSync.map((product, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell>
                                                                <Typography variant="body2">{product.name}</Typography>
                                                                <Typography variant="caption">
                                                                    {product.barcode} - R$ {product.value.toFixed(2)} - Estoque: {product.stock}
                                                                </Typography>
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                <Button
                                                                    size="small"
                                                                    color="error"
                                                                    onClick={() => handleRemoveProduct(index)}
                                                                >
                                                                    Remover
                                                                </Button>
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        </TableContainer>

                                        <Button
                                            variant="contained"
                                            color="primary"
                                            sx={{ mt: 2 }}
                                            onClick={handleSyncProducts}
                                            disabled={loading}
                                        >
                                            {loading ? <CircularProgress size={24} /> : 'Sincronizar Produtos'}
                                        </Button>
                                    </>
                                ) : (
                                    <Typography variant="body2" color="textSecondary">
                                        Nenhum produto adicionado para sincronização.
                                    </Typography>
                                )}
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}

export default Sincronizacao;