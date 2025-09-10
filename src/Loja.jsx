import { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Container,
    Toolbar,
    Button,
    Paper,
    Grid,
    Drawer,
    CssBaseline,
    AppBar,
    IconButton,
    CircularProgress,
    Alert,
    Divider,
    List,
    ListItem,
    ListItemIcon,
    ListItemText,
    Card,
    CardContent,
    CardActions,
    TextField,
    InputAdornment,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import {
    Dashboard as DashboardIcon,
    Restaurant as RestaurantIcon,
    Sync as SyncIcon,
    Store as StoreIcon,
    Category as CategoryIcon,
    Menu as MenuIcon,
    Delete as DeleteIcon
} from '@mui/icons-material';

const drawerWidth = 240;

const daysOfWeek = [
    { label: 'Segunda-feira', value: 1 },
    { label: 'Terça-feira', value: 2 },
    { label: 'Quarta-feira', value: 3 },
    { label: 'Quinta-feira', value: 4 },
    { label: 'Sexta-feira', value: 5 },
    { label: 'Sábado', value: 6 },
    { label: 'Domingo', value: 7 },
];

function Loja() {
    const navigate = useNavigate();
    const location = useLocation();
    const [user, setUser] = useState(null);
    const [mobileOpen, setMobileOpen] = useState(false);
    const [error, setError] = useState(null);
    const [merchantStatus, setMerchantStatus] = useState(null);
    const [statusLoading, setStatusLoading] = useState(false);
    const [interruptionData, setInterruptionData] = useState({
        description: '',
        start: '',
        end: ''
    });
    const [interruptionLoading, setInterruptionLoading] = useState(false);
    const [interruptionMessage, setInterruptionMessage] = useState(null);
    const [interruptionsList, setInterruptionsList] = useState([]);
    const [interruptionsLoading, setInterruptionsLoading] = useState(false);
    const [openingHoursData, setOpeningHoursData] = useState(
        daysOfWeek.map(day => ({
            dayOfWeek: day.value,
            checked: false,
            start: '',
            end: ''
        }))
    );
    const [openingHoursLoading, setOpeningHoursLoading] = useState(false);
    const [openingHoursMessage, setOpeningHoursMessage] = useState(null);

    useEffect(() => {
        const token = localStorage.getItem('authToken');
        if (!token) {
            navigate('/');
        } else {
            setUser({ name: 'Usuário' });
            fetchMerchantStatus(token);
            fetchInterruptions(token);
            // Poderia ter uma chamada para carregar os horários atuais aqui, se a API suportar
            // fetchOpeningHours(token);
        }
    }, [navigate]);

    const fetchMerchantStatus = async (token) => {
        try {
            setStatusLoading(true);
            const response = await fetch('http://localhost:8090/api/hub/ifood/merchant/status', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setMerchantStatus(data);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Erro ao carregar status do merchant');
            }
        } catch (error) {
            console.error('Error fetching merchant status:', error);
            setError('Erro de conexão ao carregar status do merchant');
        } finally {
            setStatusLoading(false);
        }
    };

    const fetchInterruptions = async (token) => {
        try {
            setInterruptionsLoading(true);
            const response = await fetch('http://localhost:8090/api/hub/ifood/merchant/interruptions', {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setInterruptionsList(data);
            } else {
                const errorData = await response.json();
                setError(errorData.message || 'Erro ao carregar lista de interrupções.');
            }
        } catch (error) {
            console.error('Error fetching interruptions:', error);
            setError('Erro de conexão ao carregar interrupções.');
        } finally {
            setInterruptionsLoading(false);
        }
    };

    const handleCreateInterruption = async () => {
        try {
            setInterruptionLoading(true);
            setInterruptionMessage(null);

            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8090/api/hub/ifood/merchant/interruptions', {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(interruptionData)
            });

            if (response.ok) {
                setInterruptionMessage({
                    severity: 'success',
                    message: 'Interrupção de loja criada com sucesso!'
                });
                fetchInterruptions(token);
            } else {
                const errorData = await response.json();
                setInterruptionMessage({
                    severity: 'error',
                    message: errorData.message || 'Erro ao criar interrupção de loja.'
                });
            }
        } catch (error) {
            console.error('Error creating interruption:', error);
            setInterruptionMessage({
                severity: 'error',
                message: 'Erro de conexão. Não foi possível criar a interrupção.'
            });
        } finally {
            setInterruptionLoading(false);
        }
    };

    const handleDeleteInterruption = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(`http://localhost:8090/api/hub/ifood/merchant/interruptions/${id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                }
            });

            if (response.ok) {
                setInterruptionMessage({
                    severity: 'success',
                    message: 'Interrupção de loja excluída com sucesso!'
                });
                fetchInterruptions(token);
            } else {
                const errorData = await response.json();
                setInterruptionMessage({
                    severity: 'error',
                    message: errorData.message || 'Erro ao excluir interrupção.'
                });
            }
        } catch (error) {
            console.error('Error deleting interruption:', error);
            setInterruptionMessage({
                severity: 'error',
                message: 'Erro de conexão. Não foi possível excluir a interrupção.'
            });
        }
    };

    const handleUpdateOpeningHours = async () => {
        try {
            setOpeningHoursLoading(true);
            setOpeningHoursMessage(null);

            const shifts = openingHoursData
                .filter(day => day.checked)
                .map(day => ({
                    dayOfWeek: day.dayOfWeek,
                    start: day.start + ':00',
                    end: day.end + ':00'
                }));

            const token = localStorage.getItem('authToken');
            const response = await fetch('http://localhost:8090/api/hub/ifood/merchant/opening-hours', {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ shifts })
            });

            if (response.ok) {
                setOpeningHoursMessage({
                    severity: 'success',
                    message: 'Horários de funcionamento atualizados com sucesso!'
                });
            } else {
                const errorData = await response.json();
                setOpeningHoursMessage({
                    severity: 'error',
                    message: errorData.message || 'Erro ao atualizar horários.'
                });
            }
        } catch (error) {
            console.error('Error updating opening hours:', error);
            setOpeningHoursMessage({
                severity: 'error',
                message: 'Erro de conexão. Não foi possível atualizar os horários.'
            });
        } finally {
            setOpeningHoursLoading(false);
        }
    };

    const handleInterruptionFormChange = (event) => {
        const { name, value } = event.target;
        setInterruptionData(prevData => ({
            ...prevData,
            [name]: value
        }));
    };

    const handleOpeningHoursFormChange = (index, field, value) => {
        const updatedData = [...openingHoursData];
        updatedData[index][field] = value;
        setOpeningHoursData(updatedData);
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
                        keepMounted: true,
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

                    <Grid container spacing={3}>
                        <Grid item xs={12}>
                            <Paper elevation={3} sx={{ p: 3 }}>
                                <Typography variant="h6" gutterBottom>
                                    Manutenção da Loja
                                </Typography>
                                <Divider sx={{ mb: 2 }} />

                                {/* Status da Loja */}
                                <Card variant="outlined" sx={{ mb: 3 }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Status da Integração
                                        </Typography>
                                        {statusLoading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : merchantStatus ? (
                                            <Box>
                                                {merchantStatus.data && merchantStatus.data.state === 'OK' ? (
                                                    <Alert severity="success">
                                                        <Typography variant="h6">Loja funcionando normalmente</Typography>
                                                        <Typography>
                                                            A integração com o iFood está operando corretamente.
                                                        </Typography>
                                                    </Alert>
                                                ) : (
                                                    <Alert severity="error">
                                                        <Typography variant="h6">Problemas detectados na integração</Typography>
                                                        <Typography>
                                                            {merchantStatus.data && merchantStatus.data.problems && merchantStatus.data.problems.length > 0
                                                                ? merchantStatus.data.problems.join(', ')
                                                                : 'Verifique o status da sua loja no portal do iFood.'
                                                            }
                                                        </Typography>
                                                        <Button
                                                            variant="contained"
                                                            color="error"
                                                            sx={{ mt: 1 }}
                                                            href="https://portal.ifood.com.br"
                                                            target="_blank"
                                                        >
                                                            Verificar no Portal iFood
                                                        </Button>
                                                    </Alert>
                                                )}
                                                <Box sx={{ mt: 2 }}>
                                                    <Typography variant="body2" color="textSecondary">
                                                        Última verificação: {new Date().toLocaleString()}
                                                    </Typography>
                                                    <Button
                                                        variant="outlined"
                                                        sx={{ mt: 1 }}
                                                        onClick={() => fetchMerchantStatus(localStorage.getItem('authToken'))}
                                                    >
                                                        Atualizar Status
                                                    </Button>
                                                </Box>
                                            </Box>
                                        ) : (
                                            <Typography>Carregando status da loja...</Typography>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Horários de Funcionamento */}
                                <Card variant="outlined" sx={{ mb: 3 }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Horários de Funcionamento
                                        </Typography>
                                        <Grid container spacing={2} alignItems="center">
                                            {openingHoursData.map((day, index) => (
                                                <Grid item xs={12} key={day.dayOfWeek}>
                                                    <Grid container spacing={2} alignItems="center">
                                                        <Grid item xs={12} sm={4}>
                                                            <FormControlLabel
                                                                control={
                                                                    <Checkbox
                                                                        checked={day.checked}
                                                                        onChange={(e) => handleOpeningHoursFormChange(index, 'checked', e.target.checked)}
                                                                    />
                                                                }
                                                                label={daysOfWeek.find(d => d.value === day.dayOfWeek).label}
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6} sm={4}>
                                                            <TextField
                                                                fullWidth
                                                                label="Início"
                                                                type="time"
                                                                value={day.start}
                                                                onChange={(e) => handleOpeningHoursFormChange(index, 'start', e.target.value)}
                                                                disabled={!day.checked}
                                                                InputLabelProps={{ shrink: true }}
                                                                size="small"
                                                            />
                                                        </Grid>
                                                        <Grid item xs={6} sm={4}>
                                                            <TextField
                                                                fullWidth
                                                                label="Fim"
                                                                type="time"
                                                                value={day.end}
                                                                onChange={(e) => handleOpeningHoursFormChange(index, 'end', e.target.value)}
                                                                disabled={!day.checked}
                                                                InputLabelProps={{ shrink: true }}
                                                                size="small"
                                                            />
                                                        </Grid>
                                                    </Grid>
                                                </Grid>
                                            ))}
                                        </Grid>
                                        <Box sx={{ mt: 2, textAlign: 'right' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleUpdateOpeningHours}
                                                disabled={openingHoursLoading}
                                            >
                                                {openingHoursLoading ? <CircularProgress size={24} /> : 'Salvar Horários'}
                                            </Button>
                                        </Box>
                                        {openingHoursMessage && (
                                            <Alert severity={openingHoursMessage.severity} sx={{ mt: 2 }}>
                                                {openingHoursMessage.message}
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Criar Interrupção */}
                                <Card variant="outlined" sx={{ mb: 3 }}>
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Criar Interrupção de Loja
                                        </Typography>
                                        <Grid container spacing={2}>
                                            <Grid item xs={12}>
                                                <TextField
                                                    fullWidth
                                                    label="Descrição da Interrupção"
                                                    name="description"
                                                    value={interruptionData.description}
                                                    onChange={handleInterruptionFormChange}
                                                    variant="outlined"
                                                    size="small"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Início"
                                                    type="datetime-local"
                                                    name="start"
                                                    value={interruptionData.start}
                                                    onChange={handleInterruptionFormChange}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    size="small"
                                                />
                                            </Grid>
                                            <Grid item xs={12} sm={6}>
                                                <TextField
                                                    fullWidth
                                                    label="Fim"
                                                    type="datetime-local"
                                                    name="end"
                                                    value={interruptionData.end}
                                                    onChange={handleInterruptionFormChange}
                                                    InputLabelProps={{
                                                        shrink: true,
                                                    }}
                                                    size="small"
                                                />
                                            </Grid>
                                        </Grid>
                                        <Box sx={{ mt: 2, textAlign: 'right' }}>
                                            <Button
                                                variant="contained"
                                                color="primary"
                                                onClick={handleCreateInterruption}
                                                disabled={interruptionLoading}
                                            >
                                                {interruptionLoading ? <CircularProgress size={24} /> : 'Agendar Interrupção'}
                                            </Button>
                                        </Box>
                                        {interruptionMessage && (
                                            <Alert severity={interruptionMessage.severity} sx={{ mt: 2 }}>
                                                {interruptionMessage.message}
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>

                                {/* Lista de Interrupções Agendadas */}
                                <Card variant="outlined">
                                    <CardContent>
                                        <Typography variant="subtitle1" gutterBottom>
                                            Interrupções Agendadas
                                        </Typography>
                                        {interruptionsLoading ? (
                                            <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                                <CircularProgress />
                                            </Box>
                                        ) : interruptionsList.length > 0 ? (
                                            <Grid container spacing={2}>
                                                {interruptionsList.map((interruption) => (
                                                    <Grid item xs={12} key={interruption.id}>
                                                        <Card variant="outlined">
                                                            <CardContent>
                                                                <Typography variant="body1" sx={{ fontWeight: 'bold' }}>
                                                                    {interruption.description}
                                                                </Typography>
                                                                <Typography variant="body2" color="textSecondary">
                                                                    **Início:** {new Date(interruption.start).toLocaleString()}
                                                                </Typography>
                                                                <Typography variant="body2" color="textSecondary">
                                                                    **Fim:** {new Date(interruption.end).toLocaleString()}
                                                                </Typography>
                                                            </CardContent>
                                                            <CardActions sx={{ justifyContent: 'flex-end' }}>
                                                                <IconButton
                                                                    aria-label="excluir"
                                                                    color="error"
                                                                    onClick={() => handleDeleteInterruption(interruption.id)}
                                                                >
                                                                    <DeleteIcon />
                                                                </IconButton>
                                                            </CardActions>
                                                        </Card>
                                                    </Grid>
                                                ))}
                                            </Grid>
                                        ) : (
                                            <Alert severity="info">
                                                Nenhuma interrupção agendada.
                                            </Alert>
                                        )}
                                    </CardContent>
                                </Card>
                            </Paper>
                        </Grid>
                    </Grid>
                </Container>
            </Box>
        </Box>
    );
}

export default Loja;