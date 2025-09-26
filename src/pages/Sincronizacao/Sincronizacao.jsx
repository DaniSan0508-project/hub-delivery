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
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    InputAdornment,
    FormControl,
    InputLabel,
    Select,
    MenuItem
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Menu as MenuIcon,
    Search as SearchIcon,
    Sync as SyncIcon,
    Settings as SettingsIcon
} from '@mui/icons-material';
import Sidebar from '../../components/Sidebar';
import productService from '../../services/productService';

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

    const [productsToSync, setProductsToSync] = useState([]);
    const [newProduct, setNewProduct] = useState({
        barcode: '',
        name: '',
        value: '',
        stock: '',
        status: true
    });

    const [syncProdutos, setSyncProdutos] = useState([]);
    const [loadingSyncProdutos, setLoadingSyncProdutos] = useState(false);
    const [errorSyncProdutos, setErrorSyncProdutos] = useState(null);
    const [openSyncProdutosModal, setOpenSyncProdutosModal] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(0);
    const [totalItems, setTotalItems] = useState(0);
    const [searchName, setSearchName] = useState('');
    const [searchBarcode, setSearchBarcode] = useState('');
    const [searchValue, setSearchValue] = useState('');
    const [dateFilterStart, setDateFilterStart] = useState('');
    const [dateFilterEnd, setDateFilterEnd] = useState('');
    const [filterStatus, setFilterStatus] = useState('all');
    const [showFilters, setShowFilters] = useState(false);

    useEffect(() => {
        let isMounted = true;

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
                        fetchSyncData(token);
                    }
                }, 250);
            }
        }

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    const fetchSyncData = async (token) => {
        try {
            setLoading(true);
            setError(null);
        } catch (error) {
            console.error('Error fetching sync data:', error);
            if (error.message && error.message.includes('Sessão expirada')) {
                return;
            }
            setError(error.message || 'Erro de conexão. Por favor, tente novamente.');
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

    const handleProductInputChange = (e) => {
        const { name, value } = e.target;

        if (name === 'value') { // 'value' é o seu campo de preço
            const onlyDigits = value.replace(/\D/g, '');

            if (onlyDigits === '') {
                setNewProduct({ ...newProduct, [name]: '' });
                return;
            }

            const numericValue = parseInt(onlyDigits, 10) / 100;

            const formattedValue = numericValue.toLocaleString('pt-BR', {
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
            });

            setNewProduct({
                ...newProduct,
                [name]: formattedValue
            });

        } else if (name === 'stock') {
            const stockValue = parseInt(value, 10);
            setNewProduct({
                ...newProduct,
                [name]: isNaN(stockValue) ? '' : stockValue,
            });
        } else {
            setNewProduct({
                ...newProduct,
                [name]: value
            });
        }
    };

    const handleAddProduct = () => {
        if (!newProduct.barcode || !newProduct.name || !newProduct.value || !newProduct.stock) {
            setError('Por favor, preencha todos os campos obrigatórios.');
            return;
        }

        const priceAsNumber = unformatCurrency(newProduct.value);

        const product = {
            ...newProduct,
            value: priceAsNumber, // <-- CORREÇÃO APLICADA AQUI
            stock: parseInt(newProduct.stock) || 0,
            status: newProduct.status === true || newProduct.status === 'true'
        };

        setProductsToSync([...productsToSync, product]);

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

    const unformatCurrency = (value) => {
        if (typeof value !== 'string') {
            return 0;
        }
        const normalizedValue = value.replace(/\./g, '').replace(',', '.');
        return parseFloat(normalizedValue) || 0;
    };

    const handleRemoveProduct = (index) => {
        const updatedProducts = [...productsToSync];
        updatedProducts.splice(index, 1);
        setProductsToSync(updatedProducts);
    };

    const handleSyncProducts = async () => {
        if (productsToSync.length === 0) {
            setError('Adicione pelo menos um produto para sincronizar.');
            return;
        }

        try {
            setLoading(true);
            setError(null);

            const token = localStorage.getItem('authToken');
            const response = await productService.syncProducts(productsToSync, token);

            setSuccessMessage(`Produtos sincronizados com sucesso! ${productsToSync.length} produtos enviados.`);
            setProductsToSync([]);
            fetchSyncData(token);
        } catch (error) {
            console.error('Error syncing products:', error);
            if (error.message && error.message.includes('Sessão expirada')) {
                return;
            }
            setError(error.message || 'Erro de conexão. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const fetchSyncProdutos = async (page = 1) => {
        try {
            setLoadingSyncProdutos(true);
            setErrorSyncProdutos(null);

            const token = localStorage.getItem('authToken');
            const params = new URLSearchParams({
                page: page,
                per_page: 10
            });

            if (searchName) {
                params.append('name', searchName);
            }

            if (searchBarcode) {
                params.append('barcode', searchBarcode);
            }

            if (searchValue) {
                params.append('value', searchValue);
            }

            if (dateFilterStart) {
                params.append('created_at_start', dateFilterStart);
            }
            if (dateFilterEnd) {
                params.append('created_at_end', dateFilterEnd);
            }

            if (filterStatus !== 'all') {
                params.append('status', filterStatus === 'active' ? '1' : '0');
            }


            const response = await fetch(`http://localhost:8090/api/hub/local/items?${params}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });


            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data = await response.json();


            setSyncProdutos(data.data || []);
            setTotalPages(data.pagination?.total_pages || 1);
            setTotalItems(data.pagination?.total || 0);
            setCurrentPage(data.pagination?.current_page || 1);
        } catch (error) {
            console.error('Error fetching sync produtos:', error);
            setErrorSyncProdutos(error.message || 'Erro ao carregar produtos sincronizados.');
        } finally {
            setLoadingSyncProdutos(false);
        }
    };

    const handleOpenSyncProdutosModal = () => {
        setCurrentPage(1); // Reset to first page when opening
        fetchSyncProdutos(1);
        setOpenSyncProdutosModal(true);
    };

    const handleCloseSyncProdutosModal = () => {
        setOpenSyncProdutosModal(false);
    };

    const handlePageChange = (newPage) => {
        setCurrentPage(newPage);
        fetchSyncProdutos(newPage);
    };

    const handleSearchNameChange = (e) => {
        setSearchName(e.target.value);
    };

    const handleSearchBarcodeChange = (e) => {
        setSearchBarcode(e.target.value);
    };

    const handleFilterStatusChange = (e) => {
        setFilterStatus(e.target.value);
    };

    const handleSearchSubmit = () => {
        setCurrentPage(1); // Reset to first page when searching
        fetchSyncProdutos(1);
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
                        Sysfar HubDelivery - Sincronização
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
                                            value={newProduct.value}
                                            onChange={handleProductInputChange}
                                            size="small"
                                            required
                                            inputProps={{
                                                inputMode: 'decimal',
                                                pattern: '[0-9]*(,[0-9]{2})?',
                                                placeholder: '0,00'
                                            }}
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
                                    <Grid item xs={12} sm={6}>
                                        <TextField
                                            select
                                            fullWidth
                                            label="Status"
                                            name="status"
                                            value={newProduct.status}
                                            onChange={(e) => setNewProduct({
                                                ...newProduct,
                                                status: e.target.value === 'true'
                                            })}
                                            size="small"
                                            required
                                            SelectProps={{
                                                native: true,
                                            }}
                                        >
                                            <option value="true">Ativo</option>
                                            <option value="false">Inativo</option>
                                        </TextField>
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
                                                                {product.barcode} - R$ {product.value.toFixed(2)} - Estoque: {product.stock} - Status: {product.status ? 'Ativo' : 'Inativo'}
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

                    {/* Section for Sync Produtos */}
                    <Grid item xs={12} md={6}>
                        <Paper elevation={3} sx={{ p: 3 }}>
                            <Typography variant="h6" gutterBottom>
                                Produtos Sincronizados
                            </Typography>
                            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                                Visualize os produtos sincronizados com o hub
                            </Typography>

                            <Button
                                variant="contained"
                                startIcon={<SyncIcon />}
                                onClick={handleOpenSyncProdutosModal}
                                fullWidth
                            >
                                Visualizar Produtos Sincronizados
                            </Button>
                        </Paper>
                    </Grid>
                </Grid>

                {/* Modal for Sync Produtos */}
                <Dialog
                    open={openSyncProdutosModal}
                    onClose={handleCloseSyncProdutosModal}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>
                        Produtos Sincronizados
                    </DialogTitle>

                    <DialogContent dividers>
                        {errorSyncProdutos && (
                            <Alert severity="error" sx={{ mb: 2 }}>
                                {errorSyncProdutos}
                            </Alert>
                        )}

                        {/* Filters toggle */}
                        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                            <Typography variant="h6">Filtros</Typography>
                            <IconButton
                                onClick={() => setShowFilters(!showFilters)}
                                color="primary"
                            >
                                <SettingsIcon />
                            </IconButton>
                        </Box>

                        {showFilters && (
                            <Grid container spacing={2} sx={{ mb: 2 }}>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Buscar por Nome"
                                        variant="outlined"
                                        size="small"
                                        value={searchName}
                                        onChange={handleSearchNameChange}
                                        InputProps={{
                                            endAdornment: (
                                                <InputAdornment position="end">
                                                    <SearchIcon
                                                        onClick={handleSearchSubmit}
                                                        style={{ cursor: 'pointer' }}
                                                    />
                                                </InputAdornment>
                                            ),
                                        }}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearchSubmit();
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Buscar por Código de Barras"
                                        variant="outlined"
                                        size="small"
                                        value={searchBarcode}
                                        onChange={handleSearchBarcodeChange}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearchSubmit();
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <TextField
                                        fullWidth
                                        label="Buscar por Valor"
                                        variant="outlined"
                                        size="small"
                                        value={searchValue}
                                        onChange={(e) => setSearchValue(e.target.value)}
                                        onKeyPress={(e) => {
                                            if (e.key === 'Enter') {
                                                handleSearchSubmit();
                                            }
                                        }}
                                    />
                                </Grid>
                                <Grid item xs={12} sm={6}>
                                    <FormControl fullWidth size="small">
                                        <InputLabel>Status</InputLabel>
                                        <Select
                                            value={filterStatus}
                                            label="Status"
                                            onChange={handleFilterStatusChange}
                                        >
                                            <MenuItem value="all">Todos</MenuItem>
                                            <MenuItem value="active">Ativo</MenuItem>
                                            <MenuItem value="inactive">Inativo</MenuItem>
                                        </Select>
                                    </FormControl>
                                </Grid>
                                <Grid item xs={12} sm={6}>
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
                                <Grid item xs={12} sm={6}>
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
                                <Grid item xs={12}>
                                    <Button
                                        variant="contained"
                                        onClick={handleSearchSubmit}
                                        sx={{ mr: 1 }}
                                    >
                                        Filtrar
                                    </Button>
                                    <Button
                                        variant="outlined"
                                        onClick={() => {
                                            setSearchName('');
                                            setSearchBarcode('');
                                            setSearchValue('');
                                            setDateFilterStart('');
                                            setDateFilterEnd('');
                                            setFilterStatus('all');
                                            setCurrentPage(1);
                                            fetchSyncProdutos(1);
                                        }}
                                    >
                                        Limpar Filtros
                                    </Button>
                                </Grid>
                            </Grid>
                        )}

                        {loadingSyncProdutos ? (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        ) : (
                            <>
                                {/* Products Table */}
                                <TableContainer>
                                    <Table size="small">
                                        <TableHead>
                                            <TableRow>
                                                <TableCell>Nome</TableCell>
                                                <TableCell>Código de Barras</TableCell>
                                                <TableCell align="right">Preço</TableCell>
                                                <TableCell align="center">Estoque</TableCell>
                                                <TableCell align="center">Ativo</TableCell>
                                                <TableCell align="center">Sincronizado</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {syncProdutos && syncProdutos.length > 0 ? (
                                                syncProdutos.map((produto, index) => (
                                                    <TableRow key={index}>
                                                        <TableCell>
                                                            <Typography variant="body2">
                                                                {produto.name || 'Nome não informado'}
                                                            </Typography>
                                                            {produto.brand && (
                                                                <Typography variant="caption" color="textSecondary">
                                                                    Marca: {produto.brand}
                                                                </Typography>
                                                            )}
                                                        </TableCell>
                                                        <TableCell>{produto.barcode || 'N/A'}</TableCell>
                                                        <TableCell align="right">R$ {(parseFloat(produto.value || 0)).toFixed(2)}</TableCell>
                                                        <TableCell align="center">{produto.stock_quantity || 0}</TableCell>
                                                        <TableCell align="center">
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: produto.status ? 'success.main' : 'error.main'
                                                                }}
                                                            >
                                                                {produto.status ? 'Ativo' : 'Inativo'}
                                                            </Typography>
                                                        </TableCell>
                                                        <TableCell align="center">
                                                            <Typography
                                                                variant="caption"
                                                                sx={{
                                                                    color: produto.sync_status === 'synced' ? 'success.main' : 'warning.main'
                                                                }}
                                                            >
                                                                {produto.sync_status === 'synced' ? 'Sincronizado' : 'Não sincronizado'}
                                                            </Typography>
                                                        </TableCell>
                                                    </TableRow>
                                                ))
                                            ) : (
                                                <TableRow>
                                                    <TableCell colSpan={6} align="center">
                                                        Nenhum produto encontrado
                                                    </TableCell>
                                                </TableRow>
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>

                                {/* Pagination info */}
                                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                                    <Typography variant="body2" color="textSecondary">
                                        Mostrando {(currentPage - 1) * 10 + 1} - {Math.min(currentPage * 10, totalItems)} de {totalItems} produtos
                                    </Typography>

                                    <Box sx={{ display: 'flex', gap: 1 }}>
                                        <Button
                                            variant="outlined"
                                            size="small"
                                            disabled={currentPage === 1}
                                            onClick={() => handlePageChange(currentPage - 1)}
                                        >
                                            Anterior
                                        </Button>

                                        <Typography variant="body2" sx={{
                                            display: 'flex',
                                            alignItems: 'center',
                                            px: 2
                                        }}>
                                            Página {currentPage} de {totalPages}
                                        </Typography>

                                        <Button
                                            variant="outlined"
                                            size="small"
                                            disabled={currentPage === totalPages}
                                            onClick={() => handlePageChange(currentPage + 1)}
                                        >
                                            Próxima
                                        </Button>
                                    </Box>
                                </Box>
                            </>
                        )}
                    </DialogContent>

                    <DialogActions>
                        <Button onClick={handleCloseSyncProdutosModal}>Fechar</Button>
                    </DialogActions>
                </Dialog>
            </Box>
        </Box >
    );
}

export default Sincronizacao;