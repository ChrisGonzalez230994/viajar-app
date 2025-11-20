const express = require('express');
const router = express.Router();
const { checkAuth, checkAdmin } = require('../middlewares/authentication.js');

// Model imports
const Reserva = require('../models/reserva.js');
const Destino = require('../models/destino.js');

// Repository imports
const reservaRepository = require('../repositories/reserva.repository.js');
const destinoRepository = require('../repositories/destino.repository.js');
const userRepository = require('../repositories/user.repository.js');

//******************
//**** RESERVAS ****
//******************

// GET - Obtener todas las reservas del usuario autenticado
router.get('/mis-reservas', checkAuth, async (req, res) => {
  try {
    const { estado, page = 1, limit = 10 } = req.query;
    const userId = req.userId;
    console.log('estado: ', estado);
    console.log('userId: ', userId);
    console.log('userData: ', req.userData);
    let result;
    if (estado) {
      result = await reservaRepository.search(
        { userId, estado },
        { page: Number(page), limit: Number(limit), sortBy: 'createdAt', sortOrder: 'desc' }
      );
    } else {
      result = await reservaRepository.findByUser(userId, {
        page: Number(page),
        limit: Number(limit),
        sortBy: 'createdAt',
        sortOrder: 'desc',
      });
    }

    console.log(result);

    return res.status(200).json({
      status: 'success',
      data: result.data,
      pagination: result.pagination,
    });
  } catch (error) {
    console.error('Error obteniendo reservas del usuario:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al obtener las reservas',
    });
  }
});

// GET - Obtener todas las reservas (solo admin)
router.get('/', checkAuth, checkAdmin, async (req, res) => {
  try {
    const { estado, destinoId, usuarioId, page = 1, limit = 20 } = req.query;

    let query = {};

    if (estado) {
      query.estado = estado;
    }

    if (destinoId) {
      query.destino = destinoId;
    }

    if (usuarioId) {
      query.usuario = usuarioId;
    }

    const skip = (Number(page) - 1) * Number(limit);

    const reservas = await Reserva.find(query)
      .populate('usuario', 'username nombre apellido email')
      .populate('destino', 'nombre ciudad pais precio')
      .sort({ createdAt: -1 })
      .limit(Number(limit))
      .skip(skip);

    const total = await Reserva.countDocuments(query);

    const response = {
      status: 'success',
      data: reservas,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit)),
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error obteniendo reservas:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al obtener las reservas',
    });
  }
});

// GET - Obtener una reserva específica
router.get('/:id', checkAuth, async (req, res) => {
  try {
    const reserva = await Reserva.findById(req.params.id)
      .populate('usuario', 'username nombre apellido email phone')
      .populate('destino');

    if (!reserva) {
      return res.status(404).json({
        status: 'error',
        error: 'Reserva no encontrada',
      });
    }

    // Verificar que el usuario sea el dueño de la reserva o sea admin
    if (reserva.usuario._id.toString() !== req.userId && req.userRole !== 'admin') {
      return res.status(403).json({
        status: 'error',
        error: 'No tienes permiso para ver esta reserva',
      });
    }

    const response = {
      status: 'success',
      data: reserva,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error obteniendo reserva:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al obtener la reserva',
    });
  }
});

// POST - Crear una nueva reserva
router.post('/', checkAuth, async (req, res) => {
  try {
    const { destinoId, fechaInicio, fechaFin, numeroPersonas, notas } = req.body;

    const userId = req.userId;

    // Validaciones
    if (!destinoId || !fechaInicio || !fechaFin || !numeroPersonas) {
      return res.status(400).json({
        status: 'error',
        error: 'Faltan campos requeridos',
      });
    }

    // Verificar que el destino existe y está disponible
    const destino = await Destino.findById(destinoId);

    if (!destino) {
      return res.status(404).json({
        status: 'error',
        error: 'Destino no encontrado',
      });
    }

    if (!destino.disponibilidad) {
      return res.status(400).json({
        status: 'error',
        error: 'Este destino no está disponible',
      });
    }

    // Verificar capacidad
    if (numeroPersonas > destino.capacidadMaxima) {
      return res.status(400).json({
        status: 'error',
        error: `La capacidad máxima es de ${destino.capacidadMaxima} personas`,
      });
    }

    // Calcular precio total (precio por día por persona)
    const inicio = new Date(fechaInicio);
    const fin = new Date(fechaFin);
    const dias = Math.ceil((fin - inicio) / (1000 * 60 * 60 * 24));
    const precioTotal = destino.precio * numeroPersonas * dias;

    // Crear la reserva
    const nuevaReserva = new Reserva({
      usuario: userId,
      destino: destinoId,
      fechaInicio: inicio,
      fechaFin: fin,
      numeroPersonas,
      precioTotal,
      notas,
      estado: 'pendiente',
    });

    await nuevaReserva.save();

    // Poblar la información antes de enviar la respuesta
    await nuevaReserva.populate('destino');
    await nuevaReserva.populate('usuario', 'username nombre apellido email');

    const response = {
      status: 'success',
      message: 'Reserva creada exitosamente. Pendiente de confirmación.',
      data: nuevaReserva,
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error('Error creando reserva:', error);
    return res.status(500).json({
      status: 'error',
      error: error.message || 'Error al crear la reserva',
    });
  }
});

// PUT - Actualizar estado de una reserva (admin confirma/cancela)
router.put('/:id/estado', checkAuth, async (req, res) => {
  try {
    const { estado, motivoCancelacion } = req.body;
    const reserva = await Reserva.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        status: 'error',
        error: 'Reserva no encontrada',
      });
    }

    // Solo el admin puede confirmar, o el usuario puede cancelar su propia reserva
    const esAdmin = req.userRole === 'admin';
    const esDueño = reserva.usuario.toString() === req.userId;

    if (!esAdmin && !esDueño) {
      return res.status(403).json({
        status: 'error',
        error: 'No tienes permiso para modificar esta reserva',
      });
    }

    // Usuario solo puede cancelar
    if (!esAdmin && estado !== 'cancelada') {
      return res.status(403).json({
        status: 'error',
        error: 'Solo puedes cancelar tu propia reserva',
      });
    }

    // Actualizar estado
    reserva.estado = estado;

    if (estado === 'cancelada') {
      reserva.fechaCancelacion = new Date();
      if (motivoCancelacion) {
        reserva.motivoCancelacion = motivoCancelacion;
      }
    }

    if (estado === 'confirmada') {
      reserva.fechaConfirmacion = new Date();
    }

    await reserva.save();
    await reserva.populate('destino');
    await reserva.populate('usuario', 'username nombre apellido email');

    const response = {
      status: 'success',
      message: `Reserva ${estado} exitosamente`,
      data: reserva,
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error actualizando estado de reserva:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al actualizar la reserva',
    });
  }
});

// DELETE - Cancelar una reserva (usuario o admin)
router.delete('/:id', checkAuth, async (req, res) => {
  try {
    const { motivoCancelacion } = req.body;
    const reserva = await Reserva.findById(req.params.id);

    if (!reserva) {
      return res.status(404).json({
        status: 'error',
        error: 'Reserva no encontrada',
      });
    }

    // Verificar permisos
    const esAdmin = req.userRole === 'admin';
    const esDueño = reserva.usuario.toString() === req.userId;

    if (!esAdmin && !esDueño) {
      return res.status(403).json({
        status: 'error',
        error: 'No tienes permiso para cancelar esta reserva',
      });
    }

    // No se puede cancelar una reserva ya completada
    if (reserva.estado === 'completada') {
      return res.status(400).json({
        status: 'error',
        error: 'No se puede cancelar una reserva completada',
      });
    }

    reserva.estado = 'cancelada';
    reserva.fechaCancelacion = new Date();
    if (motivoCancelacion) {
      reserva.motivoCancelacion = motivoCancelacion;
    }

    await reserva.save();

    const response = {
      status: 'success',
      message: 'Reserva cancelada exitosamente',
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error cancelando reserva:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al cancelar la reserva',
    });
  }
});

// GET - Verificar disponibilidad de un destino en fechas específicas
router.get('/disponibilidad/:destinoId', async (req, res) => {
  try {
    const { destinoId } = req.params;
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio || !fechaFin) {
      return res.status(400).json({
        status: 'error',
        error: 'Debes proporcionar fechaInicio y fechaFin',
      });
    }

    const destino = await Destino.findById(destinoId);

    if (!destino) {
      return res.status(404).json({
        status: 'error',
        error: 'Destino no encontrado',
      });
    }

    // Buscar reservas confirmadas que se superpongan con las fechas
    const reservasSuperpuestas = await Reserva.find({
      destino: destinoId,
      estado: { $in: ['pendiente', 'confirmada'] },
      $or: [
        {
          fechaInicio: { $lte: new Date(fechaFin) },
          fechaFin: { $gte: new Date(fechaInicio) },
        },
      ],
    });

    // Calcular personas reservadas
    const personasReservadas = reservasSuperpuestas.reduce(
      (acc, reserva) => acc + reserva.numeroPersonas,
      0
    );

    const disponible = personasReservadas < destino.capacidadMaxima;
    const capacidadDisponible = destino.capacidadMaxima - personasReservadas;

    const response = {
      status: 'success',
      data: {
        disponible,
        capacidadMaxima: destino.capacidadMaxima,
        capacidadDisponible,
        personasReservadas,
      },
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error('Error verificando disponibilidad:', error);
    return res.status(500).json({
      status: 'error',
      error: 'Error al verificar disponibilidad',
    });
  }
});

module.exports = router;
