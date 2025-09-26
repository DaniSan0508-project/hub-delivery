import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './pages/Auth/Login.jsx'
import Dashboard from './pages/Dashboard/Dashboard.jsx'
import Sincronizacao from './pages/Sincronizacao/Sincronizacao.jsx'
import Catalogo from './pages/Catalogo/Catalogo.jsx'
import Pedidos from './pages/Pedidos/Pedidos.jsx'
import Loja from './pages/Loja/Loja.jsx'
import Promocoes from './pages/Promocoes/Promocoes.jsx'
import { useStoreStatus } from './hooks/useStoreStatus.js'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'

const theme = createTheme({
  palette: {
    primary: {
      main: '#ff6b00',
    },
    secondary: {
      main: '#333333',
    },
  },
  typography: {
    fontFamily: 'Roboto, sans-serif',
  },
})

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // 5 minutes
      cacheTime: 1000 * 60 * 10, // 10 minutes
      retry: 1,
      refetchOnWindowFocus: false,
    },
  },
})

const router = createBrowserRouter([
  {
    path: "/",
    element: <App />,
  },
  {
    path: "/dashboard",
    element: <Dashboard />,
  },
  {
    path: "/sincronizacao",
    element: <Sincronizacao />,
  },
  {
    path: "/catalogo",
    element: <Catalogo />,
  },
  {
    path: "/pedidos",
    element: <Pedidos />,
  },
  {
    path: "/loja",
    element: <Loja />,
  },
  {
    path: "/promocoes",
    element: <Promocoes />,
  },
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <QueryClientProvider client={queryClient}>
      <ThemeProvider theme={theme}>
        <RouterProvider router={router} />
      </ThemeProvider>
    </QueryClientProvider>
  </StrictMode>,
)
