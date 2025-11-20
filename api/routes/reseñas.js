const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const { checkAuth, checkAdmin } = require('../middlewares/authentication.js');

// Models import
const Reseña = require('../models/reseña.js');
const Destino = require('../models/destino.js');
const Reserva = require('../models/reserva.js');

//******************
//**** RESEÑAS *****
//******************

// GET - Obtener todas las reseñas de un destino
router.get('/destino/:destinoId', async (req, res) => {
  try {
    const { destinoId } = req.params;
    console.log(destinoId);
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      calificacionMin,
    } = req.query;

    let query = { destino: destinoId };

    if (calificacionMin) {
      query.calificacion = { $gte: Number(calificacionMin) };
    }

    const skip = (Number(page) - 1) * Number(limit);

    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    const reseñas = await Reseña.find(query)
      .populate('usuario', 'username nombre apellido')
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);

    const total = await Reseña.countDocuments(query);

    // Calcular estadísticas
    const stats = await Reseña.aggregate([
      { $match: { destino: new mongoose.Types.ObjectId(destinoId) } },
      {
        $group: {
          _id: null,
          promedio: { $avg: '$calificacion' },
          total: { $sum: 1 },
          distribución: {
            $push: '$calificacion',
          },
        },
      },
    ]);

    // Calcular distribución por estrellas
    const distribución = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };
    if (stats.length > 0) {
      stats[0].distribución.forEach((cal) => {
        distribución[cal] = (distribución[cal] || 0) + 1;
      });
    }

    const response = {
      status: 'success',
      data: reseñas,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
      estadísticas: {
        promedio: stats.length > 0 ? stats[0].promedio.toFixed(1) : 0,
        total: stats.length > 0 ? stats[0].total : 0,
        distribución,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error obteniendo reseñas del destino:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al obtener las reseñas',
    });
  }
});

// GET - Obtener reservas completadas pendientes de reseña
router.get('/pendientes-resena', checkAuth, async (req, res) => {
  try {
    const userId = req.userId;

    // Buscar reservas completadas del usuario
    const reservasCompletadas = await Reserva.find({
      usuario: userId,
      estado: 'completada',
    })
      .populate('destino', 'nombre ciudad pais')
      .sort({ fechaFin: -1 });

    // Filtrar las que no tienen reseña
    const reservasPendientes = [];

    for (const reserva of reservasCompletadas) {
      const tieneReseña = await Reseña.findOne({
        usuario: userId,
        destino: reserva.destino._id,
        reserva: reserva._id,
      });

      if (!tieneReseña) {
        reservasPendientes.push({
          reservaId: reserva._id,
          destinoId: reserva.destino._id,
          destinoNombre: reserva.destino.nombre,
          destinoCiudad: reserva.destino.ciudad,
          destinoPais: reserva.destino.pais,
          fechaFin: reserva.fechaFin,
        });
      }
    }

    return res.status(200).json({
      status: 'success',
      data: reservasPendientes,
    });
  } catch (error) {
    console.error('Error obteniendo reservas pendientes de reseña:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al obtener las reservas pendientes',
    });
  }
});

// GET - Obtener todas las reseñas del usuario autenticado
router.get('/mis-reseñas', checkAuth, async (req, res) => {
  try {
    const userId = req.userId;
    const { page = 1, limit = 10 } = req.query;

    const skip = (Number(page) - 1) * Number(limit);

    const reseñas = await Reseña.find({ usuario: userId })
      .populate('destino', 'nombre ciudad pais imagenPrincipal')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Reseña.countDocuments({ usuario: userId });

    const response = {
      status: 'success',
      data: reseñas,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error obteniendo reseñas del usuario:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al obtener las reseñas',
    });
  }
});

// GET - Obtener una reseña específica
router.get('/:id', async (req, res) => {
  try {
    const reseña = await Reseña.findById(req.params.id)
      .populate('usuario', 'username nombre apellido')
      .populate('destino', 'nombre ciudad pais');

    if (!reseña) {
      return res.status(404).json({
        status: 'error',
        error: 'Reseña no encontrada',
      });
    }

    const response = {
      status: 'success',
      data: reseña,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error obteniendo reseña:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al obtener la reseña',
    });
  }
});

// POST - Crear una nueva reseña
router.post('/', checkAuth, async (req, res) => {
  try {
    // Aceptar tanto 'destino' como 'destinoId', y 'reserva' como 'reservaId'
    const destinoId = req.body.destinoId || req.body.destino;
    const reservaId = req.body.reservaId || req.body.reserva;
    const { calificacion, comentario, imagenes } = req.body;

    const userId = req.userId;

    // Validaciones
    if (!destinoId || !calificacion || !comentario) {
      return res.status(400).json({
        status: 'error',
        error: 'Faltan campos requeridos (destino/destinoId, calificacion, comentario)',
      });
    }

    // Verificar que el destino existe
    const destino = await Destino.findById(destinoId);

    if (!destino) {
      return res.status(404).json({
        status: 'error',
        error: 'Destino no encontrado',
      });
    }

    // Verificar que el usuario haya tenido una reserva confirmada o completada en este destino
    // (Esta validación es opcional - comentar si quieres permitir reseñas sin reserva)
    const tieneReserva = await Reserva.findOne({
      usuario: userId,
      destino: destinoId,
      estado: { $in: ['confirmada', 'completada'] },
    });

    // Descomentado temporalmente para permitir testing
    // if (!tieneReserva) {
    //   return res.status(403).json({
    //     status: 'error',
    //     error: 'Solo puedes dejar reseñas de destinos que hayas reservado',
    //   });
    // }

    // Verificar que no haya dejado ya una reseña para este destino
    const reseñaExistente = await Reseña.findOne({
      usuario: userId,
      destino: destinoId,
    });

    if (reseñaExistente) {
      return res.status(400).json({
        status: 'error',
        error: 'Ya has dejado una reseña para este destino. Puedes editarla.',
      });
    }

    // Crear la reseña
    const nuevaReseña = new Reseña({
      usuario: userId,
      destino: destinoId,
      calificacion,
      comentario,
      imagenes: imagenes || [],
      reserva: reservaId,
    });

    await nuevaReseña.save();

    // Poblar información antes de responder
    await nuevaReseña.populate('usuario', 'username nombre apellido');
    await nuevaReseña.populate('destino', 'nombre ciudad pais');

    const response = {
      status: 'success',
      message: 'Reseña creada exitosamente',
      data: nuevaReseña,
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Error creando reseña:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al crear la reseña',
    });
  }
});

// PUT - Actualizar una reseña (solo el autor)
router.put('/:id', checkAuth, async (req, res) => {
  try {
    const { calificacion, comentario, imagenes } = req.body;

    const reseña = await Reseña.findById(req.params.id);

    if (!reseña) {
      return res.status(404).json({
        status: 'error',
        error: 'Reseña no encontrada',
      });
    }

    // Verificar que el usuario sea el autor
    if (reseña.usuario.toString() !== req.userId) {
      return res.status(403).json({
        status: 'error',
        error: 'No tienes permiso para editar esta reseña',
      });
    }

    // Actualizar campos
    if (calificacion !== undefined) reseña.calificacion = calificacion;
    if (comentario !== undefined) reseña.comentario = comentario;
    if (imagenes !== undefined) reseña.imagenes = imagenes;

    await reseña.save();
    await reseña.populate('usuario', 'username nombre apellido');
    await reseña.populate('destino', 'nombre ciudad pais');

    const response = {
      status: 'success',
      message: 'Reseña actualizada exitosamente',
      data: reseña,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error actualizando reseña:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al actualizar la reseña',
    });
  }
});

// DELETE - Eliminar una reseña (autor o admin)
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const reseña = await Reseña.findById(req.params.id);

    if (!reseña) {
      return res.status(404).json({
        status: 'error',
        error: 'Reseña no encontrada',
      });
    }

    // Verificar permisos
    const esAdmin = req.userRole === 'admin';
    const esAutor = reseña.usuario.toString() === req.userId;

    if (!esAdmin && !esAutor) {
      return res.status(403).json({
        status: 'error',
        error: 'No tienes permiso para eliminar esta reseña',
      });
    }

    await Reseña.findOneAndDelete({ _id: req.params.id });

    const response = {
      status: 'success',
      message: 'Reseña eliminada exitosamente',
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error eliminando reseña:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al eliminar la reseña',
    });
  }
});

// POST - Reportar una reseña
router.post('/:id/reportar', checkAuth, async (req, res) => {
  try {
    const { motivo } = req.body;
    const reseña = await Reseña.findById(req.params.id);

    if (!reseña) {
      return res.status(404).json({
        status: 'error',
        error: 'Reseña no encontrada',
      });
    }

    reseña.reportada = true;
    reseña.motivoReporte = motivo || 'Sin especificar';

    await reseña.save();

    const response = {
      status: 'success',
      message: 'Reseña reportada exitosamente. Será revisada por un administrador.',
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error reportando reseña:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al reportar la reseña',
    });
  }
});

// PUT - Verificar una reseña (solo admin)
router.put('/:id/verificar', checkAuth, checkAdmin, async (req, res) => {
  try {
    const reseña = await Reseña.findById(req.params.id);

    if (!reseña) {
      return res.status(404).json({
        status: 'error',
        error: 'Reseña no encontrada',
      });
    }

    reseña.verificada = true;
    reseña.reportada = false;

    await reseña.save();

    const response = {
      status: 'success',
      message: 'Reseña verificada exitosamente',
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error verificando reseña:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al verificar la reseña',
    });
  }
});

// POST - Dar like a una reseña
router.post('/:id/like', checkAuth, async (req, res) => {
  try {
    const reseña = await Reseña.findById(req.params.id);

    if (!reseña) {
      return res.status(404).json({
        status: 'error',
        error: 'Reseña no encontrada',
      });
    }

    reseña.likes += 1;
    await reseña.save();

    const response = {
      status: 'success',
      data: { likes: reseña.likes },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error dando like:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al dar like',
    });
  }
});

module.exports = router;
