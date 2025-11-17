const OpenAI = require('openai');
require('dotenv').config();

/**
 * Servicio de Embeddings usando OpenAI
 * Convierte texto a vectores para búsqueda semántica
 */
class EmbeddingService {
  constructor() {
    if (!process.env.OPENAI_API_KEY) {
      console.warn('⚠️  OPENAI_API_KEY no configurada. El servicio de embeddings no funcionará.');
    }

    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });

    this.model = process.env.OPENAI_EMBEDDING_MODEL || 'text-embedding-3-small';
  }

  /**
   * Generar embedding para texto
   * @param {string} text - Texto a convertir en vector
   * @returns {Promise<number[]>} Vector de embeddings
   */
  async generateEmbedding(text) {
    try {
      if (!text || typeof text !== 'string') {
        throw new Error('El texto debe ser un string no vacío');
      }

      const response = await this.openai.embeddings.create({
        model: this.model,
        input: text,
        encoding_format: 'float',
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('❌ Error generando embedding:', error.message);
      throw new Error(`Error generando embedding: ${error.message}`);
    }
  }

  /**
   * Generar embeddings para múltiples textos
   * @param {string[]} texts - Array de textos
   * @returns {Promise<number[][]>} Array de vectores
   */
  async generateBatchEmbeddings(texts) {
    try {
      if (!Array.isArray(texts) || texts.length === 0) {
        throw new Error('Debe proporcionar un array de textos no vacío');
      }

      const response = await this.openai.embeddings.create({
        model: this.model,
        input: texts,
        encoding_format: 'float',
      });

      return response.data.map((item) => item.embedding);
    } catch (error) {
      console.error('❌ Error generando embeddings batch:', error.message);
      throw new Error(`Error generando embeddings: ${error.message}`);
    }
  }

  /**
   * Preparar texto de destino para embedding
   * Combina todos los campos relevantes en un texto descriptivo
   */
  prepareDestinoText(destino) {
    const parts = [];

    // Información básica
    if (destino.nombre) parts.push(`Destino: ${destino.nombre}`);
    if (destino.ciudad) parts.push(`Ciudad: ${destino.ciudad}`);
    if (destino.pais) parts.push(`País: ${destino.pais}`);

    // Descripción detallada
    if (destino.descripcion) parts.push(`Descripción: ${destino.descripcion}`);

    // Actividades disponibles
    if (destino.actividades && destino.actividades.length > 0) {
      parts.push(`Actividades: ${destino.actividades.join(', ')}`);
    }

    // Categorías/Tags si existen
    if (destino.categorias && destino.categorias.length > 0) {
      parts.push(`Categorías: ${destino.categorias.join(', ')}`);
    }

    // Tipo de viaje (si existe)
    if (destino.tipoViaje && destino.tipoViaje.length > 0) {
      parts.push(`Tipo de viaje: ${destino.tipoViaje.join(', ')}`);
    }

    return parts.join('. ');
  }

  /**
   * Preparar query de búsqueda del usuario
   * Enriquece la query con contexto
   */
  prepareSearchQuery(query, filters = {}) {
    const parts = [query];

    // Agregar contexto de filtros para mejor matching
    if (filters.tipoViaje) {
      const tipoMap = {
        aventura: 'aventura, adrenalina, deportes extremos, naturaleza salvaje',
        romantico: 'romántico, parejas, luna de miel, cenas especiales',
        historia: 'histórico, cultural, museos, monumentos, patrimonio',
        naturaleza: 'naturaleza, ecológico, vida silvestre, paisajes',
        familiar: 'familiar, niños, actividades en familia, diversión',
        playa: 'playa, sol, mar, arena, costa',
        ciudad: 'ciudad, urbano, compras, vida nocturna',
        gastronomico: 'gastronomía, comida, restaurantes, cocina local',
        relax: 'relax, spa, descanso, tranquilidad, bienestar',
        fotografia: 'fotografía, paisajes, vistas panorámicas',
      };

      if (tipoMap[filters.tipoViaje]) {
        parts.push(tipoMap[filters.tipoViaje]);
      }
    }

    return parts.join('. ');
  }
}

module.exports = new EmbeddingService();
