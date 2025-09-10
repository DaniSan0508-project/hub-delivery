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
  Paper
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

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
    } else {
      // In a real app, you might want to decode the token to get user info
      setUser({ name: 'Usuário' });
      
      // Fetch merchant data and orders
      fetchDashboardData(token);
    }
  }, [navigate]);

  const fetchDashboardData = async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      // Fetch merchant data
      const merchantResponse = await fetch('http://localhost:8090/api/hub/ifood/merchant', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
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
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      
      if (ordersResponse.ok) {
        const ordersData = await ordersResponse.json();
        setOrders(ordersData.orders);
        
        // Calculate sales metrics
        calculateSalesMetrics(ordersData.orders);
      } else {
        const errorData = await ordersResponse.json();
        setError(prevError => prevError ? `${prevError}; ${errorData.message}` : errorData.message || 'Erro ao carregar pedidos');
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
        // Calculate order total
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
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
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
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
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
                <ListItemIcon>
                  {item.icon}
                </ListItemIcon>
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
              
              {/* Sales Metrics Cards */}
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
              
              {/* Recent Orders Table */}
              <Paper elevation={3} sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Últimos Pedidos
                </Typography>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nº Pedido</TableCell>
                      <TableCell>Cliente</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Valor</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {orders.slice(0, 5).map((order) => {
                      const orderTotal = order.order.items.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
                      return (
                        <TableRow key={order.order.id}>
                          <TableCell>#{order.order.id.substring(0, 8)}</TableCell>
                          <TableCell>{order.consumer.name}</TableCell>
                          <TableCell>{order.order.status}</TableCell>
                          <TableCell>R$ {orderTotal.toFixed(2).replace('.', ',')}</TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </Paper>
            </>
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default Dashboard;