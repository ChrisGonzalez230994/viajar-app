const MongooseRepository = require('../infrastructure/mongoose.repository');
const Destino = require('../models/destino');

/**
 * Repositorio de Destinos
 * Contiene la lógica específica de acceso a datos para destinos
 */
class DestinoRepository extends MongooseRepository {
  constructor() {
    super(Destino);
  }

  /**
   * Buscar destinos por país
   */
  async findByPais(pais, options = {}) {
    try {
      const filters = { pais: new RegExp(pais, 'i'), disponibilidad: true };
      return await this.findAll(filters, options);
    } catch (error) {
      throw new Error(`Error finding by país: ${error.message}`);
    }
  }

  /**
   * Buscar destinos por ciudad
   */
  async findByCiudad(ciudad, options = {}) {
    try {
      const filters = { ciudad: new RegExp(ciudad, 'i'), disponibilidad: true };
      return await this.findAll(filters, options);
    } catch (error) {
      throw new Error(`Error finding by ciudad: ${error.message}`);
    }
  }

  /**
   * Buscar destinos por rango de precio
   */
  async findByPriceRange(minPrice, maxPrice, options = {}) {
    try {
      const filters = {
        precio: { $gte: minPrice, $lte: maxPrice },
        disponibilidad: true,
      };
      return await this.findAll(filters, options);
    } catch (error) {
      throw new Error(`Error finding by price range: ${error.message}`);
    }
  }

  /**
   * Buscar destinos por calificación mínima
   */
  async findByMinRating(minRating, options = {}) {
    try {
      const filters = {
        calificacionPromedio: { $gte: minRating },
        disponibilidad: true,
      };
      return await this.findAll(filters, options);
    } catch (error) {
      throw new Error(`Error finding by rating: ${error.message}`);
    }
  }

  /**
   * Buscar destinos cercanos a una ubicación (geo-espacial)
   */
  async findNearby(latitude, longitude, maxDistance = 50000, options = {}) {
    try {
      const filters = {
        'ubicacion.latitud': {
          $gte: latitude - maxDistance / 111320,
          $lte: latitude + maxDistance / 111320,
        },
        'ubicacion.longitud': {
          $gte: longitude - maxDistance / (111320 * Math.cos((latitude * Math.PI) / 180)),
          $lte: longitude + maxDistance / (111320 * Math.cos((latitude * Math.PI) / 180)),
        },
        disponibilidad: true,
      };
      return await this.findAll(filters, options);
    } catch (error) {
      throw new Error(`Error finding nearby destinations: ${error.message}`);
    }
  }

  /**
   * Buscar destinos por actividades
   */
  async findByActivities(activities, options = {}) {
    try {
      const filters = {
        actividades: { $in: activities },
        disponibilidad: true,
      };
      return await this.findAll(filters, options);
    } catch (error) {
      throw new Error(`Error finding by activities: ${error.message}`);
    }
  }

  /**
   * Obtener destinos populares (mejor calificados)
   */
  async findPopular(limit = 10) {
    try {
      return await this.findAll(
        { disponibilidad: true },
        {
          limit,
          sortBy: 'calificacionPromedio',
          sortOrder: 'desc',
        }
      );
    } catch (error) {
      throw new Error(`Error finding popular destinations: ${error.message}`);
    }
  }

  /**
   * Obtener destinos destacados
   */
  async findFeatured(limit = 6) {
    try {
      return await this.findAll(
        { destacado: true, disponibilidad: true },
        {
          limit,
          sortBy: 'createdAt',
          sortOrder: 'desc',
        }
      );
    } catch (error) {
      throw new Error(`Error finding featured destinations: ${error.message}`);
    }
  }

  /**
   * Actualizar calificación promedio
   */
  async updateRating(destinoId, newRating) {
    try {
      return await this.update(destinoId, { calificacionPromedio: newRating });
    } catch (error) {
      throw new Error(`Error updating rating: ${error.message}`);
    }
  }

  /**
   * Actualizar disponibilidad
   */
  async updateAvailability(destinoId, available) {
    try {
      return await this.update(destinoId, { disponibilidad: available });
    } catch (error) {
      throw new Error(`Error updating availability: ${error.message}`);
    }
  }

  /**
   * Construir filtros de búsqueda avanzada
   */
  buildSearchFilters(criteria) {
    const filters = { disponibilidad: true };

    // Búsqueda por texto en nombre, ciudad, país, descripción
    if (criteria.search) {
      filters.$or = [
        { nombre: new RegExp(criteria.search, 'i') },
        { ciudad: new RegExp(criteria.search, 'i') },
        { pais: new RegExp(criteria.search, 'i') },
        { descripcion: new RegExp(criteria.search, 'i') },
      ];
    }

    // Filtro por ciudad
    if (criteria.ciudad) {
      filters.ciudad = new RegExp(criteria.ciudad, 'i');
    }

    // Filtro por país
    if (criteria.pais) {
      filters.pais = new RegExp(criteria.pais, 'i');
    }

    // Rango de precio
    if (criteria.precioMin || criteria.precioMax) {
      filters.precio = {};
      if (criteria.precioMin) filters.precio.$gte = Number(criteria.precioMin);
      if (criteria.precioMax) filters.precio.$lte = Number(criteria.precioMax);
    }

    // Calificación mínima
    if (criteria.calificacionMin) {
      filters.calificacionPromedio = { $gte: Number(criteria.calificacionMin) };
    }

    // Actividades
    if (criteria.actividades && Array.isArray(criteria.actividades)) {
      filters.actividades = { $in: criteria.actividades };
    }

    return filters;
  }
}

module.exports = new DestinoRepository();
