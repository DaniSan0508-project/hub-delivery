try {
  import('./Pedidos.jsx').then(module => {
  }).catch(err => {
    console.error('Error importing Pedidos.jsx:', err);
  });
  
  import('./Loja.jsx').then(module => {
  }).catch(err => {
    console.error('Error importing Loja.jsx:', err);
  });
} catch (error) {
  console.error('Error in test file:', error);
}