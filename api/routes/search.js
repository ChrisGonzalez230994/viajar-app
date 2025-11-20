const express = require('express');
const router = express.Router();
const vectorRepository = require('../repositories/vector.repository');
const destinoRepository = require('../repositories/destino.repository');

/**
 * POST /api/search/semantic
 * Búsqueda semántica de destinos basada en intención del usuario
 */
router.post('/semantic', async (req, res) => {
  try {
    const {
      query,
      tipoViaje,
      precioMin,
      precioMax,
      ubicacion,
      pais,
      ciudad,
      calificacionMin,
      limit = 10,
    } = req.body;

    // Validar query
    if (!query || typeof query !== 'string' || query.trim().length === 0) {
      return res.status(400).json({
        status: 'error',
        error: 'La query de búsqueda es requerida',
      });
    }

    // Realizar búsqueda vectorial
    const result = await vectorRepository.searchDestinos(query, {
      limit: Number(limit),
      tipoViaje,
      precioMin: precioMin ? Number(precioMin) : null,
      precioMax: precioMax ? Number(precioMax) : null,
      ubicacion,
      pais,
      ciudad,
      calificacionMin: calificacionMin ? Number(calificacionMin) : null,
      soloDisponibles: true,
    });

    return res.status(200).json({
      status: 'success',
      data: result.results,
      metadata: {
        query: result.query,
        enrichedQuery: result.enrichedQuery,
        total: result.total,
        filters: {
          tipoViaje,
          precioMin,
          precioMax,
          ubicacion,
          pais,
          ciudad,
          calificacionMin,
        },
      },
    });
  } catch (error) {
    console.error('❌ Error en búsqueda semántica:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error realizando la búsqueda semántica',
      details: error.message,
    });
  }
});

/**
 * GET /api/search/similar/:id
 * Encontrar destinos similares a uno dado
 */
router.get('/similar/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { limit = 5 } = req.query;

    // Verificar que el destino existe
    const destino = await destinoRepository.findById(id);
    if (!destino) {
      return res.status(404).json({
        status: 'error',
        error: 'Destino no encontrado',
      });
    }

    // Buscar similares
    const similares = await vectorRepository.findSimilarDestinos(id, Number(limit));

    return res.status(200).json({
      status: 'success',
      data: similares,
      metadata: {
        baseDestino: {
          id: destino._id,
          nombre: destino.nombre,
          ciudad: destino.ciudad,
          pais: destino.pais,
        },
        total: similares.length,
      },
    });
  } catch (error) {
    console.error('❌ Error buscando destinos similares:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error buscando destinos similares',
      details: error.message,
    });
  }
});

/**
 * POST /api/search/index
 * Re-indexar todos los destinos (solo admin)
 */
router.post('/index', async (req, res) => {
  try {
    // TODO: Agregar middleware de autenticación de admin

    // Obtener todos los destinos disponibles
    const result = await destinoRepository.findAll({ disponibilidad: true }, { limit: 1000 });

    if (result.data.length === 0) {
      return res.status(404).json({
        status: 'error',
        error: 'No hay destinos para indexar',
      });
    }

    // Indexar en batch
    await vectorRepository.indexDestinosBatch(result.data);

    return res.status(200).json({
      status: 'success',
      message: `${result.data.length} destinos indexados exitosamente`,
      data: {
        indexed: result.data.length,
      },
    });
  } catch (error) {
    console.error('❌ Error indexando destinos:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error indexando destinos',
      details: error.message,
    });
  }
});

/**
 * GET /api/search/stats
 * Obtener estadísticas del índice vectorial
 */
router.get('/stats', async (req, res) => {
  try {
    const stats = await vectorRepository.getStats();

    return res.status(200).json({
      status: 'success',
      data: stats,
    });
  } catch (error) {
    console.error('❌ Error obteniendo estadísticas:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error obteniendo estadísticas',
      details: error.message,
    });
  }
});

/**
 * GET /api/search/tipos-viaje
 * Listar tipos de viaje disponibles
 */
router.get('/tipos-viaje', async (req, res) => {
  const tiposViaje = [
    {
      id: 'aventura',
      nombre: 'Aventura',
      descripcion: 'Viajes llenos de adrenalina, deportes extremos y naturaleza salvaje',
      keywords: ['aventura', 'deportes extremos', 'adrenalina', 'naturaleza salvaje'],
    },
    {
      id: 'romantico',
      nombre: 'Romántico',
      descripcion: 'Destinos perfectos para parejas, lunas de miel y escapadas románticas',
      keywords: ['romántico', 'parejas', 'luna de miel', 'cenas especiales'],
    },
    {
      id: 'historia',
      nombre: 'Historia y Cultura',
      descripcion: 'Explora sitios históricos, museos y patrimonio cultural',
      keywords: ['histórico', 'cultural', 'museos', 'monumentos', 'patrimonio'],
    },
    {
      id: 'naturaleza',
      nombre: 'Naturaleza',
      descripcion: 'Conexión con la naturaleza, ecoturismo y vida silvestre',
      keywords: ['naturaleza', 'ecológico', 'vida silvestre', 'paisajes'],
    },
    {
      id: 'familiar',
      nombre: 'Familiar',
      descripcion: 'Destinos ideales para viajar con niños y toda la familia',
      keywords: ['familiar', 'niños', 'actividades en familia', 'diversión'],
    },
    {
      id: 'playa',
      nombre: 'Playa',
      descripcion: 'Sol, arena y mar en los mejores destinos costeros',
      keywords: ['playa', 'sol', 'mar', 'arena', 'costa'],
    },
    {
      id: 'ciudad',
      nombre: 'Ciudad',
      descripcion: 'Experiencias urbanas, compras y vida nocturna',
      keywords: ['ciudad', 'urbano', 'compras', 'vida nocturna'],
    },
    {
      id: 'gastronomico',
      nombre: 'Gastronómico',
      descripcion: 'Descubre la mejor gastronomía y cocina local',
      keywords: ['gastronomía', 'comida', 'restaurantes', 'cocina local'],
    },
    {
      id: 'relax',
      nombre: 'Relax y Bienestar',
      descripcion: 'Spas, descanso y tranquilidad absoluta',
      keywords: ['relax', 'spa', 'descanso', 'tranquilidad', 'bienestar'],
    },
    {
      id: 'fotografia',
      nombre: 'Fotografía',
      descripcion: 'Paisajes impresionantes y lugares fotogénicos',
      keywords: ['fotografía', 'paisajes', 'vistas panorámicas'],
    },
  ];

  return res.status(200).json({
    status: 'success',
    data: tiposViaje,
  });
});

module.exports = router;
