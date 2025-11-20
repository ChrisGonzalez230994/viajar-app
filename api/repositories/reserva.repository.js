const MongooseRepository = require('../infrastructure/mongoose.repository');
const Reserva = require('../models/reserva');

/**
 * Repositorio de Reservas
 * Contiene la lógica específica de acceso a datos para reservas
 */
class ReservaRepository extends MongooseRepository {
  constructor() {
    super(Reserva);
  }

  /**
   * Buscar reservas por usuario
   */
  async findByUser(userId, options = {}) {
    try {
      const filters = { usuario: userId };
      return await this.findAll(filters, {
        ...options,
        populate: ['destino'],
      });
    } catch (error) {
      throw new Error(`Error finding by user: ${error.message}`);
    }
  }

  /**
   * Buscar reservas por destino
   */
  async findByDestination(destinoId, options = {}) {
    try {
      const filters = { destino: destinoId };
      return await this.findAll(filters, {
        ...options,
        populate: ['usuario'],
      });
    } catch (error) {
      throw new Error(`Error finding by destination: ${error.message}`);
    }
  }

  /**
   * Buscar reservas por estado
   */
  async findByStatus(estado, options = {}) {
    try {
      const filters = { estado };
      return await this.findAll(filters, {
        ...options,
        populate: ['destino', 'usuario'],
      });
    } catch (error) {
      throw new Error(`Error finding by status: ${error.message}`);
    }
  }

  /**
   * Buscar reservas pendientes de un usuario
   */
  async findPendingByUser(userId, options = {}) {
    try {
      const filters = {
        usuario: userId,
        estado: 'pendiente',
      };
      return await this.findAll(filters, {
        ...options,
        populate: ['destino'],
      });
    } catch (error) {
      throw new Error(`Error finding pending by user: ${error.message}`);
    }
  }

  /**
   * Buscar reservas por rango de fechas
   */
  async findByDateRange(startDate, endDate, options = {}) {
    try {
      const filters = {
        fechaInicio: { $gte: new Date(startDate) },
        fechaFin: { $lte: new Date(endDate) },
      };
      return await this.findAll(filters, {
        ...options,
        populate: ['destino', 'usuario'],
      });
    } catch (error) {
      throw new Error(`Error finding by date range: ${error.message}`);
    }
  }

  /**
   * Verificar disponibilidad de destino en fechas
   */
  async checkAvailability(destinoId, fechaInicio, fechaFin) {
    try {
      const conflictingReservations = await this.model.countDocuments({
        destino: destinoId,
        estado: { $in: ['confirmada', 'pendiente'] },
        $or: [
          {
            fechaInicio: { $lte: new Date(fechaFin) },
            fechaFin: { $gte: new Date(fechaInicio) },
          },
        ],
      });

      return conflictingReservations === 0;
    } catch (error) {
      throw new Error(`Error checking availability: ${error.message}`);
    }
  }

  /**
   * Actualizar estado de reserva
   */
  async updateStatus(reservaId, newStatus) {
    try {
      return await this.update(reservaId, { estado: newStatus });
    } catch (error) {
      throw new Error(`Error updating status: ${error.message}`);
    }
  }

  /**
   * Confirmar reserva
   */
  async confirmReservation(reservaId) {
    try {
      return await this.update(reservaId, {
        estado: 'confirmada',
        fechaConfirmacion: new Date(),
      });
    } catch (error) {
      throw new Error(`Error confirming reservation: ${error.message}`);
    }
  }

  /**
   * Cancelar reserva
   */
  async cancelReservation(reservaId, motivo = '') {
    try {
      return await this.update(reservaId, {
        estado: 'cancelada',
        fechaCancelacion: new Date(),
        motivoCancelacion: motivo,
      });
    } catch (error) {
      throw new Error(`Error canceling reservation: ${error.message}`);
    }
  }

  /**
   * Obtener reservas próximas de un usuario
   */
  async findUpcomingByUser(userId, days = 30) {
    try {
      const today = new Date();
      const futureDate = new Date();
      futureDate.setDate(today.getDate() + days);

      const filters = {
        usuario: userId,
        estado: 'confirmada',
        fechaInicio: { $gte: today, $lte: futureDate },
      };

      return await this.findAll(filters, {
        populate: ['destino'],
        sortBy: 'fechaInicio',
        sortOrder: 'asc',
      });
    } catch (error) {
      throw new Error(`Error finding upcoming reservations: ${error.message}`);
    }
  }

  /**
   * Obtener historial de reservas de un usuario
   */
  async findHistoryByUser(userId, options = {}) {
    try {
      const today = new Date();
      const filters = {
        usuario: userId,
        fechaFin: { $lt: today },
      };

      return await this.findAll(filters, {
        ...options,
        populate: ['destino'],
        sortBy: 'fechaFin',
        sortOrder: 'desc',
      });
    } catch (error) {
      throw new Error(`Error finding reservation history: ${error.message}`);
    }
  }

  /**
   * Calcular ingresos totales por destino
   */
  async calculateRevenueByDestination(destinoId, startDate, endDate) {
    try {
      const result = await this.model.aggregate([
        {
          $match: {
            destino: destinoId,
            estado: 'confirmada',
            fechaInicio: { $gte: new Date(startDate), $lte: new Date(endDate) },
          },
        },
        {
          $group: {
            _id: null,
            totalRevenue: { $sum: '$precioTotal' },
            totalReservations: { $sum: 1 },
          },
        },
      ]);

      return result.length > 0 ? result[0] : { totalRevenue: 0, totalReservations: 0 };
    } catch (error) {
      throw new Error(`Error calculating revenue: ${error.message}`);
    }
  }

  /**
   * Construir filtros de búsqueda avanzada
   */
  buildSearchFilters(criteria) {
    const filters = {};

    if (criteria.userId) {
      filters.usuario = criteria.userId;
    }

    if (criteria.destinoId) {
      filters.destino = criteria.destinoId;
    }

    if (criteria.estado) {
      filters.estado = criteria.estado;
    }

    if (criteria.fechaInicioMin || criteria.fechaInicioMax) {
      filters.fechaInicio = {};
      if (criteria.fechaInicioMin) {
        filters.fechaInicio.$gte = new Date(criteria.fechaInicioMin);
      }
      if (criteria.fechaInicioMax) {
        filters.fechaInicio.$lte = new Date(criteria.fechaInicioMax);
      }
    }

    if (criteria.precioMin || criteria.precioMax) {
      filters.precioTotal = {};
      if (criteria.precioMin) filters.precioTotal.$gte = Number(criteria.precioMin);
      if (criteria.precioMax) filters.precioTotal.$lte = Number(criteria.precioMax);
    }

    return filters;
  }
}

module.exports = new ReservaRepository();
