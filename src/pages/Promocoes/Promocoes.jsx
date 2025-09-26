import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
    Drawer,
    CssBaseline,
    AppBar,
    IconButton,
    CircularProgress,
    Alert,
    Tabs,
    Tab,
    Chip,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    MenuItem,
    FormControl,
    InputLabel,
    Select,
    Grid,
    Card,
    CardContent,
    Pagination,
    Divider,
    Fab,
    Tooltip
} from '@mui/material';
import { Menu as MenuIcon, Add as AddIcon, Remove as RemoveIcon, Visibility as VisibilityIcon } from '@mui/icons-material';
import Sidebar from '../../components/Sidebar';
import promotionService from '../../services/promotionService';
import { useQuery, useQueryClient } from '@tanstack/react-query';

function Promocoes() {
    const navigate = useNavigate();
    const queryClient = useQueryClient();
    const [user, setUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [activeTab, setActiveTab] = useState(0);
    const [selectedPromotion, setSelectedPromotion] = useState(null);
    const [openDetailDialog, setOpenDetailDialog] = useState(false);
    const [openCreateDialog, setOpenCreateDialog] = useState(false);
    const [page, setPage] = useState(1);
    const [rowsPerPage] = useState(10);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/');
        } else {
            setUser({ name: 'Usuário' });
        }
    }, [navigate]);

    const { data: promotionsData, isLoading, error, refetch } = useQuery({
        queryKey: ['promotions'],
        queryFn: async () => {
            const token = localStorage.getItem('authToken');
            return await promotionService.getPromotions(token);
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
        cacheTime: 1000 * 60 * 10, // 10 minutes,
        onError: (error) => {
            if (error.message && error.message.includes('Sessão expirada')) {
                return;
            }
        }
    });

    const paginatedPromotions = promotionsData ?
        promotionsData.slice((page - 1) * rowsPerPage, page * rowsPerPage) : [];

    const totalPages = promotionsData ?
        Math.ceil(promotionsData.length / rowsPerPage) : 0;

    const fetchPromotionDetails = async (aggregationId) => {
        try {
            const token = localStorage.getItem('authToken');
            const details = await promotionService.getPromotionById(aggregationId, token);
            setSelectedPromotion(details);
            setOpenDetailDialog(true);
        } catch (err) {
            console.error('Error fetching promotion details:', err);
            if (err.message && err.message.includes('Sessão expirada')) {
                return;
            }
        }
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const handleTabChange = (event, newValue) => {
        setActiveTab(newValue);
    };

    const handleViewDetails = (aggregationId) => {
        fetchPromotionDetails(aggregationId);
    };

    const handlePageChange = (event, value) => {
        setPage(value);
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('pt-BR');
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'ACTIVE': return 'success';
            case 'ERROR': return 'error';
            case 'PENDING': return 'warning';
            default: return 'default';
        }
    };

    if (!user) {
        return null;
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
                        Sysfar HubDelivery - Promoções
                    </Typography>
                    <Button color="inherit" onClick={handleLogout}>Sair</Button>
                </Toolbar>
            </AppBar>
            <Box
                component="nav"
                sx={{ width: { sm: 240 }, flexShrink: { sm: 0 } }}
                aria-label="menu"
            >
                <Drawer
                    variant="temporary"
                    open={mobileOpen}
                    onClose={handleDrawerToggle}
                    ModalProps={{
                        keepMounted: true,
                    }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                    }}
                >
                    <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
                    }}
                    open
                >
                    <Sidebar mobileOpen={mobileOpen} handleDrawerToggle={handleDrawerToggle} />
                </Drawer>
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - 240px)` } }}>
                <Toolbar />
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                    <Typography variant="h6" color="grey">
                        Promoções
                    </Typography>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={() => setOpenCreateDialog(true)}
                    >
                        Nova Promoção
                    </Button>
                </Box>

                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error.message || 'Erro ao carregar promoções'}
                    </Alert>
                )}

                <Paper elevation={3} sx={{ p: 3 }}>
                    <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 2 }}>
                        <Tab label="Todas as Promoções" />
                    </Tabs>

                    {isLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {promotionsData && promotionsData.length > 0 ? (
                                <>
                                    <TableContainer>
                                        <Table>
                                            <TableHead>
                                                <TableRow>
                                                    <TableCell>Tag de Agregação</TableCell>
                                                    <TableCell>Data de Criação</TableCell>
                                                    <TableCell>Ações</TableCell>
                                                </TableRow>
                                            </TableHead>
                                            <TableBody>
                                                {paginatedPromotions.map((promotion) => (
                                                    <TableRow key={promotion.id}>
                                                        <TableCell>{promotion.aggregation_tag}</TableCell>
                                                        <TableCell>{formatDate(promotion.created_at)}</TableCell>
                                                        <TableCell>
                                                            <Button
                                                                size="small"
                                                                startIcon={<VisibilityIcon />}
                                                                onClick={() => handleViewDetails(promotion.aggregation_id)}
                                                            >
                                                                Detalhes
                                                            </Button>
                                                        </TableCell>
                                                    </TableRow>
                                                ))}
                                            </TableBody>
                                        </Table>
                                    </TableContainer>
                                    {totalPages > 1 && (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
                                            <Pagination
                                                count={totalPages}
                                                page={page}
                                                onChange={handlePageChange}
                                                color="primary"
                                            />
                                        </Box>
                                    )}
                                </>
                            ) : (
                                <Typography variant="body1" color="textSecondary" align="center" sx={{ py: 4 }}>
                                    Nenhuma promoção encontrada
                                </Typography>
                            )}
                        </>
                    )}
                </Paper>

                {/* Dialog de Detalhes da Promoção */}
                <Dialog
                    open={openDetailDialog}
                    onClose={() => setOpenDetailDialog(false)}
                    maxWidth="md"
                    fullWidth
                >
                    <DialogTitle>Detalhes da Promoção</DialogTitle>
                    <DialogContent>
                        {selectedPromotion ? (
                            <Box sx={{ mt: 2 }}>
                                {selectedPromotion.promotions && selectedPromotion.promotions.map((item, index) => (
                                    <Card key={index} sx={{ mb: 2 }}>
                                        <CardContent>
                                            <Grid container spacing={2}>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="h6" gutterBottom>
                                                        {item.promotionName}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        EAN: {item.ean}
                                                    </Typography>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Tipo: {item.promotionType}
                                                    </Typography>
                                                </Grid>
                                                <Grid item xs={12} md={6}>
                                                    <Typography variant="body2">
                                                        Período: {formatDate(item.initialDate)} - {formatDate(item.finalDate)}
                                                    </Typography>
                                                    <Chip
                                                        label={item.status}
                                                        color={getStatusColor(item.status)}
                                                        size="small"
                                                        sx={{ mt: 1 }}
                                                    />
                                                    {item.error && (
                                                        <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                                                            Erro: {item.error}
                                                        </Typography>
                                                    )}
                                                </Grid>
                                                {item.progressiveDiscount && (
                                                    <Grid item xs={12}>
                                                        <Typography variant="body2">
                                                            Desconto Progressivo: Leve {item.progressiveDiscount.quantityToBuy},
                                                            Pague {item.progressiveDiscount.quantityToPay}
                                                        </Typography>
                                                    </Grid>
                                                )}
                                            </Grid>
                                        </CardContent>
                                    </Card>
                                ))}
                            </Box>
                        ) : (
                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                                <CircularProgress />
                            </Box>
                        )}
                    </DialogContent>
                    <DialogActions>
                        <Button onClick={() => setOpenDetailDialog(false)}>Fechar</Button>
                    </DialogActions>
                </Dialog>

                {/* Dialog de Criação de Promoção */}
                <CreatePromotionDialog
                    open={openCreateDialog}
                    onClose={() => setOpenCreateDialog(false)}
                    onPromotionCreated={() => {
                        setOpenCreateDialog(false);
                        refetch();
                        queryClient.invalidateQueries(['promotions']);
                    }}
                />
            </Box>
        </Box>
    );
}

function CreatePromotionDialog({ open, onClose, onPromotionCreated }) {
    const [formData, setFormData] = useState({
        promotionName: '',
        channels: ['IFOOD-APP'],
        initialDate: '',
        finalDate: '',
        promotionType: 'PERCENTAGE',
        discountValue: '',
        quantityToBuy: '',
        quantityToPay: ''
    });

    const [products, setProducts] = useState([
        { ean: '', id: Date.now() }
    ]);

    const handleAddProduct = () => {
        setProducts(prev => [
            ...prev,
            { ean: '', id: Date.now() }
        ]);
    };

    const handleRemoveProduct = (id) => {
        if (products.length > 1) {
            setProducts(prev => prev.filter(product => product.id !== id));
        }
    };

    const handleProductChange = (id, ean) => {
        setProducts(prev =>
            prev.map(product =>
                product.id === id ? { ...product, ean } : product
            )
        );
    };
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handlePromotionTypeChange = (e) => {
        const value = e.target.value;
        setFormData(prev => ({
            ...prev,
            promotionType: value,
            discountValue: value === 'LXPY' ? '' : prev.discountValue,
            quantityToBuy: value === 'PERCENTAGE' ? '' : prev.quantityToBuy,
            quantityToPay: value !== 'LXPY' ? '' : prev.quantityToPay
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (!formData.promotionName) {
            setError('Nome da promoção é obrigatório');
            setLoading(false);
            return;
        }

        if (products.length === 0 || products.every(product => !product.ean)) {
            setError('Pelo menos um EAN de produto é obrigatório');
            setLoading(false);
            return;
        }

        if (products.some(product => !product.ean)) {
            setError('Todos os produtos devem ter o EAN preenchido');
            setLoading(false);
            return;
        }

        if (!formData.initialDate || !formData.finalDate) {
            setError('Datas inicial e final são obrigatórias');
            setLoading(false);
            return;
        }

        if (formData.promotionType === 'PERCENTAGE' && !formData.discountValue) {
            setError('Valor do desconto é obrigatório para promoções PERCENTAGE');
            setLoading(false);
            return;
        }

        if (formData.promotionType === 'LXPY' && (!formData.quantityToBuy || !formData.quantityToPay)) {
            setError('Quantidade a comprar e a pagar são obrigatórias para promoções LXPY');
            setLoading(false);
            return;
        }

        if (formData.promotionType === 'PERCENTAGE_PER_X_UNITS' && (!formData.discountValue || !formData.quantityToBuy)) {
            setError('Valor do desconto e quantidade a comprar são obrigatórias para promoções PERCENTAGE_PER_X_UNITS');
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem('authToken');

            const items = products.map(product => {
                const item = {
                    ean: product.ean,
                    initialDate: formData.initialDate,
                    finalDate: formData.finalDate,
                    promotionType: formData.promotionType
                };

                if (formData.promotionType === 'PERCENTAGE') {
                    item.discountValue = parseFloat(formData.discountValue);
                } else if (formData.promotionType === 'LXPY') {
                    item.discountValue = null;
                    item.progressiveDiscount = {
                        quantityToBuy: parseInt(formData.quantityToBuy),
                        quantityToPay: parseInt(formData.quantityToPay)
                    };
                } else if (formData.promotionType === 'PERCENTAGE_PER_X_UNITS') {
                    item.discountValue = parseFloat(formData.discountValue);
                    item.progressiveDiscount = {
                        quantityToBuy: parseInt(formData.quantityToBuy)
                    };
                }

                return item;
            });

            const promotionData = {
                aggregationTag: `promocao-${formData.promotionType.toLowerCase()}-${Date.now()}`,
                promotions: [
                    {
                        promotionName: formData.promotionName,
                        channels: formData.channels,
                        items: items
                    }
                ]
            };

            await promotionService.createPromotion(promotionData, token);
            onPromotionCreated();
            setFormData({
                promotionName: '',
                channels: ['IFOOD-APP'],
                initialDate: '',
                finalDate: '',
                promotionType: 'PERCENTAGE',
                discountValue: '',
                quantityToBuy: '',
                quantityToPay: ''
            });
            setProducts([
                { ean: '', id: Date.now() }
            ]);
        } catch (err) {
            if (err.message && err.message.includes('Sessão expirada')) {
                return;
            }
            setError(err.message || 'Erro ao criar promoção');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
            <DialogTitle>Criar Nova Promoção</DialogTitle>
            <DialogContent>
                {error && (
                    <Alert severity="error" sx={{ mb: 2 }}>
                        {error}
                    </Alert>
                )}
                <Box component="form" onSubmit={handleSubmit} sx={{ mt: 2 }}>
                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="h6" component="div" gutterBottom>
                                                Informações Básicas
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                                Preencha as informações gerais da promoção
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <TextField
                                                fullWidth
                                                required
                                                label="Nome da Promoção"
                                                name="promotionName"
                                                value={formData.promotionName}
                                                onChange={handleChange}
                                                variant="outlined"
                                                helperText="Um nome descritivo para identificar esta promoção"
                                            />
                                        </Grid>
                                        <Grid item xs={12}>
                                            <Card variant="outlined">
                                                <CardContent>
                                                    <Grid container spacing={2} alignItems="center">
                                                        <Grid item xs={12}>
                                                            <Typography variant="h6" component="div" gutterBottom>
                                                                Produtos na Promoção
                                                            </Typography>
                                                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                                                Adicione os produtos que participarão desta promoção
                                                            </Typography>
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            {products.map((product, index) => (
                                                                <Grid container spacing={2} key={product.id} alignItems="center" sx={{ mb: 2 }}>
                                                                    <Grid item xs>
                                                                        <TextField
                                                                            fullWidth
                                                                            required
                                                                            label={`EAN do Produto #${index + 1}`}
                                                                            value={product.ean}
                                                                            onChange={(e) => handleProductChange(product.id, e.target.value)}
                                                                            variant="outlined"
                                                                            helperText="Código EAN do produto que receberá a promoção"
                                                                        />
                                                                    </Grid>
                                                                    <Grid item>
                                                                        {products.length > 1 && (
                                                                            <Tooltip title="Remover produto">
                                                                                <IconButton
                                                                                    color="error"
                                                                                    onClick={() => handleRemoveProduct(product.id)}
                                                                                    size="small"
                                                                                >
                                                                                    <RemoveIcon />
                                                                                </IconButton>
                                                                            </Tooltip>
                                                                        )}
                                                                    </Grid>
                                                                </Grid>
                                                            ))}
                                                        </Grid>
                                                        <Grid item xs={12}>
                                                            <Button
                                                                variant="outlined"
                                                                startIcon={<AddIcon />}
                                                                onClick={handleAddProduct}
                                                                size="small"
                                                            >
                                                                Adicionar outro produto
                                                            </Button>
                                                        </Grid>
                                                    </Grid>
                                                </CardContent>
                                            </Card>
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                required
                                                label="Data Inicial"
                                                type="date"
                                                name="initialDate"
                                                value={formData.initialDate}
                                                onChange={handleChange}
                                                InputLabelProps={{ shrink: true }}
                                                variant="outlined"
                                                helperText="Data de início da promoção"
                                            />
                                        </Grid>
                                        <Grid item xs={12} md={6}>
                                            <TextField
                                                fullWidth
                                                required
                                                label="Data Final"
                                                type="date"
                                                name="finalDate"
                                                value={formData.finalDate}
                                                onChange={handleChange}
                                                InputLabelProps={{ shrink: true }}
                                                variant="outlined"
                                                helperText="Data de término da promoção"
                                            />
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        <Grid item xs={12}>
                            <Card variant="outlined">
                                <CardContent>
                                    <Grid container spacing={2}>
                                        <Grid item xs={12}>
                                            <Typography variant="h6" component="div" gutterBottom>
                                                Tipo de Promoção
                                            </Typography>
                                            <Typography variant="body2" color="textSecondary" gutterBottom>
                                                Selecione o tipo de promoção e configure os parâmetros específicos
                                            </Typography>
                                        </Grid>
                                        <Grid item xs={12}>
                                            <FormControl fullWidth required variant="outlined">
                                                <InputLabel>Tipo de Promoção</InputLabel>
                                                <Select
                                                    name="promotionType"
                                                    value={formData.promotionType}
                                                    onChange={handlePromotionTypeChange}
                                                    label="Tipo de Promoção"
                                                >
                                                    <MenuItem value="PERCENTAGE">Percentual de Desconto (%)</MenuItem>
                                                    <MenuItem value="LXPY">Leve X Pague Y</MenuItem>
                                                    <MenuItem value="PERCENTAGE_PER_X_UNITS">Percentual de Desconto na Xª Unidade</MenuItem>
                                                </Select>
                                            </FormControl>
                                        </Grid>
                                    </Grid>
                                </CardContent>
                            </Card>
                        </Grid>

                        {/* Campos condicionais baseados no tipo de promoção */}
                        {formData.promotionType === 'PERCENTAGE' && (
                            <Grid item xs={12}>
                                <Card variant="outlined" sx={{ borderColor: 'primary.main' }}>
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="h6" component="div" gutterBottom color="primary">
                                                    Configuração: Percentual de Desconto (%)
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                                    Defina o percentual de desconto aplicado ao produto
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} md={6}>
                                                <TextField
                                                    fullWidth
                                                    required
                                                    label="Percentual de Desconto (%)"
                                                    type="number"
                                                    name="discountValue"
                                                    value={formData.discountValue}
                                                    onChange={handleChange}
                                                    InputProps={{ inputProps: { min: 0, max: 70, step: 0.1 } }}
                                                    helperText="Máximo permitido: 70%"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}

                        {formData.promotionType === 'LXPY' && (
                            <Grid item xs={12}>
                                <Card variant="outlined" sx={{ borderColor: 'secondary.main' }}>
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="h6" component="div" gutterBottom color="secondary">
                                                    Configuração: Leve X Pague Y
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                                    Defina a quantidade de produtos que o cliente deve levar e quantos irá pagar
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    required
                                                    label="Leve (Quantidade)"
                                                    type="number"
                                                    name="quantityToBuy"
                                                    value={formData.quantityToBuy}
                                                    onChange={handleChange}
                                                    InputProps={{ inputProps: { min: 1 } }}
                                                    helperText="Quantidade de produtos que o cliente deve levar"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    required
                                                    label="Pague (Quantidade)"
                                                    type="number"
                                                    name="quantityToPay"
                                                    value={formData.quantityToPay}
                                                    onChange={handleChange}
                                                    InputProps={{ inputProps: { min: 1 } }}
                                                    helperText="Quantidade de produtos que o cliente irá pagar"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}

                        {formData.promotionType === 'PERCENTAGE_PER_X_UNITS' && (
                            <Grid item xs={12}>
                                <Card variant="outlined" sx={{ borderColor: 'success.main' }}>
                                    <CardContent>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <Typography variant="h6" component="div" gutterBottom sx={{ color: 'success.main' }}>
                                                    Configuração: Percentual de Desconto na Xª Unidade
                                                </Typography>
                                                <Typography variant="body2" color="textSecondary" gutterBottom>
                                                    Defina o percentual de desconto aplicado a uma unidade específica
                                                </Typography>
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    required
                                                    label="Desconto na Unidade (%)"
                                                    type="number"
                                                    name="discountValue"
                                                    value={formData.discountValue}
                                                    onChange={handleChange}
                                                    InputProps={{ inputProps: { min: 0, max: 70, step: 0.1 } }}
                                                    helperText="Máximo permitido: 70%"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    required
                                                    label="Na Xª Unidade"
                                                    type="number"
                                                    name="quantityToBuy"
                                                    value={formData.quantityToBuy}
                                                    onChange={handleChange}
                                                    InputProps={{ inputProps: { min: 1 } }}
                                                    helperText="Aplicar desconto na Xª unidade"
                                                    variant="outlined"
                                                />
                                            </Grid>
                                        </Grid>
                                    </CardContent>
                                </Card>
                            </Grid>
                        )}
                    </Grid>
                </Box>
            </DialogContent>
            <DialogActions>
                <Button onClick={onClose}>Cancelar</Button>
                <Button
                    onClick={handleSubmit}
                    variant="contained"
                    disabled={loading}
                >
                    {loading ? <CircularProgress size={24} /> : 'Criar Promoção'}
                </Button>
            </DialogActions>
        </Dialog>
    );
}

export default Promocoes;