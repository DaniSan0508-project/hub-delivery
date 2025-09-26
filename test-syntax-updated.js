try {
  import('./src/pages/Pedidos/Pedidos.jsx').then(module => {
    console.log('Pedidos.jsx imported successfully');
    console.log('Default export:', typeof module.default);
  }).catch(err => {
    console.error('Error importing Pedidos.jsx:', err);
  });
  
  import('./src/components/OrderDetailsModal.jsx').then(module => {
    console.log('OrderDetailsModal.jsx imported successfully');
    console.log('Default export:', typeof module.default);
  }).catch(err => {
    console.error('Error importing OrderDetailsModal.jsx:', err);
  });
} catch (error) {
  console.error('Error in test file:', error);
}