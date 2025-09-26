try {
  import('./Pedidos.jsx').then(module => {
    console.log('Pedidos.jsx imported successfully');
    console.log('Default export:', typeof module.default);
  }).catch(err => {
    console.error('Error importing Pedidos.jsx:', err);
  });
  
  import('./Loja.jsx').then(module => {
    console.log('Loja.jsx imported successfully');
    console.log('Default export:', typeof module.default);
  }).catch(err => {
    console.error('Error importing Loja.jsx:', err);
  });
} catch (error) {
  console.error('Error in test file:', error);
}