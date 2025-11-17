const MongooseRepository = require('../infrastructure/mongoose.repository');
const Reseña = require('../models/reseña');

/**
 * Repositorio de Reseñas
 * Contiene la lógica específica de acceso a datos para reseñas
 */
class ReseñaRepository extends MongooseRepository {
  constructor() {
    super(Reseña);
  }

  /**
   * Buscar reseñas por destino
   */
  async findByDestination(destinoId, options = {}) {
    try {
      const filters = { idDestino: destinoId };
      return await this.findAll(filters, {
        ...options,
        populate: ['idUsuario'],
        sortBy: 'fechaCreacion',
        sortOrder: 'desc',
      });
    } catch (error) {
      throw new Error(`Error finding by destination: ${error.message}`);
    }
  }

  /**
   * Buscar reseñas por usuario
   */
  async findByUser(userId, options = {}) {
    try {
      const filters = { idUsuario: userId };
      return await this.findAll(filters, {
        ...options,
        populate: ['idDestino'],
        sortBy: 'fechaCreacion',
        sortOrder: 'desc',
      });
    } catch (error) {
      throw new Error(`Error finding by user: ${error.message}`);
    }
  }

  /**
   * Buscar reseñas por calificación
   */
  async findByRating(rating, options = {}) {
    try {
      const filters = { calificacion: rating };
      return await this.findAll(filters, {
        ...options,
        populate: ['idDestino', 'idUsuario'],
      });
    } catch (error) {
      throw new Error(`Error finding by rating: ${error.message}`);
    }
  }

  /**
   * Buscar reseñas por calificación mínima
   */
  async findByMinRating(minRating, options = {}) {
    try {
      const filters = { calificacion: { $gte: minRating } };
      return await this.findAll(filters, {
        ...options,
        populate: ['idDestino', 'idUsuario'],
      });
    } catch (error) {
      throw new Error(`Error finding by min rating: ${error.message}`);
    }
  }

  /**
   * Obtener reseñas recientes de un destino
   */
  async findRecentByDestination(destinoId, limit = 10) {
    try {
      return await this.findAll(
        { idDestino: destinoId },
        {
          limit,
          populate: ['idUsuario'],
          sortBy: 'fechaCreacion',
          sortOrder: 'desc',
        }
      );
    } catch (error) {
      throw new Error(`Error finding recent reviews: ${error.message}`);
    }
  }

  /**
   * Obtener mejores reseñas de un destino
   */
  async findTopByDestination(destinoId, limit = 5) {
    try {
      return await this.findAll(
        { idDestino: destinoId, calificacion: { $gte: 4 } },
        {
          limit,
          populate: ['idUsuario'],
          sortBy: 'calificacion',
          sortOrder: 'desc',
        }
      );
    } catch (error) {
      throw new Error(`Error finding top reviews: ${error.message}`);
    }
  }

  /**
   * Calcular calificación promedio de un destino
   */
  async calculateAverageRating(destinoId) {
    try {
      const result = await this.model.aggregate([
        { $match: { idDestino: destinoId } },
        {
          $group: {
            _id: null,
            averageRating: { $avg: '$calificacion' },
            totalReviews: { $sum: 1 },
          },
        },
      ]);

      if (result.length > 0) {
        return {
          averageRating: Math.round(result[0].averageRating * 10) / 10,
          totalReviews: result[0].totalReviews,
        };
      }

      return { averageRating: 0, totalReviews: 0 };
    } catch (error) {
      throw new Error(`Error calculating average rating: ${error.message}`);
    }
  }

  /**
   * Obtener distribución de calificaciones de un destino
   */
  async getRatingDistribution(destinoId) {
    try {
      const result = await this.model.aggregate([
        { $match: { idDestino: destinoId } },
        {
          $group: {
            _id: '$calificacion',
            count: { $sum: 1 },
          },
        },
        { $sort: { _id: -1 } },
      ]);

      const distribution = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
      result.forEach((item) => {
        distribution[item._id] = item.count;
      });

      return distribution;
    } catch (error) {
      throw new Error(`Error getting rating distribution: ${error.message}`);
    }
  }

  /**
   * Verificar si un usuario ya reseñó un destino
   */
  async hasUserReviewedDestination(userId, destinoId) {
    try {
      return await this.exists({ idUsuario: userId, idDestino: destinoId });
    } catch (error) {
      throw new Error(`Error checking user review: ${error.message}`);
    }
  }

  /**
   * Actualizar reseña con respuesta del administrador
   */
  async addAdminResponse(reseñaId, response, adminId) {
    try {
      return await this.update(reseñaId, {
        respuestaAdmin: response,
        adminId: adminId,
        fechaRespuesta: new Date(),
      });
    } catch (error) {
      throw new Error(`Error adding admin response: ${error.message}`);
    }
  }

  /**
   * Marcar reseña como útil
   */
  async markAsHelpful(reseñaId, userId) {
    try {
      const reseña = await this.findById(reseñaId);
      if (!reseña) {
        throw new Error('Reseña no encontrada');
      }

      if (!reseña.votosUtiles) {
        reseña.votosUtiles = [];
      }

      if (!reseña.votosUtiles.includes(userId)) {
        return await this.addToArray(reseñaId, 'votosUtiles', userId);
      }

      return reseña;
    } catch (error) {
      throw new Error(`Error marking as helpful: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de reseñas de un destino
   */
  async getDestinationStats(destinoId) {
    try {
      const [ratingData, distribution] = await Promise.all([
        this.calculateAverageRating(destinoId),
        this.getRatingDistribution(destinoId),
      ]);

      return {
        ...ratingData,
        distribution,
      };
    } catch (error) {
      throw new Error(`Error getting destination stats: ${error.message}`);
    }
  }

  /**
   * Construir filtros de búsqueda avanzada
   */
  buildSearchFilters(criteria) {
    const filters = {};

    if (criteria.destinoId) {
      filters.idDestino = criteria.destinoId;
    }

    if (criteria.userId) {
      filters.idUsuario = criteria.userId;
    }

    if (criteria.calificacionMin || criteria.calificacionMax) {
      filters.calificacion = {};
      if (criteria.calificacionMin) {
        filters.calificacion.$gte = Number(criteria.calificacionMin);
      }
      if (criteria.calificacionMax) {
        filters.calificacion.$lte = Number(criteria.calificacionMax);
      }
    }

    if (criteria.fechaDesde || criteria.fechaHasta) {
      filters.fechaCreacion = {};
      if (criteria.fechaDesde) {
        filters.fechaCreacion.$gte = new Date(criteria.fechaDesde);
      }
      if (criteria.fechaHasta) {
        filters.fechaCreacion.$lte = new Date(criteria.fechaHasta);
      }
    }

    if (criteria.search) {
      filters.$or = [
        { comentario: new RegExp(criteria.search, 'i') },
        { titulo: new RegExp(criteria.search, 'i') },
      ];
    }

    return filters;
  }
}

module.exports = new ReseñaRepository();
