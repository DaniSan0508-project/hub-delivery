import { useState } from 'react'
import {
    Box,
    Button,
    CssBaseline,
    TextField,
    Typography,
    Paper,
    IconButton,
    InputAdornment,
    FormHelperText,
    Alert
} from '@mui/material'
import { Visibility, VisibilityOff } from '@mui/icons-material'
import { validateCnpj } from './utils/validation'
import { useNavigate } from 'react-router-dom'

function App() {
    const [cnpj, setCnpj] = useState('')
    const [password, setPassword] = useState('')
    const [secretKey, setSecretKey] = useState('')
    const [showPassword, setShowPassword] = useState(false)
    const [cnpjError, setCnpjError] = useState('')
    const [loginError, setLoginError] = useState('')
    const [loading, setLoading] = useState(false)
    const navigate = useNavigate()

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoginError('')

        const cleanCnpj = cnpj.replace(/\D/g, '')
        if (!validateCnpj(cleanCnpj)) {
            setCnpjError('CNPJ inválido')
            return
        }

        if (!secretKey) {
            setLoginError('Por favor, informe a chave secreta')
            return
        }

        setCnpjError('')
        setLoading(true)

        try {
            const loginData = {
                cnpj: cleanCnpj,
                password: password,
                secret_key: secretKey
            }

            const response = await fetch('http://localhost:8090/api/erp/login', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(loginData)
            })

            const data = await response.json()

            if (response.ok) {
                localStorage.setItem('authToken', data.token)
                setTimeout(() => {
                    navigate('/dashboard')
                }, 100)
            } else {
                setLoginError(data.message || 'Erro ao fazer login')
            }
        } catch (error) {
            setLoginError('Erro de conexão. Por favor, tente novamente.')
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
                        maxWidth: 400
                    }}
                >
                    <Typography component="h1" variant="h4" sx={{ mb: 3, fontWeight: 'bold', color: '#ff6b00' }}>
                        Portal iFood
                    </Typography>

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
                            helperText="Informe a chave secreta de integração com o iFood"
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
                </Paper>
            </Box>
        </>
    )
}

export default App