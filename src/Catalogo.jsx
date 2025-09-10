import { useState, useEffect } from 'react';
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

function Catalogo() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [products, setProducts] = useState([]);
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
      // Fetch products from API
      fetchProducts(token);
    }
  }, [navigate]);

  const fetchProducts = async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await fetch('http://localhost:8090/api/erp/products', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProducts(data);
      } else {
        const errorData = await response.json();
        setError(errorData.message || 'Erro ao carregar produtos');
      }
    } catch (error) {
      console.error('Error fetching products:', error);
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
            Portal iFood - Catálogo
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
            Catálogo
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                Produtos Cadastrados
              </Typography>
              <Button variant="contained">
                Adicionar Produto
              </Button>
            </Box>
            
            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Nome</TableCell>
                      <TableCell>Categoria</TableCell>
                      <TableCell>Preço</TableCell>
                      <TableCell>Ações</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {products.length > 0 ? (
                      products.map((product) => (
                        <TableRow key={product.id}>
                          <TableCell>{product.name || 'Nome não informado'}</TableCell>
                          <TableCell>{product.category || 'Categoria não informada'}</TableCell>
                          <TableCell>
                            {product.price ? `R$ ${parseFloat(product.price).toFixed(2).replace('.', ',')}` : 'R$ 0,00'}
                          </TableCell>
                          <TableCell>
                            <Button size="small" variant="outlined">Editar</Button>
                            <Button size="small" variant="outlined" color="error" sx={{ ml: 1 }}>Excluir</Button>
                          </TableCell>
                        </TableRow>
                      ))
                    ) : (
                      <TableRow>
                        <TableCell colSpan={4} align="center">
                          Nenhum produto encontrado
                        </TableCell>
                      </TableRow>
                    )}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default Catalogo;