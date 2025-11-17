const express = require('express');
const router = express.Router();
const { checkAuth, checkAdmin } = require('../middlewares/authentication.js');

// Repository imports
const destinoRepository = require('../repositories/destino.repository.js');
const reseñaRepository = require('../repositories/reseña.repository.js');
const vectorRepository = require('../repositories/vector.repository.js');

//******************
//**** DESTINOS ****
//******************

// GET - Obtener todos los destinos con filtros y búsqueda
router.get('/', async (req, res) => {
  try {
    const {
      search,
      ciudad,
      pais,
      precioMin,
      precioMax,
      calificacionMin,
      actividades,
      limit = 20,
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = req.query;

    // Construir criterios de búsqueda
    const criteria = {
      search,
      ciudad,
      pais,
      precioMin,
      precioMax,
      calificacionMin,
      actividades: actividades ? actividades.split(',') : undefined,
    };

    // Opciones de paginación y ordenamiento
    const options = {
      page: Number(page),
      limit: Number(limit),
      sortBy,
      sortOrder,
    };

    const result = await destinoRepository.search(criteria, options);

    return res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error obteniendo destinos:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al obtener los destinos',
    });
  }
});

// GET - Obtener un destino por ID con sus reseñas
router.get('/:id', async (req, res) => {
  try {
    const destino = await destinoRepository.findById(req.params.id);

    if (!destino) {
      return res.status(404).json({
        status: 'error',
        error: 'Destino no encontrado',
      });
    }

    // Obtener las últimas reseñas del destino
    const reseñasResult = await reseñaRepository.findRecentByDestination(req.params.id, 10);

    return res.status(200).json({
      status: 'success',
      data: {
        ...destino.toObject(),
        reseñas: reseñasResult.data,
      },
    });
  } catch (error) {
    console.error('Error obteniendo destino:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al obtener el destino',
    });
  }
});

// POST - Crear un nuevo destino (solo admin)
router.post('/', checkAuth, checkAdmin, async (req, res) => {
  try {
    const {
      nombre,
      ciudad,
      pais,
      descripcion,
      imagenes,
      imagenPrincipal,
      precio,
      ubicacion,
      actividades,
      capacidadMaxima,
    } = req.body;

    // Validaciones
    if (!nombre || !ciudad || !pais || !descripcion || !precio || !ubicacion) {
      return res.status(400).json({
        status: 'error',
        error: 'Faltan campos requeridos',
      });
    }

    const destinoData = {
      nombre,
      ciudad,
      pais,
      descripcion,
      imagenes: imagenes || [],
      imagenPrincipal,
      precio,
      ubicacion,
      actividades: actividades || [],
      capacidadMaxima,
    };

    const nuevoDestino = await destinoRepository.create(destinoData);

    // Auto-indexar en Qdrant (async, no bloquea respuesta)
    vectorRepository
      .indexDestino(nuevoDestino)
      .catch((err) => console.error('Error indexando destino:', err.message));

    return res.status(201).json({
      status: 'success',
      message: 'Destino creado exitosamente',
      data: nuevoDestino,
    });
  } catch (error) {
    console.error('Error creando destino:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al crear el destino',
    });
  }
});

// PUT - Actualizar un destino (solo admin)
router.put('/:id', checkAuth, checkAdmin, async (req, res) => {
  try {
    const {
      nombre,
      ciudad,
      pais,
      descripcion,
      imagenes,
      imagenPrincipal,
      precio,
      ubicacion,
      actividades,
      disponibilidad,
      capacidadMaxima,
    } = req.body;

    const destino = await destinoRepository.findById(req.params.id);

    if (!destino) {
      return res.status(404).json({
        status: 'error',
        error: 'Destino no encontrado',
      });
    }

    // Preparar datos a actualizar
    const updateData = {};
    if (nombre !== undefined) updateData.nombre = nombre;
    if (ciudad !== undefined) updateData.ciudad = ciudad;
    if (pais !== undefined) updateData.pais = pais;
    if (descripcion !== undefined) updateData.descripcion = descripcion;
    if (imagenes !== undefined) updateData.imagenes = imagenes;
    if (imagenPrincipal !== undefined) updateData.imagenPrincipal = imagenPrincipal;
    if (precio !== undefined) updateData.precio = precio;
    if (ubicacion !== undefined) updateData.ubicacion = ubicacion;
    if (actividades !== undefined) updateData.actividades = actividades;
    if (disponibilidad !== undefined) updateData.disponibilidad = disponibilidad;
    if (capacidadMaxima !== undefined) updateData.capacidadMaxima = capacidadMaxima;

    const updatedDestino = await destinoRepository.update(req.params.id, updateData);

    // Actualizar en índice vectorial (async)
    vectorRepository
      .updateDestino(updatedDestino)
      .catch((err) => console.error('Error actualizando índice:', err.message));

    return res.status(200).json({
      status: 'success',
      message: 'Destino actualizado exitosamente',
      data: updatedDestino,
    });
  } catch (error) {
    console.error('Error actualizando destino:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al actualizar el destino',
    });
  }
});

// DELETE - Eliminar un destino (solo admin)
router.delete('/:id', checkAuth, checkAdmin, async (req, res) => {
  try {
    const destino = await destinoRepository.findById(req.params.id);

    if (!destino) {
      return res.status(404).json({
        status: 'error',
        error: 'Destino no encontrado',
      });
    }

    // En lugar de eliminar, desactivar
    await destinoRepository.updateAvailability(req.params.id, false);

    // Eliminar del índice vectorial (async)
    vectorRepository
      .deleteDestino(req.params.id)
      .catch((err) => console.error('Error eliminando del índice:', err.message));

    return res.status(200).json({
      status: 'success',
      message: 'Destino desactivado exitosamente',
    });
  } catch (error) {
    console.error('Error eliminando destino:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al eliminar el destino',
    });
  }
});

// GET - Obtener destinos destacados (mejores calificados)
router.get('/destacados/top', async (req, res) => {
  try {
    const limit = req.query.limit || 10;

    const result = await destinoRepository.findPopular(Number(limit));

    return res.status(200).json({
      status: 'success',
      data: result.data,
    });
  } catch (error) {
    console.error('Error obteniendo destinos destacados:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al obtener destinos destacados',
    });
  }
});

module.exports = router;
