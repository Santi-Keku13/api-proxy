const express = require('express');
const axios = require('axios');
const cors = require('cors');

const app = express();

// Configuración básica de CORS
app.use(cors({
  origin: 'http://localhost:5173', // Reemplaza con tu URL de frontend
  methods: ['GET']
}));

// Ruta del proxy para buscar productos
app.get('/api/productos', async (req, res) => {
  try {
    const { codigo } = req.query;
    
    if (!codigo) {
      return res.status(400).json({ error: 'Código de barras es requerido' });
    }

    // Normalizar el código (eliminar espacios)
    const codigoNormalizado = codigo.trim();
    
    // Hacer la petición a la API
    const response = await axios.get('https://api.internapps.net/api/precios');
    const todosProductos = response.data;
    
    // Buscar coincidencia exacta
    const productoEncontrado = todosProductos.find(p => 
      p.scanner.trim() === codigoNormalizado
    );
    
    if (productoEncontrado) {
      res.json({
        success: true,
        producto: {
          articulo: productoEncontrado.articulo.trim(),
          precio: productoEncontrado.precio,
          precioMayorista: productoEncontrado.precioMayorista,
          scanner: productoEncontrado.scanner.trim()
        }
      });
    } else {
      res.status(404).json({
        success: false,
        message: 'Producto no encontrado',
        codigoBuscado: codigoNormalizado
      });
    }
  } catch (error) {
    console.error('Error en el proxy:', error);
    res.status(500).json({
      success: false,
      message: 'Error al buscar el producto',
      error: error.message
    });
  }
});

// Puerto de configuración
const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor proxy corriendo en http://localhost:${PORT}`);
});