import { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Container,
  Toolbar,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardActions,
  Drawer,
  CssBaseline,
  AppBar,
  IconButton,
  CircularProgress,
  Alert
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

function Loja() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [storeInfo, setStoreInfo] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
    } else {
      // In a real app, you might want to decode the token to get user info
      setUser({ name: 'Usuário' });
      // Fetch store info from API
      fetchStoreInfo(token);
    }
  }, [navigate]);

  const fetchStoreInfo = async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8090/api/erp/store', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setStoreInfo(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao carregar informações da loja');
      }
    } catch (error) {
      console.error('Error fetching store info:', error);
      setError('Erro de conexão. Por favor, tente novamente.');
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
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            Portal iFood - Loja
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
        </Drawer>
      </Box>
      <Box component="main" sx={{ flexGrow: 1, p: 3, width: { sm: `calc(100% - ${drawerWidth}px)` } }}>
        <Toolbar />
        <Container maxWidth="lg">
          <Typography variant="h4" gutterBottom>
            Loja
          </Typography>
          
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
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Paper elevation={3} sx={{ p: 3 }}>
                  <Typography variant="h6" gutterBottom>
                    Informações da Loja
                  </Typography>
                  <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Nome Fantasia</Typography>
                      <Typography variant="body1">{storeInfo.name || 'Não informado'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Razão Social</Typography>
                      <Typography variant="body1">{storeInfo.corporateName || 'Não informado'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">CNPJ</Typography>
                      <Typography variant="body1">{storeInfo.cnpj || 'Não informado'}</Typography>
                    </Grid>
                    <Grid item xs={12} sm={6}>
                      <Typography variant="body2" color="textSecondary">Telefone</Typography>
                      <Typography variant="body1">{storeInfo.phone || 'Não informado'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">Endereço</Typography>
                      <Typography variant="body1">{storeInfo.address || 'Não informado'}</Typography>
                    </Grid>
                    <Grid item xs={12}>
                      <Typography variant="body2" color="textSecondary">Horário de Funcionamento</Typography>
                      <Typography variant="body1">{storeInfo.openingHours || 'Não informado'}</Typography>
                    </Grid>
                  </Grid>
                  <CardActions sx={{ mt: 2 }}>
                    <Button variant="contained" size="small">Editar Informações</Button>
                  </CardActions>
                </Paper>
              </Grid>
              <Grid item xs={12} md={4}>
                <Paper elevation={3} sx={{ p: 3, height: '100%' }}>
                  <Typography variant="h6" gutterBottom>
                    Status da Loja
                  </Typography>
                  <Card variant="outlined" sx={{ mb: 2 }}>
                    <CardContent>
                      <Typography variant="body2" color="textSecondary" gutterBottom>
                        Status Atual
                      </Typography>
                      <Typography 
                        variant="h5" 
                        sx={{ 
                          color: storeInfo.status === 'Aberto' ? 'success.main' : 'error.main',
                          fontWeight: 'bold'
                        }}
                      >
                        {storeInfo.status || 'Desconhecido'}
                      </Typography>
                    </CardContent>
                  </Card>
                  <CardActions>
                    <Button 
                      variant="contained" 
                      color={storeInfo.status === 'Aberto' ? 'error' : 'success'}
                      fullWidth
                    >
                      {storeInfo.status === 'Aberto' ? 'Fechar Loja' : 'Abrir Loja'}
                    </Button>
                  </CardActions>
                </Paper>
              </Grid>
            </Grid>
          )}
        </Container>
      </Box>
    </Box>
  );
}

export default Loja;