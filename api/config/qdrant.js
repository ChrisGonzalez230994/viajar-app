const { QdrantClient } = require('@qdrant/js-client-rest');
require('dotenv').config();

/**
 * Cliente de Qdrant para base de datos vectorial
 * Singleton para reutilizar la conexión
 */
class QdrantConnection {
  constructor() {
    if (QdrantConnection.instance) {
      return QdrantConnection.instance;
    }

    this.client = new QdrantClient({
      url: `http://${process.env.QDRANT_HOST || 'localhost'}:${process.env.QDRANT_PORT || 6333}`,
      apiKey: process.env.QDRANT_API_KEY || undefined,
    });

    this.collectionName = 'destinos';
    this.isInitialized = false;

    QdrantConnection.instance = this;
  }

  /**
   * Inicializar colección si no existe
   */
  async initialize() {
    if (this.isInitialized) {
      return;
    }

    try {
      // Verificar si la colección existe
      const collections = await this.client.getCollections();
      const collectionExists = collections.collections.some(
        (col) => col.name === this.collectionName
      );

      if (!collectionExists) {
        console.log(`🚀 Creando colección "${this.collectionName}" en Qdrant...`);

        // Crear colección con vectores de 1536 dimensiones (OpenAI text-embedding-3-small)
        await this.client.createCollection(this.collectionName, {
          vectors: {
            size: 1536,
            distance: 'Cosine', // Cosine similarity para embeddings
          },
          optimizers_config: {
            default_segment_number: 2,
          },
          replication_factor: 1,
        });

        // Crear índices para filtros
        await this.client.createPayloadIndex(this.collectionName, {
          field_name: 'pais',
          field_schema: 'keyword',
        });

        await this.client.createPayloadIndex(this.collectionName, {
          field_name: 'ciudad',
          field_schema: 'keyword',
        });

        await this.client.createPayloadIndex(this.collectionName, {
          field_name: 'actividades',
          field_schema: 'keyword',
        });

        await this.client.createPayloadIndex(this.collectionName, {
          field_name: 'precio',
          field_schema: 'float',
        });

        await this.client.createPayloadIndex(this.collectionName, {
          field_name: 'disponibilidad',
          field_schema: 'bool',
        });

        console.log('✅ Colección creada exitosamente');
      } else {
        console.log(`✅ Colección "${this.collectionName}" ya existe`);
      }

      this.isInitialized = true;
    } catch (error) {
      console.error('❌ Error inicializando Qdrant:', error.message);
      throw error;
    }
  }

  /**
   * Obtener cliente de Qdrant
   */
  getClient() {
    return this.client;
  }

  /**
   * Obtener nombre de colección
   */
  getCollectionName() {
    return this.collectionName;
  }

  /**
   * Verificar salud de la conexión
   */
  async healthCheck() {
    try {
      await this.client.getCollections();
      return true;
    } catch (error) {
      console.error('❌ Qdrant health check failed:', error.message);
      return false;
    }
  }
}

// Exportar instancia única
const qdrantConnection = new QdrantConnection();
module.exports = qdrantConnection;
