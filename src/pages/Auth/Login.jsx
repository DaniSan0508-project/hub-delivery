import { useState, useEffect } from 'react'
import {
    Box,
    Button,
    CssBaseline,
    TextField,
    Typography,
    Paper,
    IconButton,
    InputAdornment,
    Alert,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    List,
    ListItem,
    ListItemText,
    ListItemIcon,
    Divider,
    Chip
} from '@mui/material'
import { Visibility, VisibilityOff, HelpOutline } from '@mui/icons-material'
import { validateCnpj } from '../../utils/validation'
import { useNavigate, useLocation } from 'react-router-dom'
import authService from '../../services/authService'

function Login() {
    const [cnpj, setCnpj] = useState('')
    const [password, setPassword] = useState('')
    const [secretKey, setSecretKey] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [cnpjError, setCnpjError] = useState('')
    const [loginError, setLoginError] = useState('')
    const [loading, setLoading] = useState(false)
    const [showTokenExpiredMessage, setShowTokenExpiredMessage] = useState(false)
    const [showHelp, setShowHelp] = useState(false)
    const navigate = useNavigate()
    const location = useLocation()

    useEffect(() => {
        // Verificar se veio de um redirecionamento por token expirado
        if (location.state?.tokenExpired) {
            setShowTokenExpiredMessage(true)
            // Limpar o state após mostrar a mensagem
            window.history.replaceState({}, document.title)
        }

        // Limpar token expirado do localStorage se existir
        if (localStorage.getItem('authToken')) {
            localStorage.removeItem('authToken')
        }
    }, [location])

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoginError('')

        // Validate CNPJ before submitting
        const cleanCnpj = cnpj.replace(/\D/g, '')
        if (!validateCnpj(cleanCnpj)) {
            setCnpjError('CNPJ inválido')
            return
        }

        // Validate secret key
        if (!secretKey) {
            setLoginError('Por favor, informe a chave secreta')
            return
        }

        setCnpjError('')
        setLoading(true)

        try {
            const data = await authService.login(cleanCnpj, password, secretKey)

            // Save token to localStorage
            localStorage.setItem('authToken', data.token)

            // Small delay to ensure token is saved before navigation
            setTimeout(() => {
                // Navigate to dashboard
                navigate('/dashboard')
            }, 100)
        } catch (error) {
            setLoginError(error.message || 'Erro ao fazer login')
            console.error('Login error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCnpjChange = (e) => {
        let value = e.target.value.replace(/\D/g, '')
        if (value.length > 14) value = value.substring(0, 14)

        let formattedValue = ''
        if (value.length > 0) formattedValue = value.substring(0, 2)
        if (value.length >= 2) formattedValue += '.' + value.substring(2, 5)
        if (value.length >= 5) formattedValue += '.' + value.substring(5, 8)
        if (value.length >= 8) formattedValue += '/' + value.substring(8, 12)
        if (value.length >= 12) formattedValue += '-' + value.substring(12, 14)

        setCnpj(formattedValue)

        // Clear error when user starts typing
        if (cnpjError) {
            setCnpjError('')
        }
    }

    return (
        <>
            <CssBaseline />
            <Box
                sx={{
                    minHeight: '100vh',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#f5f5f5',
                    padding: 2
                }}
            >
                <Paper
                    elevation={6}
                    sx={{
                        p: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        borderRadius: 2,
                        width: '100%',
                        maxWidth: 400,
                        position: 'relative'
                    }}
                >
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 3 }}>
                        <Typography component="h1" variant="h4" sx={{ fontWeight: 'bold', color: '#ff6b00' }}>
                            Sysfar HubDelivery
                        </Typography>
                        <IconButton
                            onClick={() => setShowHelp(true)}
                            sx={{
                                position: 'absolute',
                                top: 16,
                                right: 16,
                                color: '#ff6b00'
                            }}
                            aria-label="Ajuda"
                        >
                            <HelpOutline />
                        </IconButton>
                    </Box>

                    {showTokenExpiredMessage && (
                        <Alert severity="info" sx={{ width: '100%', mb: 2 }}>
                            Sua sessão expirou. Faça login novamente para continuar.
                        </Alert>
                    )}

                    {loginError && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {loginError}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="cnpj"
                            label="CNPJ"
                            name="cnpj"
                            autoComplete="cnpj"
                            autoFocus
                            value={cnpj}
                            onChange={handleCnpjChange}
                            placeholder="00.000.000/0000-00"
                            error={!!cnpjError}
                            helperText={cnpjError}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Senha"
                            type={showPassword ? 'text' : 'password'}
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            InputProps={{
                                endAdornment: (
                                    <InputAdornment position="end">
                                        <IconButton
                                            aria-label="toggle password visibility"
                                            onClick={() => setShowPassword(!showPassword)}
                                            edge="end"
                                        >
                                            {showPassword ? <VisibilityOff /> : <Visibility />}
                                        </IconButton>
                                    </InputAdornment>
                                )
                            }}
                        />

                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="secretKey"
                            label="Chave Secreta"
                            type="password"
                            id="secretKey"
                            value={secretKey}
                            onChange={(e) => setSecretKey(e.target.value)}
                            helperText="Informe a chave secreta de integração com a Sysfar"
                        />

                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            disabled={loading}
                            sx={{
                                mt: 3,
                                mb: 2,
                                py: 1.5,
                                backgroundColor: '#ff6b00',
                                '&:hover': {
                                    backgroundColor: '#e55e00'
                                }
                            }}
                        >
                            {loading ? 'Entrando...' : 'Entrar'}
                        </Button>
                    </Box>

                    {/* Diálogo de Ajuda */}
                    <Dialog open={showHelp} onClose={() => setShowHelp(false)} maxWidth="md" fullWidth>
                        <DialogTitle>
                            Documentação do Portal iFood | ERP - Passo a Passo
                        </DialogTitle>
                        <DialogContent dividers>
                            <Typography variant="h6" gutterBottom sx={{ mt: 2, color: '#ff6b00' }}>
                                1. Registro no iFood
                            </Typography>

                            <Typography paragraph>
                                Primeiro, você precisa registrar seu estabelecimento no portal. Esta etapa é necessária apenas uma vez.
                            </Typography>

                            <Paper elevation={2} sx={{ p: 2, my: 2, backgroundColor: '#f5f5f5' }}>
                                <Typography variant="body2" sx={{ fontFamily: 'Monospace', fontWeight: 'bold' }}>
                                    POST http://localhost:8090/api/tenant/register
                                </Typography>
                            </Paper>

                            <Typography paragraph>
                                Corpo da requisição:
                            </Typography>

                            <Paper elevation={2} sx={{ p: 2, my: 2, backgroundColor: '#f5f5f5' }}>
                                <pre style={{ margin: 0, fontFamily: 'Monospace', fontSize: '0.875rem' }}>
                                    {`{
  "registry_code": "1405",
  "merchant_id": "bd70eb8d-02c8-41f7-81eb-fc8f1370cd8c",
  "client_id": "5ca9ee0d-bf7d-427b-b999-3e1bc980dae6",
  "client_secret": "vlq0dvbqn43rtqbrkliu6jni8rpf6758dqz3ngj2x1x6iu7ri9soduiyg1ginkufsdfgra32ewyt57ouav7s7aww0p06mn2pqob"
}`}
                                </pre>
                            </Paper>

                            <Typography paragraph>
                                Resposta de sucesso (contém a chave secreta para uso no login):
                            </Typography>

                            <Paper elevation={2} sx={{ p: 2, my: 2, backgroundColor: '#f5f5f5' }}>
                                <pre style={{ margin: 0, fontFamily: 'Monospace', fontSize: '0.875rem' }}>
                                    {`{
  "secret_key": "QSYCQqThuyv02EvsLpFwaDSLSsIdTrVh"
}`}
                                </pre>
                            </Paper>

                            <Alert severity="info" sx={{ my: 2 }}>
                                <Typography variant="body2">
                                    <strong>Importante:</strong> Guarde a chave secreta gerada, pois ela será usada para fazer login no portal.
                                </Typography>
                            </Alert>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" gutterBottom sx={{ color: '#ff6b00' }}>
                                2. Login no Portal
                            </Typography>

                            <Typography paragraph>
                                Após o registro, você pode fazer login no portal usando o formulário ao lado.
                            </Typography>

                            <Typography paragraph>
                                Os campos necessários são:
                            </Typography>

                            <List>
                                <ListItem>
                                    <ListItemText primary="• CNPJ" secondary="CNPJ do estabelecimento cadastrado" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="• Senha" secondary="Senha definida durante o registro" />
                                </ListItem>
                                <ListItem>
                                    <ListItemText primary="• Chave Secreta" secondary="A chave secreta gerada no processo de registro" />
                                </ListItem>
                            </List>

                            <Alert severity="info" sx={{ my: 2 }}>
                                <Typography variant="body2">
                                    <strong>Dica:</strong> A chave secreta é gerada durante o registro e deve ser guardada com segurança.
                                </Typography>
                            </Alert>

                            <Paper elevation={2} sx={{ p: 2, my: 2, backgroundColor: '#f5f5f5' }}>
                                <pre style={{ margin: 0, fontFamily: 'Monospace', fontSize: '0.875rem' }}>
                                    {`{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}`}
                                </pre>
                            </Paper>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" gutterBottom sx={{ color: '#ff6b00' }}>
                                3. Módulos do Portal
                            </Typography>

                            <Typography paragraph>
                                Após o login, você terá acesso aos seguintes módulos:
                            </Typography>

                            <List>
                                <ListItem>
                                    <ListItemText
                                        primary="Dashboard"
                                        secondary="Visão geral das métricas e status do estabelecimento"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Sincronização"
                                        secondary="Controle e monitoramento da sincronização de dados"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Catálogo"
                                        secondary="Gestão de produtos e cardápio"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Pedidos"
                                        secondary="Visualização e gerenciamento de pedidos recebidos"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Loja"
                                        secondary="Configurações da loja e horários de funcionamento"
                                    />
                                </ListItem>
                                <ListItem>
                                    <ListItemText
                                        primary="Promoções"
                                        secondary="Criação e gerenciamento de promoções"
                                    />
                                </ListItem>
                            </List>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" gutterBottom sx={{ color: '#ff6b00' }}>
                                4. Endpoints da API
                            </Typography>

                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                A. Endpoints de Status
                            </Typography>

                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <Chip label="GET" color="primary" size="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="/api/erp/merchant/status"
                                        secondary="Obtém o status do merchant no iFood"
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <Chip label="GET" color="primary" size="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="/api/erp/catalog/status"
                                        secondary="Obtém o status do catálogo de produtos"
                                    />
                                </ListItem>
                            </List>

                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                B. Endpoints de Pedidos
                            </Typography>

                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <Chip label="GET" color="primary" size="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="/api/erp/orders/recent"
                                        secondary="Obtém os pedidos recentes"
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <Chip label="GET" color="primary" size="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="/api/erp/orders"
                                        secondary="Obtém todos os pedidos"
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <Chip label="PUT" color="secondary" size="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="/api/orders/{orderId}/status"
                                        secondary="Atualiza o status de um pedido específico"
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <Chip label="POST" color="success" size="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="/api/orders/{orderId}/start-separation"
                                        secondary="Inicia a separação de um pedido"
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <Chip label="POST" color="success" size="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="/api/orders/{orderId}/end-separation"
                                        secondary="Finaliza a separação de um pedido"
                                    />
                                </ListItem>
                            </List>

                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                C. Endpoints de Produtos
                            </Typography>

                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <Chip label="GET" color="primary" size="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="/api/erp/products"
                                        secondary="Obtém a lista de produtos cadastrados"
                                    />
                                </ListItem>
                            </List>

                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                D. Endpoints de Loja
                            </Typography>

                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <Chip label="GET" color="primary" size="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="/api/hub/ifood/merchant/interruptions"
                                        secondary="Obtém as interrupções agendadas da loja"
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <Chip label="POST" color="success" size="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="/api/hub/ifood/merchant/interruptions"
                                        secondary="Cria uma nova interrupção na loja"
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <Chip label="GET" color="primary" size="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="/api/hub/ifood/merchant/opening-hours"
                                        secondary="Obtém os horários de funcionamento da loja"
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <Chip label="PUT" color="secondary" size="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="/api/hub/ifood/merchant/opening-hours"
                                        secondary="Atualiza os horários de funcionamento da loja"
                                    />
                                </ListItem>
                            </List>

                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                E. Endpoints de Promoções
                            </Typography>

                            <List>
                                <ListItem>
                                    <ListItemIcon>
                                        <Chip label="GET" color="primary" size="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="/api/erp/promotions"
                                        secondary="Obtém a lista de promoções"
                                    />
                                </ListItem>

                                <ListItem>
                                    <ListItemIcon>
                                        <Chip label="POST" color="success" size="small" />
                                    </ListItemIcon>
                                    <ListItemText
                                        primary="/api/erp/promotions/sync"
                                        secondary="Cria uma nova promoção"
                                    />
                                </ListItem>
                            </List>

                            <Divider sx={{ my: 3 }} />

                            <Typography variant="h6" gutterBottom sx={{ color: '#ff6b00' }}>
                                5. Exemplos de Requisições
                            </Typography>

                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                A. Criar Interrupção na Loja
                            </Typography>

                            <Paper elevation={2} sx={{ p: 2, my: 2, backgroundColor: '#f5f5f5' }}>
                                <Typography variant="body2" sx={{ fontFamily: 'Monospace', fontWeight: 'bold' }}>
                                    POST /api/hub/ifood/merchant/interruptions
                                </Typography>
                            </Paper>

                            <Typography paragraph>
                                Corpo da requisição:
                            </Typography>

                            <Paper elevation={2} sx={{ p: 2, my: 2, backgroundColor: '#f5f5f5' }}>
                                <pre style={{ margin: 0, fontFamily: 'Monospace', fontSize: '0.875rem' }}>
                                    {`{
  "description": "Manutenção preventiva",
  "start": "2023-12-25T08:00:00",
  "end": "2023-12-25T12:00:00"
}`}
                                </pre>
                            </Paper>

                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                B. Atualizar Horários de Funcionamento
                            </Typography>

                            <Paper elevation={2} sx={{ p: 2, my: 2, backgroundColor: '#f5f5f5' }}>
                                <Typography variant="body2" sx={{ fontFamily: 'Monospace', fontWeight: 'bold' }}>
                                    PUT /api/hub/ifood/merchant/opening-hours
                                </Typography>
                            </Paper>

                            <Typography paragraph>
                                Corpo da requisição:
                            </Typography>

                            <Paper elevation={2} sx={{ p: 2, my: 2, backgroundColor: '#f5f5f5' }}>
                                <pre style={{ margin: 0, fontFamily: 'Monospace', fontSize: '0.875rem' }}>
                                    {`{
  "shifts": [
    {
      "dayOfWeek": "MONDAY",
      "start": "08:00:00",
      "end": "22:00:00"
    },
    {
      "dayOfWeek": "TUESDAY",
      "start": "08:00:00",
      "end": "22:00:00"
    }
  ]
}`}
                                </pre>
                            </Paper>

                            <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                                C. Criar Promoção
                            </Typography>

                            <Paper elevation={2} sx={{ p: 2, my: 2, backgroundColor: '#f5f5f5' }}>
                                <Typography variant="body2" sx={{ fontFamily: 'Monospace', fontWeight: 'bold' }}>
                                    POST /api/erp/promotions/sync
                                </Typography>
                            </Paper>

                            <Typography paragraph>
                                Corpo da requisição (exemplo de promoção percentual):
                            </Typography>

                            <Paper elevation={2} sx={{ p: 2, my: 2, backgroundColor: '#f5f5f5' }}>
                                <pre style={{ margin: 0, fontFamily: 'Monospace', fontSize: '0.875rem' }}>
                                    {`{
  "aggregationTag": "promocao-percentage-1698745231456",
  "promotions": [
    {
      "promotionName": "Desconto de 20%",
      "channels": ["IFOOD-APP"],
      "items": [
        {
          "ean": "7891234567890",
          "initialDate": "2023-12-01",
          "finalDate": "2023-12-31",
          "promotionType": "PERCENTAGE",
          "discountValue": 20.0
        }
      ]
    }
  ]
}`}
                                </pre>
                            </Paper>

                            <Typography paragraph>
                                Corpo da requisição (exemplo de promoção Leve X Pague Y):
                            </Typography>

                            <Paper elevation={2} sx={{ p: 2, my: 2, backgroundColor: '#f5f5f5' }}>
                                <pre style={{ margin: 0, fontFamily: 'Monospace', fontSize: '0.875rem' }}>
                                    {`{
  "aggregationTag": "promocao-lxpy-1698745231457",
  "promotions": [
    {
      "promotionName": "Leve 3 Pague 2",
      "channels": ["IFOOD-APP"],
      "items": [
        {
          "ean": "7891234567891",
          "initialDate": "2023-12-01",
          "finalDate": "2023-12-31",
          "promotionType": "LXPY",
          "discountValue": null,
          "progressiveDiscount": {
            "quantityToBuy": 3,
            "quantityToPay": 2
          }
        }
      ]
    }
  ]
}`}
                                </pre>
                            </Paper>
                        </DialogContent>
                        <DialogActions>
                            <Button onClick={() => setShowHelp(false)} color="primary">
                                Fechar
                            </Button>
                        </DialogActions>
                    </Dialog>
                </Paper>
            </Box>
        </>
    )
}

export default Login