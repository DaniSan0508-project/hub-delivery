try {
  import('./src/pages/Pedidos/Pedidos.jsx').then(module => {
  }).catch(err => {
    console.error('Error importing Pedidos.jsx:', err);
  });
  
  import('./src/components/OrderDetailsModal.jsx').then(module => {
  }).catch(err => {
    console.error('Error importing OrderDetailsModal.jsx:', err);
  });
} catch (error) {
  console.error('Error in test file:', error);
}