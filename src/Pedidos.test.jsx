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
  Chip,
  Drawer,
  CssBaseline,
  AppBar,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
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

function Pedidos() {
  return (
    <Box>
      <Typography>Test Pedidos Component</Typography>
    </Box>
  );
}

export default Pedidos;