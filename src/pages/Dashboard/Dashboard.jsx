import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
    Box,
    Typography,
    Button,
    AppBar,
    Toolbar,
    Container,
    Drawer,
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
    Chip,
    Accordion,
    AccordionSummary,
    AccordionDetails,
    Avatar,
    LinearProgress,
    Stack
} from '@mui/material';
import {
    Menu as MenuIcon,
    ShoppingCart as ShoppingCartIcon,
    CheckCircle as CheckCircleIcon,
    Euro as EuroIcon,
    AccessTime as AccessTimeIcon
} from '@mui/icons-material';
import Sidebar from '../../components/Sidebar';
import dashboardService from '../../services/dashboardService';
import {
    PieChart,
    Pie,
    Cell,
    ResponsiveContainer,
    BarChart,
    Bar,
    XAxis,
    YAxis,
    Tooltip,
    Legend
} from 'recharts';

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


    const fetchDashboardData = useCallback(async (token) => {
        try {
            setLoading(true);
            setError(null);

            const [merchantData, ordersData, openingHoursData, interruptionsData] = await Promise.all([
                dashboardService.getMerchantData(token),
                dashboardService.getOrders(token),
                dashboardService.getOpeningHours(token),
                dashboardService.getInterruptions(token)
            ]);

            setMerchantData(merchantData);
            setOrders(ordersData.orders);
            calculateSalesMetrics(ordersData.orders);
            setOpeningHours(openingHoursData.shifts);
            setInterruptions(interruptionsData);

        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            if (error.message && error.message.includes('Sessão expirada')) {
                return;
            }
            setError(error.message || 'Erro de conexão. Por favor, tente novamente.');
        } finally {
            setLoading(false);
        }
    }, []);

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
                        fetchDashboardData(token);
                    }
                }, 100);
            }
        }

        return () => {
            isMounted = false;
        };
    }, [navigate, fetchDashboardData]);

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
            case 'Placed': return 'warning.main'; // Laranja
            case 'Confirmed': return 'success.main'; // Verde
            case 'SPS':
            case 'Separation Started': return 'warning.light'; // Amarelo claro
            case 'SPE':
            case 'Separation Ended': return 'warning.main'; // Amarelo
            case 'READY_TO_PICKUP':
            case 'Ready to Pickup':
            case 'RFI': return 'info.main'; // Azul claro
            case 'Dispatched': return 'primary.main'; // Azul
            case 'Arrived':
            case 'Arrived at Destination': return 'primary.light'; // Azul claro
            case 'Concluded': return 'success.main'; // Verde
            case 'Cancelled': return 'error.main'; // Vermelho
            default: return 'grey.500'; // Cinza
        }
    };

    const getStatusText = (status) => {
        switch (status) {
            case 'Placed': return 'Recebido';
            case 'Confirmed': return 'Confirmado';
            case 'SPS':
            case 'Separation Started': return 'Separação iniciada';
            case 'SPE':
            case 'Separation Ended': return 'Separação finalizada';
            case 'READY_TO_PICKUP':
            case 'Ready to Pickup':
            case 'RFI': return 'Pronto para Retirada';
            case 'Dispatched': return 'Despachado';
            case 'Arrived':
            case 'Arrived at Destination': return 'Chegou ao Destino';
            case 'Concluded': return 'Concluído';
            case 'Cancelled': return 'Cancelado';
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
                        Sysfar HubDelivery
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
                    <Sidebar />
                </Drawer>
                <Drawer
                    variant="permanent"
                    sx={{
                        display: { xs: 'none', sm: 'block' },
                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                    }}
                    open
                >
                    <Sidebar />
                </Drawer>
            </Box>

            <Box component="main" sx={{ flexGrow: 1, py: 2, px: 1, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
                <Toolbar />
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
                                        Sysfar HubDelivery
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
                                    <Sidebar />
                                </Drawer>
                                <Drawer
                                    variant="permanent"
                                    sx={{
                                        display: { xs: 'none', sm: 'block' },
                                        '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
                                    }}
                                    open
                                >
                                    <Sidebar />
                                </Drawer>
                            </Box>

                        </Box>
                        <Box component="main" sx={{ flexGrow: 1, py: 2, px: 1, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>

                            <Container maxWidth="xl" sx={{ px: 0 }}>
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
                                        {/* Header Section */}
                                        <Box sx={{
                                            textAlign: 'center',
                                            mb: 4,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'space-between'
                                        }}>


                                            <Box>
                                                <Typography variant="h4" gutterBottom sx={{ fontWeight: 'bold' }}>
                                                    Painel de Controle
                                                </Typography>
                                                <Typography variant="h6" color="textSecondary">
                                                    Visão geral do seu negócio
                                                </Typography>
                                            </Box>
                                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                                <Box sx={{ textAlign: 'right' }}>
                                                    <Typography variant="body2" color="textSecondary">Status da Loja</Typography>
                                                    <Stack direction="row" alignItems="center" justifyContent="flex-end">
                                                        <Box
                                                            sx={{
                                                                width: 12,
                                                                height: 12,
                                                                borderRadius: '50%',
                                                                bgcolor: 'success.main', // Using green for open status
                                                                mr: 1,
                                                                boxShadow: '0 0 4px 2px rgba(76, 175, 80, 0.5)'
                                                            }}
                                                        />
                                                        <Typography variant="body1" sx={{ fontWeight: 'bold', color: 'success.main' }}>Aberto</Typography>
                                                    </Stack>
                                                </Box>
                                                <AccessTimeIcon sx={{ fontSize: 32, color: 'success.main' }} />
                                            </Box>
                                        </Box>

                                        {/* KPI Cards Section */}
                                        <Grid container spacing={2} sx={{ mb: 3 }}>
                                            <Grid item xs={12} md={4}>
                                                <Card sx={{
                                                    height: '100%',
                                                    backgroundColor: 'primary.main',
                                                    color: 'white',
                                                    borderRadius: 3,
                                                    boxShadow: 3,
                                                    p: 2
                                                }}>
                                                    <CardContent sx={{ textAlign: 'center' }}>
                                                        <Avatar sx={{
                                                            bgcolor: 'rgba(255,255,255,0.2)',
                                                            width: 56,
                                                            height: 56,
                                                            mx: 'auto',
                                                            mb: 1
                                                        }}>
                                                            R$
                                                        </Avatar>
                                                        <Typography variant="h6" color="rgba(255,255,255,0.8)" gutterBottom sx={{ fontWeight: 500 }}>
                                                            Total de Vendas
                                                        </Typography>
                                                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                                                            R$ {salesMetrics.totalSales.toFixed(2).replace('.', ',')}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Card sx={{
                                                    height: '100%',
                                                    backgroundColor: 'secondary.main',
                                                    color: 'white',
                                                    borderRadius: 3,
                                                    boxShadow: 3,
                                                    p: 2
                                                }}>
                                                    <CardContent sx={{ textAlign: 'center' }}>
                                                        <Avatar sx={{
                                                            bgcolor: 'rgba(255,255,255,0.2)',
                                                            width: 56,
                                                            height: 56,
                                                            mx: 'auto',
                                                            mb: 1
                                                        }}>
                                                            <ShoppingCartIcon sx={{ color: 'white', fontSize: 32 }} />
                                                        </Avatar>
                                                        <Typography variant="h6" color="rgba(255,255,255,0.8)" gutterBottom sx={{ fontWeight: 500 }}>
                                                            Total de Pedidos
                                                        </Typography>
                                                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                                                            {salesMetrics.totalOrders}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                            <Grid item xs={12} md={4}>
                                                <Card sx={{
                                                    height: '100%',
                                                    backgroundColor: 'success.main',
                                                    color: 'white',
                                                    borderRadius: 3,
                                                    boxShadow: 3,
                                                    p: 2
                                                }}>
                                                    <CardContent sx={{ textAlign: 'center' }}>
                                                        <Avatar sx={{
                                                            bgcolor: 'rgba(255,255,255,0.2)',
                                                            width: 56,
                                                            height: 56,
                                                            mx: 'auto',
                                                            mb: 1
                                                        }}>
                                                            <CheckCircleIcon sx={{ color: 'white', fontSize: 32 }} />
                                                        </Avatar>
                                                        <Typography variant="h6" color="rgba(255,255,255,0.8)" gutterBottom sx={{ fontWeight: 500 }}>
                                                            Pedidos Concluídos
                                                        </Typography>
                                                        <Typography variant="h3" sx={{ fontWeight: 'bold', color: 'white' }}>
                                                            {salesMetrics.completedOrders}
                                                        </Typography>
                                                    </CardContent>
                                                </Card>
                                            </Grid>
                                        </Grid>

                                        {/* Charts Section */}
                                        <Grid container spacing={3} sx={{ mb: 4 }}>
                                            {/* Orders by Status Chart */}
                                            <Grid item xs={12} md={8}>
                                                <Card sx={{
                                                    height: '100%',
                                                    p: 2,
                                                    borderRadius: 3,
                                                    boxShadow: 3
                                                }}>
                                                    <Typography variant="h6" sx={{ fontWeight: 'bold', mb: 2 }}>
                                                        Distribuição de Pedidos por Status
                                                    </Typography>
                                                    {orders.length > 0 ? (
                                                        <Box sx={{ height: 300 }}>
                                                            <ResponsiveContainer width="100%" height="100%">
                                                                <PieChart>
                                                                    <Pie
                                                                        data={Object.entries(orders.reduce((acc, order) => {
                                                                            const status = order.order.status;
                                                                            acc[getStatusText(status)] = (acc[getStatusText(status)] || 0) + 1;
                                                                            return acc;
                                                                        }, {})).map(([status, count]) => ({ name: status, value: count }))}
                                                                        cx="50%"
                                                                        cy="50%"
                                                                        labelLine={false}
                                                                        outerRadius={80}
                                                                        fill="#8884d8"
                                                                        dataKey="value"
                                                                        label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                                                                    >
                                                                        {Object.entries(orders.reduce((acc, order) => {
                                                                            const status = order.order.status;
                                                                            acc[getStatusText(status)] = (acc[getStatusText(status)] || 0) + 1;
                                                                            return acc;
                                                                        }, {})).map(([status, count], index) => (
                                                                            <Cell key={`cell-${index}`} fill={getStatusColor(status)} />
                                                                        ))}
                                                                    </Pie>
                                                                    <Tooltip />
                                                                </PieChart>
                                                            </ResponsiveContainer>
                                                        </Box>
                                                    ) : (
                                                        <Box sx={{ textAlign: 'center', py: 4 }}>
                                                            <Typography variant="body1" color="textSecondary">
                                                                Nenhum pedido para exibir
                                                            </Typography>
                                                        </Box>
                                                    )}
                                                </Card>
                                            </Grid>

                                            {/* Opening Hours Card */}
                                            <Grid item xs={12} md={4}>
                                                <Card sx={{
                                                    height: '100%',
                                                    p: 2,
                                                    borderRadius: 3,
                                                    boxShadow: 3
                                                }}>
                                                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                                                        <AccessTimeIcon sx={{ color: 'primary.main', mr: 1 }} />
                                                        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
                                                            Horários de Funcionamento
                                                        </Typography>
                                                    </Box>
                                                    {openingHours.length > 0 ? (
                                                        <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                                            <Table size="small">
                                                                <TableBody>
                                                                    {openingHours.map((shift, index) => (
                                                                        <TableRow
                                                                            key={index}
                                                                            sx={{
                                                                                '&:last-child td, &:last-child th': { border: 0 }
                                                                            }}
                                                                        >
                                                                            <TableCell component="th" scope="row" align="left">
                                                                                {daysOfWeekMap[shift.dayOfWeek]}
                                                                            </TableCell>
                                                                            <TableCell align="right">
                                                                                {`${shift.start.substring(0, 5)} - ${shift.end.substring(0, 5)}`}
                                                                            </TableCell>
                                                                        </TableRow>
                                                                    ))}
                                                                </TableBody>
                                                            </Table>
                                                        </Box>
                                                    ) : (
                                                        <Alert severity="info">
                                                            Nenhum horário configurado.
                                                        </Alert>
                                                    )}
                                                </Card>
                                            </Grid>
                                        </Grid>

                                        <Paper elevation={3} sx={{ p: 2, mb: 4 }}>
                                            <Typography variant="h6" gutterBottom>
                                                Pedidos por Status
                                            </Typography>
                                            <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mt: 2 }}>
                                                {Object.entries(orders.reduce((acc, order) => {
                                                    const status = order.order.status;
                                                    acc[status] = (acc[status] || 0) + 1;
                                                    return acc;
                                                }, {})).map(([status, count]) => (
                                                    <Chip
                                                        key={status}
                                                        label={`${getStatusText(status)}: ${count}`}
                                                        sx={{
                                                            fontWeight: 'bold',
                                                            fontSize: '0.875rem',
                                                            backgroundColor: getStatusColor(status),
                                                            color: 'white'
                                                        }}
                                                    />
                                                ))}
                                            </Box>
                                        </Paper>

                                        {/* Scheduled Interruptions */}
                                        <Card sx={{ p: 2, borderRadius: 3, boxShadow: 3, mb: 4 }}>
                                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold' }}>
                                                Interrupções Agendadas
                                            </Typography>
                                            <Alert severity="info" sx={{ mb: 2, mt: 1 }}>
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
                                                            <TableRow key={interruption.id} hover>
                                                                <TableCell>{interruption.description}</TableCell>
                                                                <TableCell align="center">{new Date(interruption.start).toLocaleString()}</TableCell>
                                                                <TableCell align="center">{new Date(interruption.end).toLocaleString()}</TableCell>
                                                            </TableRow>
                                                        ))}
                                                    </TableBody>
                                                </Table>
                                            ) : (
                                                <Typography sx={{ mt: 2 }} color="textSecondary">Nenhuma interrupção agendada.</Typography>
                                            )}
                                        </Card>
                                    </>
                                )}
                            </Container>
                        </Box>
                    </>
                )}
            </Box>
        </Box>
    );
}

export default Dashboard;