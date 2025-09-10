import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'
import Dashboard from './Dashboard.jsx'
import Sincronizacao from './Sincronizacao.jsx'
import Catalogo from './Catalogo.jsx'
import Pedidos from './Pedidos.jsx'
import Loja from './Loja.jsx'
import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { createTheme, ThemeProvider } from '@mui/material/styles'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

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
])

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ThemeProvider theme={theme}>
      <RouterProvider router={router} />
    </ThemeProvider>
  </StrictMode>,
)
