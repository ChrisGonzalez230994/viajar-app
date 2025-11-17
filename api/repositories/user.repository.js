const MongooseRepository = require('../infrastructure/mongoose.repository');
const User = require('../models/user');

/**
 * Repositorio de Usuarios
 * Contiene la lógica específica de acceso a datos para usuarios
 */
class UserRepository extends MongooseRepository {
  constructor() {
    super(User);
  }

  /**
   * Buscar usuario por email
   */
  async findByEmail(email) {
    try {
      return await this.findOne({ email: email.toLowerCase() });
    } catch (error) {
      throw new Error(`Error finding by email: ${error.message}`);
    }
  }

  /**
   * Buscar usuario por username
   */
  async findByUsername(username) {
    try {
      return await this.findOne({ username });
    } catch (error) {
      throw new Error(`Error finding by username: ${error.message}`);
    }
  }

  /**
   * Verificar si existe un email
   */
  async emailExists(email) {
    try {
      return await this.exists({ email: email.toLowerCase() });
    } catch (error) {
      throw new Error(`Error checking email: ${error.message}`);
    }
  }

  /**
   * Verificar si existe un username
   */
  async usernameExists(username) {
    try {
      return await this.exists({ username });
    } catch (error) {
      throw new Error(`Error checking username: ${error.message}`);
    }
  }

  /**
   * Crear usuario (sobrescrito para normalizar email)
   */
  async create(data) {
    try {
      if (data.email) {
        data.email = data.email.toLowerCase();
      }
      return await super.create(data);
    } catch (error) {
      throw new Error(`Error creating user: ${error.message}`);
    }
  }

  /**
   * Actualizar contraseña
   */
  async updatePassword(userId, newPasswordHash) {
    try {
      return await this.update(userId, {
        password: newPasswordHash,
        lastPasswordChange: new Date(),
      });
    } catch (error) {
      throw new Error(`Error updating password: ${error.message}`);
    }
  }

  /**
   * Actualizar último login
   */
  async updateLastLogin(userId) {
    try {
      return await this.update(userId, {
        lastLogin: new Date(),
        $inc: { loginCount: 1 },
      });
    } catch (error) {
      throw new Error(`Error updating last login: ${error.message}`);
    }
  }

  /**
   * Buscar usuarios por rol
   */
  async findByRole(role, options = {}) {
    try {
      const filters = { role };
      return await this.findAll(filters, options);
    } catch (error) {
      throw new Error(`Error finding by role: ${error.message}`);
    }
  }

  /**
   * Buscar usuarios activos
   */
  async findActive(options = {}) {
    try {
      const filters = { isActive: true };
      return await this.findAll(filters, options);
    } catch (error) {
      throw new Error(`Error finding active users: ${error.message}`);
    }
  }

  /**
   * Buscar usuarios inactivos
   */
  async findInactive(options = {}) {
    try {
      const filters = { isActive: false };
      return await this.findAll(filters, options);
    } catch (error) {
      throw new Error(`Error finding inactive users: ${error.message}`);
    }
  }

  /**
   * Activar/Desactivar usuario
   */
  async toggleActive(userId, isActive) {
    try {
      return await this.update(userId, {
        isActive,
        updatedAt: new Date(),
      });
    } catch (error) {
      throw new Error(`Error toggling user active: ${error.message}`);
    }
  }

  /**
   * Actualizar perfil de usuario
   */
  async updateProfile(userId, profileData) {
    try {
      const allowedFields = [
        'nombre',
        'apellido',
        'telefono',
        'direccion',
        'avatar',
        'preferences',
      ];
      const updateData = {};

      Object.keys(profileData).forEach((key) => {
        if (allowedFields.includes(key)) {
          updateData[key] = profileData[key];
        }
      });

      return await this.update(userId, updateData);
    } catch (error) {
      throw new Error(`Error updating profile: ${error.message}`);
    }
  }

  /**
   * Agregar destino a favoritos
   */
  async addFavoriteDestination(userId, destinoId) {
    try {
      return await this.addToArray(userId, 'favoritos', destinoId);
    } catch (error) {
      throw new Error(`Error adding favorite: ${error.message}`);
    }
  }

  /**
   * Remover destino de favoritos
   */
  async removeFavoriteDestination(userId, destinoId) {
    try {
      return await this.removeFromArray(userId, 'favoritos', destinoId);
    } catch (error) {
      throw new Error(`Error removing favorite: ${error.message}`);
    }
  }

  /**
   * Obtener favoritos de un usuario
   */
  async getFavorites(userId) {
    try {
      const user = await this.findById(userId, ['favoritos']);
      return user ? user.favoritos : [];
    } catch (error) {
      throw new Error(`Error getting favorites: ${error.message}`);
    }
  }

  /**
   * Buscar usuarios registrados en un rango de fechas
   */
  async findByRegistrationDate(startDate, endDate, options = {}) {
    try {
      const filters = {
        createdAt: {
          $gte: new Date(startDate),
          $lte: new Date(endDate),
        },
      };
      return await this.findAll(filters, options);
    } catch (error) {
      throw new Error(`Error finding by registration date: ${error.message}`);
    }
  }

  /**
   * Obtener estadísticas de usuarios
   */
  async getUserStats() {
    try {
      const [total, active, byRole] = await Promise.all([
        this.count(),
        this.count({ isActive: true }),
        this.model.aggregate([
          {
            $group: {
              _id: '$role',
              count: { $sum: 1 },
            },
          },
        ]),
      ]);

      const roleStats = {};
      byRole.forEach((item) => {
        roleStats[item._id] = item.count;
      });

      return {
        total,
        active,
        inactive: total - active,
        byRole: roleStats,
      };
    } catch (error) {
      throw new Error(`Error getting user stats: ${error.message}`);
    }
  }

  /**
   * Construir filtros de búsqueda avanzada
   */
  buildSearchFilters(criteria) {
    const filters = {};

    if (criteria.search) {
      filters.$or = [
        { nombre: new RegExp(criteria.search, 'i') },
        { apellido: new RegExp(criteria.search, 'i') },
        { email: new RegExp(criteria.search, 'i') },
        { username: new RegExp(criteria.search, 'i') },
      ];
    }

    if (criteria.role) {
      filters.role = criteria.role;
    }

    if (criteria.isActive !== undefined) {
      filters.isActive = criteria.isActive;
    }

    if (criteria.registroDesde || criteria.registroHasta) {
      filters.createdAt = {};
      if (criteria.registroDesde) {
        filters.createdAt.$gte = new Date(criteria.registroDesde);
      }
      if (criteria.registroHasta) {
        filters.createdAt.$lte = new Date(criteria.registroHasta);
      }
    }

    return filters;
  }
}

module.exports = new UserRepository();
