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
  ListItemIcon
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

function Sincronizacao() {
  const navigate = useNavigate();
  const location = useLocation();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (!token) {
      navigate('/');
    } else {
      // In a real app, you might want to decode the token to get user info
      setUser({ name: 'Usuário' });
    }
  }, [navigate]);

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
            Sincronização
          </Typography>
          <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
            <Typography variant="h6" gutterBottom>
              Status da Sincronização
            </Typography>
            <Typography variant="body1" paragraph>
              A sincronização com o sistema iFood está funcionando corretamente.
            </Typography>
            <Divider sx={{ my: 2 }} />
            <Typography variant="h6" gutterBottom>
              Última Sincronização
            </Typography>
            <List>
              <ListItem>
                <ListItemText primary="Produtos" secondary="Sincronizado há 5 minutos" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Cardápio" secondary="Sincronizado há 10 minutos" />
              </ListItem>
              <ListItem>
                <ListItemText primary="Pedidos" secondary="Sincronizado há 2 minutos" />
              </ListItem>
            </List>
            <Button variant="contained" sx={{ mt: 2 }}>
              Sincronizar Agora
            </Button>
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default Sincronizacao;