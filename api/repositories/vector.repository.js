const qdrantConnection = require('../config/qdrant');
const embeddingService = require('../services/embedding.service');
const crypto = require('crypto');

/**
 * Convierte MongoDB ObjectId a UUID v5 compatible con Qdrant
 */
function objectIdToUuid(objectId) {
  const objectIdStr = objectId.toString();
  // Usar namespace DNS para generar UUID v5 consistente
  const namespace = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';
  return crypto
    .createHash('md5')
    .update(namespace + objectIdStr)
    .digest('hex')
    .replace(/(.{8})(.{4})(.{4})(.{4})(.{12})/, '$1-$2-$3-$4-$5');
}

/**
 * Repositorio Vectorial para búsquedas semánticas
 * Maneja la interacción con Qdrant
 */
class VectorRepository {
  constructor() {
    this.qdrant = qdrantConnection;
  }

  /**
   * Indexar un destino en la base de datos vectorial
   */
  async indexDestino(destino) {
    try {
      await this.qdrant.initialize();

      // Preparar texto para embedding
      const text = embeddingService.prepareDestinoText(destino);

      // Generar embedding
      const embedding = await embeddingService.generateEmbedding(text);

      // Preparar payload con metadata
      const payload = {
        destinoId: destino._id.toString(),
        nombre: destino.nombre,
        ciudad: destino.ciudad,
        pais: destino.pais,
        descripcion: destino.descripcion,
        precio: destino.precio,
        actividades: destino.actividades || [],
        categorias: destino.categorias || [],
        tipoViaje: destino.tipoViaje || [],
        calificacionPromedio: destino.calificacionPromedio || 0,
        disponibilidad: destino.disponibilidad !== false,
        imagenPrincipal: destino.imagenPrincipal || null,
        ubicacion: destino.ubicacion || null,
      };

      // Insertar en Qdrant
      const client = this.qdrant.getClient();
      const collectionName = this.qdrant.getCollectionName();

      await client.upsert(collectionName, {
        wait: true,
        points: [
          {
            id: objectIdToUuid(destino._id),
            vector: embedding,
            payload: payload,
          },
        ],
      });

      console.log(`✅ Destino "${destino.nombre}" indexado en Qdrant`);
      return true;
    } catch (error) {
      console.error('❌ Error indexando destino:', error.message);
      throw error;
    }
  }

  /**
   * Indexar múltiples destinos en batch
   */
  async indexDestinosBatch(destinos) {
    try {
      await this.qdrant.initialize();

      if (!Array.isArray(destinos) || destinos.length === 0) {
        throw new Error('Debe proporcionar un array de destinos');
      }

      console.log(`📦 Indexando ${destinos.length} destinos...`);

      // Preparar textos
      const texts = destinos.map((d) => embeddingService.prepareDestinoText(d));

      // Generar embeddings en batch
      const embeddings = await embeddingService.generateBatchEmbeddings(texts);

      // Preparar puntos para Qdrant
      const points = destinos.map((destino, index) => ({
        id: objectIdToUuid(destino._id),
        vector: embeddings[index],
        payload: {
          destinoId: destino._id.toString(),
          nombre: destino.nombre,
          ciudad: destino.ciudad,
          pais: destino.pais,
          descripcion: destino.descripcion,
          precio: destino.precio,
          actividades: destino.actividades || [],
          categorias: destino.categorias || [],
          tipoViaje: destino.tipoViaje || [],
          calificacionPromedio: destino.calificacionPromedio || 0,
          disponibilidad: destino.disponibilidad !== false,
          imagenPrincipal: destino.imagenPrincipal || null,
          ubicacion: destino.ubicacion || null,
        },
      }));

      // Insertar en Qdrant
      const client = this.qdrant.getClient();
      const collectionName = this.qdrant.getCollectionName();

      await client.upsert(collectionName, {
        wait: true,
        points: points,
      });

      console.log(`✅ ${destinos.length} destinos indexados exitosamente`);
      return true;
    } catch (error) {
      console.error('❌ Error indexando destinos batch:', error.message);
      if (error.response) {
        console.error('Response data:', error.response.data);
      }
      if (error.data) {
        console.error('Error data:', error.data);
      }
      throw error;
    }
  }

  /**
   * Búsqueda semántica de destinos
   */
  async searchDestinos(query, options = {}) {
    try {
      await this.qdrant.initialize();

      const {
        limit = 10,
        tipoViaje = null,
        precioMin = null,
        precioMax = null,
        pais = null,
        ciudad = null,
        calificacionMin = null,
        soloDisponibles = true,
      } = options;

      // Preparar query con contexto
      const enrichedQuery = embeddingService.prepareSearchQuery(query, { tipoViaje });

      // Generar embedding de la query
      const queryEmbedding = await embeddingService.generateEmbedding(enrichedQuery);

      // Construir filtros
      const filter = {
        must: [],
      };

      if (soloDisponibles) {
        filter.must.push({
          key: 'disponibilidad',
          match: { value: true },
        });
      }

      if (tipoViaje) {
        filter.must.push({
          key: 'tipoViaje',
          match: { any: [tipoViaje] },
        });
      }

      if (pais) {
        filter.must.push({
          key: 'pais',
          match: { value: pais },
        });
      }

      if (ciudad) {
        filter.must.push({
          key: 'ciudad',
          match: { value: ciudad },
        });
      }

      if (precioMin !== null || precioMax !== null) {
        const rangeFilter = { key: 'precio', range: {} };
        if (precioMin !== null) rangeFilter.range.gte = precioMin;
        if (precioMax !== null) rangeFilter.range.lte = precioMax;
        filter.must.push(rangeFilter);
      }

      if (calificacionMin !== null) {
        filter.must.push({
          key: 'calificacionPromedio',
          range: { gte: calificacionMin },
        });
      }

      // Realizar búsqueda
      const client = this.qdrant.getClient();
      const collectionName = this.qdrant.getCollectionName();

      const searchResult = await client.search(collectionName, {
        vector: queryEmbedding,
        filter: filter.must.length > 0 ? filter : undefined,
        limit: limit,
        with_payload: true,
      });

      // Formatear resultados
      const results = searchResult.map((result) => ({
        ...result.payload,
        score: result.score, // Similaridad (0-1, más alto = más similar)
        relevance: Math.round(result.score * 100), // Porcentaje de relevancia
      }));

      return {
        query: query,
        results: results,
        total: results.length,
        enrichedQuery: enrichedQuery,
      };
    } catch (error) {
      console.error('❌ Error en búsqueda vectorial:', error.message);
      throw error;
    }
  }

  /**
   * Eliminar destino del índice vectorial
   */
  async deleteDestino(destinoId) {
    try {
      await this.qdrant.initialize();

      const client = this.qdrant.getClient();
      const collectionName = this.qdrant.getCollectionName();

      await client.delete(collectionName, {
        wait: true,
        points: [destinoId.toString()],
      });

      console.log(`✅ Destino ${destinoId} eliminado del índice`);
      return true;
    } catch (error) {
      console.error('❌ Error eliminando destino del índice:', error.message);
      throw error;
    }
  }

  /**
   * Actualizar destino en el índice
   */
  async updateDestino(destino) {
    try {
      // Re-indexar (upsert sobrescribe)
      return await this.indexDestino(destino);
    } catch (error) {
      console.error('❌ Error actualizando destino en índice:', error.message);
      throw error;
    }
  }

  /**
   * Obtener estadísticas de la colección
   */
  async getStats() {
    try {
      await this.qdrant.initialize();

      const client = this.qdrant.getClient();
      const collectionName = this.qdrant.getCollectionName();

      const info = await client.getCollection(collectionName);

      return {
        totalPoints: info.points_count,
        vectorSize: info.config.params.vectors.size,
        distance: info.config.params.vectors.distance,
        status: info.status,
      };
    } catch (error) {
      console.error('❌ Error obteniendo estadísticas:', error.message);
      throw error;
    }
  }

  /**
   * Limpiar toda la colección
   */
  async clearCollection() {
    try {
      await this.qdrant.initialize();

      const client = this.qdrant.getClient();
      const collectionName = this.qdrant.getCollectionName();

      await client.deleteCollection(collectionName);
      await this.qdrant.initialize(); // Re-crear colección

      console.log('✅ Colección limpiada y re-creada');
      return true;
    } catch (error) {
      console.error('❌ Error limpiando colección:', error.message);
      throw error;
    }
  }

  /**
   * Buscar destinos similares a uno dado
   */
  async findSimilarDestinos(destinoId, limit = 5) {
    try {
      await this.qdrant.initialize();

      const client = this.qdrant.getClient();
      const collectionName = this.qdrant.getCollectionName();

      // Obtener el punto del destino
      const points = await client.retrieve(collectionName, {
        ids: [destinoId.toString()],
        with_vector: true,
      });

      if (points.length === 0) {
        throw new Error('Destino no encontrado en el índice');
      }

      const vector = points[0].vector;

      // Buscar similares
      const searchResult = await client.search(collectionName, {
        vector: vector,
        filter: {
          must_not: [
            {
              key: 'destinoId',
              match: { value: destinoId.toString() },
            },
          ],
        },
        limit: limit,
        with_payload: true,
      });

      return searchResult.map((result) => ({
        ...result.payload,
        score: result.score,
        relevance: Math.round(result.score * 100),
      }));
    } catch (error) {
      console.error('❌ Error buscando destinos similares:', error.message);
      throw error;
    }
  }

  /**
   * Recrear la colección (eliminar y crear nueva)
   * Útil para limpiar el índice completamente
   */
  async recreateCollection() {
    try {
      await this.qdrant.initialize();

      const client = this.qdrant.getClient();
      const collectionName = this.qdrant.getCollectionName();

      // Intentar eliminar la colección existente
      try {
        await client.deleteCollection(collectionName);
        console.log(`✓ Colección "${collectionName}" eliminada`);
      } catch (error) {
        // Si no existe, continuar
        console.log(`⚠️ Colección "${collectionName}" no existía`);
      }

      // Crear nueva colección
      await client.createCollection(collectionName, {
        vectors: {
          size: 1536, // OpenAI embeddings dimension
          distance: 'Cosine',
        },
      });

      console.log(`✓ Colección "${collectionName}" creada exitosamente`);
      return true;
    } catch (error) {
      console.error('❌ Error recreando colección:', error.message);
      throw error;
    }
  }
}

module.exports = new VectorRepository();
