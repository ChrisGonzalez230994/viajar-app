/**
 * Base Repository Interface
 * Define los métodos CRUD básicos que todo repositorio debe implementar
 */
class BaseRepository {
  constructor(model) {
    if (!model) {
      throw new Error('Model is required for repository');
    }
    this.model = model;
  }

  /**
   * Obtener todos los registros
   * @param {Object} filters - Filtros opcionales
   * @param {Object} options - Opciones de paginación y ordenamiento
   * @returns {Promise<Array>}
   */
  async findAll(filters = {}, options = {}) {
    throw new Error('Method findAll() must be implemented');
  }

  /**
   * Obtener un registro por ID
   * @param {String} id - ID del registro
   * @returns {Promise<Object|null>}
   */
  async findById(id) {
    throw new Error('Method findById() must be implemented');
  }

  /**
   * Crear un nuevo registro
   * @param {Object} data - Datos del nuevo registro
   * @returns {Promise<Object>}
   */
  async create(data) {
    throw new Error('Method create() must be implemented');
  }

  /**
   * Actualizar un registro existente
   * @param {String} id - ID del registro
   * @param {Object} data - Datos a actualizar
   * @returns {Promise<Object|null>}
   */
  async update(id, data) {
    throw new Error('Method update() must be implemented');
  }

  /**
   * Eliminar un registro
   * @param {String} id - ID del registro
   * @returns {Promise<boolean>}
   */
  async delete(id) {
    throw new Error('Method delete() must be implemented');
  }

  /**
   * Buscar registros con criterios específicos
   * @param {Object} criteria - Criterios de búsqueda
   * @returns {Promise<Array>}
   */
  async search(criteria) {
    throw new Error('Method search() must be implemented');
  }

  /**
   * Contar registros que coinciden con los filtros
   * @param {Object} filters - Filtros
   * @returns {Promise<Number>}
   */
  async count(filters = {}) {
    throw new Error('Method count() must be implemented');
  }

  /**
   * Verificar si existe un registro
   * @param {Object} filters - Filtros
   * @returns {Promise<boolean>}
   */
  async exists(filters) {
    throw new Error('Method exists() must be implemented');
  }
}

module.exports = BaseRepository;
