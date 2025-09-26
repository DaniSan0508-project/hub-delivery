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
  Alert,
  Tabs,
  Tab,
  Chip,
  Card,
  CardContent,
  CardMedia,
  Grid,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Pagination
} from '@mui/material';
import { useNavigate } from 'react-router-dom';
import { Menu as MenuIcon } from '@mui/icons-material';
import Sidebar from '../../components/Sidebar';
import catalogService from '../../services/catalogService';

const drawerWidth = 240;

function Catalogo() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [catalogs, setCatalogs] = useState([]);
  const [selectedCatalog, setSelectedCatalog] = useState(null);
  const [catalogItems, setCatalogItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState(0);
  const [page, setPage] = useState(1);
  const itemsPerPage = 10;

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
            fetchCatalogs(token);
          }
        }, 200);
      }
    }
    
    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const fetchCatalogs = async (token) => {
    try {
      setLoading(true);
      setError(null);
      
      const catalogsData = await catalogService.getCatalogs(token);
      
      if (catalogsData && catalogsData.data && catalogsData.data.catalogs) {
        setCatalogs(catalogsData.data.catalogs);
        
        if (catalogsData.data.catalogs.length > 0) {
          const firstCatalog = catalogsData.data.catalogs[0];
          setSelectedCatalog(firstCatalog);
          fetchCatalogItems(firstCatalog.groupId, token);
        }
      }
    } catch (error) {
      console.error('Error fetching catalogs:', error);
      if (error.message && error.message.includes('Sessão expirada')) {
        return;
      }
      setError(error.message || 'Erro de conexão. Por favor, tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  const fetchCatalogItems = async (groupId, token) => {
    try {
      setLoading(true);
      setError(null);
      
      const itemsData = await catalogService.getCatalogItems(groupId, token);
      
      if (itemsData && itemsData.data && itemsData.data.items) {
        setCatalogItems(itemsData.data.items);
      } else {
        setCatalogItems([]);
      }
      
      setPage(1); // Reset to first page when changing catalogs
    } catch (error) {
      console.error('Error fetching catalog items:', error);
      if (error.message && error.message.includes('Sessão expirada')) {
        return;
      }
      setError(error.message || 'Erro de conexão. Por favor, tente novamente.');
      setCatalogItems([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCatalogChange = (event) => {
    const catalogId = event.target.value;
    const catalog = catalogs.find(c => c.catalogId === catalogId);
    if (catalog) {
      setSelectedCatalog(catalog);
      const token = localStorage.getItem('authToken');
      fetchCatalogItems(catalog.groupId, token);
    }
  };

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };

  const handlePageChange = (event, value) => {
    setPage(value);
  };

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    navigate('/');
  };

  const indexOfLastItem = page * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = catalogItems.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(catalogItems.length / itemsPerPage);

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
            Sysfar HubDelivery - Catálogo
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
            Catálogo
          </Typography>
          
          {error && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {error}
            </Alert>
          )}
          
          <Paper elevation={3} sx={{ p: 3, mt: 2 }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
              <Typography variant="h6">
                Catálogos Disponíveis
              </Typography>
            </Box>
            
            {loading && catalogs.length === 0 ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel>Catálogo</InputLabel>
                  <Select
                    value={selectedCatalog ? selectedCatalog.catalogId : ''}
                    label="Catálogo"
                    onChange={handleCatalogChange}
                  >
                    {catalogs.map((catalog) => (
                      <MenuItem key={catalog.catalogId} value={catalog.catalogId}>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <span>{catalog.catalogId.substring(0, 8)}</span>
                          <Chip 
                            label={catalog.status} 
                            size="small" 
                            color={catalog.status === 'AVAILABLE' ? 'success' : 'default'} 
                          />
                        </Box>
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
                
                {selectedCatalog && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="subtitle1" sx={{ mb: 1 }}>
                      Informações do Catálogo:
                    </Typography>
                    <Grid container spacing={2}>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2">
                          <strong>ID:</strong> {selectedCatalog.catalogId}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2">
                          <strong>Status:</strong> {selectedCatalog.status}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2">
                          <strong>Grupo ID:</strong> {selectedCatalog.groupId}
                        </Typography>
                      </Grid>
                      <Grid item xs={12} sm={6} md={3}>
                        <Typography variant="body2">
                          <strong>Modificado em:</strong> {new Date(selectedCatalog.modifiedAt).toLocaleDateString('pt-BR')}
                        </Typography>
                      </Grid>
                    </Grid>
                  </Box>
                )}
                
                <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
                  <Tab label={`Itens do Catálogo (${catalogItems.length})`} />
                </Tabs>
                
                {loading ? (
                  <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                    <CircularProgress />
                  </Box>
                ) : (
                  <>
                    <TableContainer>
                      <Table>
                        <TableHead>
                          <TableRow>
                            <TableCell>Imagem</TableCell>
                            <TableCell>Nome</TableCell>
                            <TableCell>Categoria</TableCell>
                            <TableCell>EAN</TableCell>
                            <TableCell>Preço</TableCell>
                            <TableCell>Quantidade</TableCell>
                          </TableRow>
                        </TableHead>
                        <TableBody>
                          {currentItems.length > 0 ? (
                            currentItems.map((item) => (
                              <TableRow key={item.itemId}>
                                <TableCell>
                                  {item.logosUrls && item.logosUrls.length > 0 ? (
                                    <Box
                                      component="img"
                                      src={`https://logos.ifood.com.br/${item.logosUrls[0]}`}
                                      alt={item.itemName}
                                      sx={{ width: 50, height: 50, objectFit: 'cover', borderRadius: 1 }}
                                    />
                                  ) : (
                                    <Box sx={{ width: 50, height: 50, backgroundColor: '#f0f0f0', borderRadius: 1 }} />
                                  )}
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">{item.itemName}</Typography>
                                  <Typography variant="caption" color="textSecondary">
                                    {item.itemExternalCode}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">{item.categoryName}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">{item.itemEan || 'Não informado'}</Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    R$ {parseFloat(item.itemPrice?.value || 0).toFixed(2).replace('.', ',')}
                                  </Typography>
                                </TableCell>
                                <TableCell>
                                  <Typography variant="body2">
                                    {item.itemQuantity} {item.itemUnit}
                                  </Typography>
                                </TableCell>
                              </TableRow>
                            ))
                          ) : (
                            <TableRow>
                              <TableCell colSpan={6} align="center">
                                Nenhum item encontrado neste catálogo
                              </TableCell>
                            </TableRow>
                          )}
                        </TableBody>
                      </Table>
                    </TableContainer>
                    
                    {totalPages > 1 && (
                      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 3 }}>
                        <Pagination 
                          count={totalPages} 
                          page={page} 
                          onChange={handlePageChange} 
                          color="primary" 
                        />
                      </Box>
                    )}
                  </>
                )}
              </>
            )}
          </Paper>
        </Container>
      </Box>
    </Box>
  );
}

export default Catalogo;