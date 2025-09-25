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
    AccordionDetails
} from '@mui/material';
import { Menu as MenuIcon, ExpandMore as ExpandMoreIcon } from '@mui/icons-material';
import Sidebar from '../../components/Sidebar';
import dashboardService from '../../services/dashboardService';

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
    // ... (toda a sua lógica de state, effects e functions permanece exatamente a mesma)
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
            case 'Placed': return '#ff9800'; // Laranja
            case 'Confirmed': return '#4caf50'; // Verde
            case 'SPS':
            case 'Separation Started': return '#ffeb3b'; // Amarelo
            case 'SPE':
            case 'Separation Ended': return '#ffc107'; // Âmbar
            case 'READY_TO_PICKUP':
            case 'Ready to Pickup':
            case 'RFI': return '#ff5722'; // Laranja escuro
            case 'Dispatched': return '#9c27b0'; // Roxo
            case 'Arrived':
            case 'Arrived at Destination': return '#3f51b5'; // Índigo
            case 'Concluded': return '#009688'; // Verde-azulado
            default: return '#9e9e9e'; // Cinza
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
                            

                            <Box sx={{ position: 'relative', mb: 4 }}>
                                <Typography variant="h5" gutterBottom sx={{ fontWeight: 'bold' }}>
                                    Resumo de Vendas
                                </Typography>
                            </Box>

                            {/* Horários de Funcionamento Card */}
                            <Grid container spacing={2} sx={{ mb: 4, width: '100%', margin: 0 }}>
                                <Grid item xs={12} sx={{ padding: 1 }}>
                                    <Card sx={{
                                        height: '100%',
                                        boxShadow: 4,
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 6
                                        },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: 2
                                    }}>
                                        <CardContent sx={{
                                            flexGrow: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            textAlign: 'center',
                                            padding: 3
                                        }}>
                                            <Typography variant="h6" gutterBottom sx={{ fontWeight: 'bold', color: 'primary.main' }}>
                                                Horários de Funcionamento
                                            </Typography>
                                            {openingHours.length > 0 ? (
                                                <Table size="small" sx={{ mt: 1 }}>
                                                    <TableBody>
                                                        {openingHours.map((shift, index) => (
                                                            <TableRow 
                                                                key={index} 
                                                                sx={{ 
                                                                    '&:last-child td, &:last-child th': { border: 0 },
                                                                    '&:nth-of-type(odd)': { backgroundColor: 'action.hover' }
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
                                            ) : (
                                                <Alert severity="info" sx={{ mt: 2 }}>
                                                    Nenhum horário configurado.
                                                </Alert>
                                            )}
                                        </CardContent>
                                    </Card>
                                </Grid>
                            </Grid>

                            {/* ===== MUDANÇA APLICADA AQUI ===== */}
                            <Grid container spacing={2} sx={{ mb: 4, width: '100%', margin: 0 }}>
                                <Grid item xs={12} sm={6} lg={3} sx={{ padding: 1 }}>
                                    <Card sx={{
                                        height: '100%',
                                        boxShadow: 4,
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 6
                                        },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: 2
                                    }}>
                                        <CardContent sx={{
                                            flexGrow: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: 3
                                        }}>
                                            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                                                Total de Vendas
                                            </Typography>
                                            <Typography variant="h3" color="primary" sx={{ fontWeight: 'bold', mt: 1 }}>
                                                R$ {salesMetrics.totalSales.toFixed(2).replace('.', ',')}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} lg={3} sx={{ padding: 1 }}>
                                    <Card sx={{
                                        height: '100%',
                                        boxShadow: 4,
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 6
                                        },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: 2
                                    }}>
                                        <CardContent sx={{
                                            flexGrow: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: 3
                                        }}>
                                            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                                                Total de Pedidos
                                            </Typography>
                                            <Typography variant="h3" color="secondary" sx={{ fontWeight: 'bold', mt: 1 }}>
                                                {salesMetrics.totalOrders}
                                            </Typography>
                                        </CardContent>
                                    </Card>
                                </Grid>
                                <Grid item xs={12} sm={6} lg={3} sx={{ padding: 1 }}>
                                    <Card sx={{
                                        height: '100%',
                                        boxShadow: 4,
                                        transition: 'transform 0.2s, box-shadow 0.2s',
                                        '&:hover': {
                                            transform: 'translateY(-4px)',
                                            boxShadow: 6
                                        },
                                        display: 'flex',
                                        flexDirection: 'column',
                                        borderRadius: 2
                                    }}>
                                        <CardContent sx={{
                                            flexGrow: 1,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            justifyContent: 'center',
                                            alignItems: 'center',
                                            textAlign: 'center',
                                            padding: 3
                                        }}>
                                            <Typography variant="h6" color="text.secondary" gutterBottom sx={{ fontWeight: 500 }}>
                                                Pedidos Concluídos
                                            </Typography>
                                            <Typography variant="h3" color="success.main" sx={{ fontWeight: 'bold', mt: 1 }}>
                                                {salesMetrics.completedOrders}
                                            </Typography>
                                        </CardContent>
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

                            <Paper elevation={3} sx={{ p: 2 }}>
                                <Typography variant="h6" gutterBottom>
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
                                    <Typography sx={{ mt: 2 }} color="text.secondary">Nenhuma interrupção agendada.</Typography>
                                )}
                            </Paper>
                        </>
                    )}
                </Container>
            </Box>
        </Box>
    );
}

export default Dashboard;