import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Button,
    AppBar,
    Toolbar,
    Container,
    Drawer,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Divider,
    CssBaseline,
    IconButton,
    CircularProgress,
    Alert,
    Card,
    CardContent,
    Grid,
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableRow,
    Paper,
    Chip
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Dashboard as DashboardIcon,
    Restaurant as RestaurantIcon,
    Sync as SyncIcon,
    Store as StoreIcon,
    Category as CategoryIcon,
    Menu as MenuIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const daysOfWeekMap = {
    MONDAY: 'Segunda-feira',
    TUESDAY: 'Terça-feira',
    WEDNESDAY: 'Quarta-feira',
    THURSDAY: 'Quinta-feira',
    FRIDAY: 'Sexta-feira',
    SATURDAY: 'Sábado',
    SUNDAY: 'Domingo'
};

function Dashboard() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [merchantData, setMerchantData] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [orders, setOrders] = useState([]);
    const [salesMetrics, setSalesMetrics] = useState({
        totalSales: 0,
        totalOrders: 0,
        averageOrderValue: 0,
        completedOrders: 0
    });
    const [openingHours, setOpeningHours] = useState([]);
    const [interruptions, setInterruptions] = useState([]);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/');
        } else {
            setUser({ name: 'Usuário' });
            fetchDashboardData(token);
        }
    }, [navigate]);

    const fetchDashboardData = async (token) => {
        try {
            setLoading(true);
            setError(null);

            // Fetch merchant data
            const merchantResponse = await fetch('http://localhost:8090/api/hub/ifood/merchant', {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (merchantResponse.ok) {
                const merchantData = await merchantResponse.json();
                setMerchantData(merchantData);
            } else {
                const errorData = await merchantResponse.json();
                setError(errorData.message || 'Erro ao carregar dados do merchant');
            }

            // Fetch orders data
            const ordersResponse = await fetch('http://localhost:8090/api/erp/orders', {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (ordersResponse.ok) {
                const ordersData = await ordersResponse.json();
                setOrders(ordersData.orders);
                calculateSalesMetrics(ordersData.orders);
            } else {
                const errorData = await ordersResponse.json();
                setError(prevError => prevError ? `${prevError}; ${errorData.message}` : errorData.message || 'Erro ao carregar pedidos');
            }

            // Fetch opening hours data
            const openingHoursResponse = await fetch('http://localhost:8090/api/hub/ifood/merchant/opening-hours', {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (openingHoursResponse.ok) {
                const openingHoursData = await openingHoursResponse.json();
                setOpeningHours(openingHoursData.shifts);
            } else {
                const errorData = await openingHoursResponse.json();
                setError(prevError => prevError ? `${prevError}; ${errorData.message}` : errorData.message || 'Erro ao carregar horários de funcionamento');
            }

            // Fetch interruptions data
            const interruptionsResponse = await fetch('http://localhost:8090/api/hub/ifood/merchant/interruptions', {
                headers: { 'Authorization': `Bearer ${token}`, 'Content-Type': 'application/json' }
            });
            if (interruptionsResponse.ok) {
                const interruptionsData = await interruptionsResponse.json();
                setInterruptions(interruptionsData);
            } else {
                const errorData = await interruptionsResponse.json();
                setError(prevError => prevError ? `${prevError}; ${errorData.message}` : errorData.message || 'Erro ao carregar interrupções');
            }

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            setError('Erro de conexão. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    };

    const calculateSalesMetrics = (orders) => {
        let totalSales = 0;
        let totalOrders = orders.length;
        let completedOrders = 0;

        orders.forEach(order => {
            if (order.order.status === 'Concluded') {
                completedOrders++;
                const orderTotal = order.order.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
                totalSales += orderTotal;
            }
        });

        const averageOrderValue = totalOrders > 0 ? totalSales / totalOrders : 0;

        setSalesMetrics({
            totalSales,
            totalOrders,
            averageOrderValue,
            completedOrders
        });
    };

    const getStatusColor = (status) => {
        switch (status) {
            case 'Placed': return 'info';
            case 'Confirmed': return 'success';
            case 'SPS': return 'warning';
            case 'SPE': return 'info';
            case 'Dispatched': return 'default';
            case 'Concluded': return 'default';
            default: return 'default';
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Placed': return 'Recebido';
            case 'Confirmed': return 'Confirmado';
            case 'SPS': return 'Separação iniciada';
            case 'SPE': return 'Separação finalizada';
            case 'Dispatched': return 'Despachado';
            case 'Concluded': return 'Concluído';
            default: return status;
        }
    };

    const handleDrawerToggle = () => {
        setMobileOpen(!mobileOpen);
    };

    const handleLogout = () => {
        localStorage.removeItem('authToken');
        navigate('/');
    };

    const menuItems = [
        { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
        { text: 'Sincronização', icon: <SyncIcon />, path: '/sincronizacao' },
        { text: 'Catálogo', icon: <CategoryIcon />, path: '/catalogo' },
        { text: 'Pedidos', icon: <RestaurantIcon />, path: '/pedidos' },
        { text: 'Loja', icon: <StoreIcon />, path: '/loja' },
    ];

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
                    <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                        Portal iFood
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
                    ModalProps={{ keepMounted: true }}
                    sx={{
                        display: { xs: 'block', sm: 'none' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                >
                    <Toolbar />
                    <List>
                        {menuItems.map((item) => (
                            <ListItem
                                button
                                key={item.text}
                                onClick={() => {
                                    navigate(item.path);
                                    setMobileOpen(false);
                                }}
                                selected={location.pathname === item.path}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}
                    </List>
                    <Divider />
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    <Toolbar />
                    <List>
                        {menuItems.map((item) => (
                            <ListItem
                                button
                                key={item.text}
                                onClick={() => navigate(item.path)}
                                selected={location.pathname === item.path}
                            >
                                <ListItemIcon>{item.icon}</ListItemIcon>
                                <ListItemText primary={item.text} />
                            </ListItem>
                        ))}
                    </List>
                    <Divider />
                </Drawer>
            </Box>
            <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                <Toolbar />
                <Container maxWidth="lg">
                    {error && (
                        <Alert severity="error" sx={{ mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    {loading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {merchantData && (
                                <Box sx={{ mb: 4 }}>
                                    <Typography variant="h4" gutterBottom>
                                        {merchantData.name || 'Nome não informado'}
                                    </Typography>
                                    <Typography variant="h6" color="textSecondary">
                                        {merchantData.corporateName || 'Razão social não informada'}
                                    </Typography>
                                </Box>
                            )}

                            <Typography variant="h5" gutterBottom>
                                Resumo de Vendas
                            </Typography>

                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Total de Vendas
                                            </Typography>
                                            <Typography variant="h4" color="primary">
                                                R$ {salesMetrics.totalSales.toFixed(2).replace('.', ',')}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Total de Pedidos
                                            </Typography>
                                            <Typography variant="h4" color="secondary">
                                                {salesMetrics.totalOrders}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Pedidos Concluídos
                                            </Typography>
                                            <Typography variant="h4" color="success.main">
                                                {salesMetrics.completedOrders}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} md={3}>
                                    <Card>
                                        <CardContent>
                                            <Typography variant="h6" gutterBottom>
                                                Ticket Médio
                                            </Typography>
                                            <Typography variant="h4" color="info.main">
                                                R$ {salesMetrics.averageOrderValue.toFixed(2).replace('.', ',')}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            <Grid container spacing={3} sx={{ mb: 4 }}>
                                <Grid item xs={12} md={6}>
                                    <Paper elevation={3} sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Pedidos por Status
                                        </Typography>
                                        <Grid container spacing={2}>
                                            {Object.entries(orders.reduce((acc, order) => {
                                                const status = order.order.status;
                                                acc[status] = (acc[status] || 0) + 1;
                                                return acc;
                                            }, {})).map(([status, count]) => (
                                                <Grid item key={status}>
                                                    <Chip
                                                        label={`${getStatusText(status)}: ${count}`}
                                                        color={getStatusColor(status)}
                                                        variant="outlined"
                                                    />
                                                </Grid>
                                            ))}
                                        </Grid>
                                    </Paper>
                                </Grid>

                                <Grid item xs={12} md={6}>
                                    <Paper elevation={3} sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Horários de Funcionamento
                                        </Typography>
                                        {openingHours.length > 0 ? (
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Dia</TableCell>
                                                        <TableCell align="right">Horário</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {openingHours.map((shift, index) => (
                                                        <TableRow key={index}>
                                                            <TableCell component="th" scope="row">
                                                                {daysOfWeekMap[shift.dayOfWeek]}
                                                            </TableCell>
                                                            <TableCell align="right">
                                                                {`${shift.start.substring(0, 5)} - ${shift.end.substring(0, 5)}`}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <Alert severity="info" sx={{ mt: 2 }}>
                                                Nenhum horário de funcionamento configurado.
                                            </Alert>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>

                            {/* Interrupções de Loja */}
                            <Grid container spacing={3}>
                                <Grid item xs={12}>
                                    <Paper elevation={3} sx={{ p: 3 }}>
                                        <Typography variant="h6" gutterBottom>
                                            Interrupções Agendadas
                                        </Typography>
                                        <Alert severity="info" sx={{ mb: 2 }}>
                                            As interrupções podem levar até 2 minutos para serem atualizadas no iFood.
                                        </Alert>
                                        {interruptions.length > 0 ? (
                                            <Table size="small">
                                                <TableHead>
                                                    <TableRow>
                                                        <TableCell>Descrição</TableCell>
                                                        <TableCell align="center">Início</TableCell>
                                                        <TableCell align="center">Fim</TableCell>
                                                    </TableRow>
                                                </TableHead>
                                                <TableBody>
                                                    {interruptions.map((interruption) => (
                                                        <TableRow key={interruption.id}>
                                                            <TableCell component="th" scope="row">
                                                                {interruption.description}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {new Date(interruption.start).toLocaleString()}
                                                            </TableCell>
                                                            <TableCell align="center">
                                                                {new Date(interruption.end).toLocaleString()}
                                                            </TableCell>
                                                        </TableRow>
                                                    ))}
                                                </TableBody>
                                            </Table>
                                        ) : (
                                            <Alert severity="info" sx={{ mt: 2 }}>
                                                Nenhuma interrupção agendada.
                                            </Alert>
                                        )}
                                    </Paper>
                                </Grid>
                            </Grid>
                        </>
                    )}
                </Container>
            </Box>
        </Box>
    );
}

export default Dashboard;