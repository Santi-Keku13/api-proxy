const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// CORS configurado correctamente
app.use(cors({
  origin: 'https://verificador-web.netlify.app',
  methods: ['GET']
}));

// Ruta de verificación de salud
app.get('/', (req, res) => {
  res.json({
    status: "API operativa",
    endpoints: {
      buscarProductos: "/api/productos?codigo=XXX"
    }
  });
});

// Proxy mejorado
app.get('/api/productos', async (req, res) => {
  try {
    const { codigo } = req.query;
    
    if (!codigo) {
      return res.status(400).json({ 
        success: false,
        error: 'Parámetro "codigo" es requerido' 
      });
    }

    const codigoNormalizado = codigo.trim();
    const response = await axios.get('https://api.internapps.net/api/precios');
    
    const todosProductos = Array.isArray(response.data) ? response.data : [];
    const productoEncontrado = todosProductos.find(p => 
      p.scanner && p.scanner.trim() === codigoNormalizado
    );
    
    if (productoEncontrado) {
      res.json({
        success: true,
        producto: {
          articulo: productoEncontrado.articulo?.trim() || 'Sin nombre',
          precio: productoEncontrado.precio || 0,
          precioMayorista: productoEncontrado.precioMayorista || 0,
          precioMayorista14: productoEncontrado.precioMayorista14 || 0,
          precioMayorista7: productoEncontrado.precioMayorista7 || 0,
          scanner: productoEncontrado.scanner?.trim() || ''
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
        codigoBuscado: codigoNormalizado,
        sugerencia: 'Verifica el código o intenta con otro'
      });
    }
  } catch (error) {
    console.error('Error completo:', {
      url: error.config?.url,
      status: error.response?.status,
      data: error.response?.data
    });
    
    res.status(500).json({
      success: false,
      message: 'Error al consultar la API externa',
      details: error.message
    });
  }
});

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`\n✅ Servidor proxy activo en http://localhost:${PORT}`);
  console.log(`🔍 Endpoint: /api/productos?codigo=XXXX\n`);
});