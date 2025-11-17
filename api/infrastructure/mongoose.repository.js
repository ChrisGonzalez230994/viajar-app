const BaseRepository = require('../repositories/base.repository');

/**
 * Implementación de BaseRepository usando Mongoose
 * Esta capa de infraestructura permite cambiar de base de datos fácilmente
 */
class MongooseRepository extends BaseRepository {
  constructor(model) {
    super(model);
  }

  /**
   * Obtener todos los registros con filtros, paginación y ordenamiento
   */
  async findAll(filters = {}, options = {}) {
    try {
      const {
        page = 1,
        limit = 20,
        sortBy = 'createdAt',
        sortOrder = 'desc',
        populate = [],
        select = '',
      } = options;

      const skip = (Number(page) - 1) * Number(limit);
      const sort = { [sortBy]: sortOrder === 'asc' ? 1 : -1 };

      let query = this.model.find(filters).sort(sort).limit(Number(limit)).skip(skip);

      // Populate relaciones
      if (populate.length > 0) {
        populate.forEach((field) => {
          query = query.populate(field);
        });
      }

      // Seleccionar campos específicos
      if (select) {
        query = query.select(select);
      }

      const data = await query.exec();
      const total = await this.model.countDocuments(filters);

      return {
        data,
        pagination: {
          page: Number(page),
          limit: Number(limit),
          total,
          totalPages: Math.ceil(total / Number(limit)),
        },
      };
    } catch (error) {
      throw new Error(`Error in findAll: ${error.message}`);
    }
  }

  /**
   * Obtener un registro por ID
   */
  async findById(id, populate = []) {
    try {
      let query = this.model.findById(id);

      if (populate.length > 0) {
        populate.forEach((field) => {
          query = query.populate(field);
        });
      }

      return await query.exec();
    } catch (error) {
      throw new Error(`Error in findById: ${error.message}`);
    }
  }

  /**
   * Buscar un registro con criterios
   */
  async findOne(filters, populate = []) {
    try {
      let query = this.model.findOne(filters);

      if (populate.length > 0) {
        populate.forEach((field) => {
          query = query.populate(field);
        });
      }

      return await query.exec();
    } catch (error) {
      throw new Error(`Error in findOne: ${error.message}`);
    }
  }

  /**
   * Crear un nuevo registro
   */
  async create(data) {
    try {
      const document = new this.model(data);
      return await document.save();
    } catch (error) {
      throw new Error(`Error in create: ${error.message}`);
    }
  }

  /**
   * Actualizar un registro
   */
  async update(id, data) {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Error in update: ${error.message}`);
    }
  }

  /**
   * Eliminar un registro (soft delete)
   */
  async delete(id) {
    try {
      const result = await this.model.findByIdAndDelete(id);
      return !!result;
    } catch (error) {
      throw new Error(`Error in delete: ${error.message}`);
    }
  }

  /**
   * Eliminar múltiples registros
   */
  async deleteMany(filters) {
    try {
      const result = await this.model.deleteMany(filters);
      return result.deletedCount;
    } catch (error) {
      throw new Error(`Error in deleteMany: ${error.message}`);
    }
  }

  /**
   * Búsqueda avanzada con múltiples criterios
   */
  async search(criteria, options = {}) {
    try {
      const filters = this.buildSearchFilters(criteria);
      return await this.findAll(filters, options);
    } catch (error) {
      throw new Error(`Error in search: ${error.message}`);
    }
  }

  /**
   * Contar documentos
   */
  async count(filters = {}) {
    try {
      return await this.model.countDocuments(filters);
    } catch (error) {
      throw new Error(`Error in count: ${error.message}`);
    }
  }

  /**
   * Verificar existencia
   */
  async exists(filters) {
    try {
      const count = await this.model.countDocuments(filters);
      return count > 0;
    } catch (error) {
      throw new Error(`Error in exists: ${error.message}`);
    }
  }

  /**
   * Actualizar múltiples documentos
   */
  async updateMany(filters, data) {
    try {
      const result = await this.model.updateMany(filters, { $set: data }, { runValidators: true });
      return result.modifiedCount;
    } catch (error) {
      throw new Error(`Error in updateMany: ${error.message}`);
    }
  }

  /**
   * Agregar elementos a un array
   */
  async addToArray(id, field, value) {
    try {
      return await this.model.findByIdAndUpdate(
        id,
        { $push: { [field]: value } },
        { new: true, runValidators: true }
      );
    } catch (error) {
      throw new Error(`Error in addToArray: ${error.message}`);
    }
  }

  /**
   * Remover elementos de un array
   */
  async removeFromArray(id, field, value) {
    try {
      return await this.model.findByIdAndUpdate(id, { $pull: { [field]: value } }, { new: true });
    } catch (error) {
      throw new Error(`Error in removeFromArray: ${error.message}`);
    }
  }

  /**
   * Construir filtros de búsqueda (puede ser sobrescrito por repositorios específicos)
   */
  buildSearchFilters(criteria) {
    return criteria;
  }
}

module.exports = MongooseRepository;
