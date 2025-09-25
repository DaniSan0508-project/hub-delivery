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
    Card,
    CardContent,
    CardActions,
    TextField,
    InputAdornment,
    Checkbox,
    FormControlLabel
} from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';
import { Menu as MenuIcon, Delete as DeleteIcon } from '@mui/icons-material';
import Sidebar from '../../components/Sidebar';
import storeService from '../../services/storeService';

const drawerWidth = 240;

const daysOfWeek = [
    { label: 'Domingo', value: 1, apiValue: 'SUNDAY' },
    { label: 'Segunda-feira', value: 2, apiValue: 'MONDAY' },
    { label: 'Terça-feira', value: 3, apiValue: 'TUESDAY' },
    { label: 'Quarta-feira', value: 4, apiValue: 'WEDNESDAY' },
    { label: 'Quinta-feira', value: 5, apiValue: 'THURSDAY' },
    { label: 'Sexta-feira', value: 6, apiValue: 'FRIDAY' },
    { label: 'Sábado', value: 7, apiValue: 'SATURDAY' },
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
            ...day,
            checked: false,
            start: '',
            end: ''
        }))
    );

    const [openingHoursLoading, setOpeningHoursLoading] = useState(false);
    const [openingHoursMessage, setOpeningHoursMessage] = useState(null);
    const [currentStoreStatus, setCurrentStoreStatus] = useState(null);
    const [storeStatusLoading, setStoreStatusLoading] = useState(false);
    const [storeStatusMessage, setStoreStatusMessage] = useState(null);


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
                // Adicionar um pequeno atraso para evitar corrida com outras chamadas
                setTimeout(() => {
                    if (isMounted) {
                        fetchMerchantStatus(token);
                        fetchInterruptions(token);
                        fetchOpeningHours(token);
                        fetchStoreStatus(token);
                    }
                }, 300);
            }
        }

        return () => {
            isMounted = false;
        };
    }, [navigate]);

    const fetchMerchantStatus = async (token) => {
        try {
            setStatusLoading(true);
            const merchantStatus = await storeService.getMerchantStatus(token);
            setMerchantStatus(merchantStatus);
        } catch (error) {
            console.error('Error fetching merchant status:', error);
            // Verificar se é um erro de token expirado
            if (error.message && error.message.includes('Sessão expirada')) {
                // O serviço já lidou com o redirecionamento
                return;
            }
            setError(error.message || 'Erro de conexão ao carregar status do merchant');
        } finally {
            setStatusLoading(false);
        }
    };

    const fetchStoreStatus = async (token) => {
        try {
            setStoreStatusLoading(true);
            const storeStatus = await storeService.getMerchantStatus(token);
            setCurrentStoreStatus(storeStatus.status);
        } catch (error) {
            console.error('Error fetching store status:', error);
            // Verificar se é um erro de token expirado
            if (error.message && error.message.includes('Sessão expirada')) {
                // O serviço já lidou com o redirecionamento
                return;
            }
            setStoreStatusMessage({ severity: 'error', message: error.message || 'Erro de conexão ao carregar o status da loja.' });
        } finally {
            setStoreStatusLoading(false);
        }
    };

    const handleUpdateStoreStatus = async (status) => {
        try {
            setStoreStatusLoading(true);
            setStoreStatusMessage(null);
            const token = localStorage.getItem('authToken');
            const response = await storeService.updateStoreStatus(status, token);

            setStoreStatusMessage({ severity: 'success', message: `Status da loja alterado para ${status} com sucesso!` });
            setCurrentStoreStatus(status);
        } catch (error) {
            console.error('Error updating store status:', error);
            // Verificar se é um erro de token expirado
            if (error.message && error.message.includes('Sessão expirada')) {
                // O serviço já lidou com o redirecionamento
                return;
            }
            setStoreStatusMessage({ severity: 'error', message: error.message || 'Erro de conexão. Não foi possível atualizar o status.' });
        } finally {
            setStoreStatusLoading(false);
        }
    };

    const fetchInterruptions = async (token) => {
        try {
            setInterruptionsLoading(true);
            const interruptions = await storeService.getInterruptions(token);
            setInterruptionsList(interruptions);
        } catch (error) {
            console.error('Error fetching interruptions:', error);
            // Verificar se é um erro de token expirado
            if (error.message && error.message.includes('Sessão expirada')) {
                // O serviço já lidou com o redirecionamento
                return;
            }
            setError(error.message || 'Erro de conexão ao carregar interrupções.');
        } finally {
            setInterruptionsLoading(false);
        }
    };

    const fetchOpeningHours = async (token) => {
        try {
            setOpeningHoursLoading(true);
            const openingHours = await storeService.getOpeningHours(token);
            const apiShifts = openingHours.shifts;

            const updatedOpeningHours = daysOfWeek.map(day => {
                const shift = apiShifts.find(s => s.dayOfWeek === day.apiValue);
                return {
                    ...day,
                    checked: !!shift,
                    start: shift ? shift.start.substring(0, 5) : '',
                    end: shift ? shift.end.substring(0, 5) : ''
                };
            });
            setOpeningHoursData(updatedOpeningHours);
        } catch (error) {
            console.error('Erro de conexão ao carregar horários:', error);
            // Verificar se é um erro de token expirado
            if (error.message && error.message.includes('Sessão expirada')) {
                // O serviço já lidou com o redirecionamento
                return;
            }
        } finally {
            setOpeningHoursLoading(false);
        }
    };


    const handleCreateInterruption = async () => {
        try {
            setInterruptionLoading(true);
            setInterruptionMessage(null);

            const token = localStorage.getItem('authToken');
            const response = await storeService.createInterruption(interruptionData, token);

            setInterruptionMessage({
                severity: 'success',
                message: 'Interrupção de loja criada com sucesso!'
            });
            fetchInterruptions(token);
        } catch (error) {
            console.error('Error creating interruption:', error);

            // Verificar se é um erro de token expirado
            if (error.message && error.message.includes('Sessão expirada')) {
                // O serviço já lidou com o redirecionamento
                return;
            }

            let errorMessage = error.message || 'Erro de conexão. Não foi possível criar a interrupção.';
            setInterruptionMessage({
                severity: 'error',
                message: errorMessage
            });
        } finally {
            setInterruptionLoading(false);
        }
    };

    const handleDeleteInterruption = async (id) => {
        try {
            const token = localStorage.getItem('authToken');
            await storeService.deleteInterruption(id, token);

            setInterruptionMessage({
                severity: 'success',
                message: 'Interrupção de loja excluída com sucesso!'
            });
            fetchInterruptions(token);
        } catch (error) {
            console.error('Error deleting interruption:', error);

            // Verificar se é um erro de token expirado
            if (error.message && error.message.includes('Sessão expirada')) {
                // O serviço já lidou com o redirecionamento
                return;
            }

            let errorMessage = error.message || 'Erro de conexão. Não foi possível excluir a interrupção.';
            setInterruptionMessage({
                severity: 'error',
                message: errorMessage
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
                    dayOfWeek: day.value,
                    start: day.start + ':00',
                    end: day.end + ':00'
                }));

            const token = localStorage.getItem('authToken');
            await storeService.updateOpeningHours(shifts, token);

            setOpeningHoursMessage({
                severity: 'success',
                message: 'Horários de funcionamento atualizados com sucesso!'
            });
        } catch (error) {
            console.error('Error updating opening hours:', error);

            // Verificar se é um erro de token expirado
            if (error.message && error.message.includes('Sessão expirada')) {
                // O serviço já lidou com o redirecionamento
                return;
            }

            let errorMessage = error.message || 'Erro de conexão. Não foi possível atualizar os horários.';
            setOpeningHoursMessage({
                severity: 'error',
                message: errorMessage
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
                        Sysfar HubDelivery - Loja
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
                <Typography variant="h6" color="grey">
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
                                                <Alert severity="warning">
                                                    <Typography variant="h6">Loja fechada</Typography>
                                                    {merchantStatus.data && merchantStatus.data.problems && merchantStatus.data.problems.length > 0 ? (
                                                        merchantStatus.data.problems.map((problem, index) => (
                                                            <Typography key={index}>
                                                                {problem.description || problem}
                                                            </Typography>
                                                        ))
                                                    ) : (
                                                        <Typography>
                                                            A loja está temporariamente fechada. Verifique os horários de funcionamento.
                                                        </Typography>
                                                    )}
                                                    <Button
                                                        variant="contained"
                                                        color="primary"
                                                        sx={{ mt: 1 }}
                                                        href="https://portal.ifood.com.br"
                                                        target="_blank"
                                                    >
                                                        Verificar no Sysfar HubDelivery
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
                                    {openingHoursLoading ? (
                                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 2 }}>
                                            <CircularProgress />
                                        </Box>
                                    ) : (
                                        <Grid container spacing={2} alignItems="center">
                                            {openingHoursData.map((day, index) => {
                                                return (
                                                    <Grid item xs={12} key={day.value}>
                                                        <Grid container spacing={2} alignItems="center">
                                                            <Grid item xs={12} sm={4}>
                                                                <FormControlLabel
                                                                    control={
                                                                        <Checkbox
                                                                            checked={day.checked}
                                                                            onChange={(e) => handleOpeningHoursFormChange(index, 'checked', e.target.checked)}
                                                                        />
                                                                    }
                                                                    label={day.label}
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
                                                );
                                            })}
                                        </Grid>
                                    )}
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
                        </Paper>
                    </Grid>
                </Grid>
            </Box>
        </Box >
    );
}

export default Loja;