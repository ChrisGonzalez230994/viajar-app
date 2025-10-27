const express = require("express");
const router = express.Router();
const { checkAuth, checkAdmin } = require("../middlewares/authentication.js");

// Models import
const Destino = require("../models/destino.js");
const Reseña = require("../models/reseña.js");

//******************
//**** DESTINOS ****
//******************

// GET - Obtener todos los destinos con filtros y búsqueda
router.get("/", async (req, res) => {
  try {
    const { 
      search, 
      ciudad, 
      pais, 
      precioMin, 
      precioMax, 
      calificacionMin,
      limit = 20,
      page = 1,
      sortBy = 'createdAt',
      sortOrder = 'desc'
    } = req.query;

    let query = { disponibilidad: true };

    // Búsqueda por texto (nombre, ciudad, país, descripción)
    if (search) {
      query.$text = { $search: search };
    }

    // Filtros específicos
    if (ciudad) {
      query.ciudad = new RegExp(ciudad, 'i');
    }

    if (pais) {
      query.pais = new RegExp(pais, 'i');
    }

    if (precioMin || precioMax) {
      query.precio = {};
      if (precioMin) query.precio.$gte = Number(precioMin);
      if (precioMax) query.precio.$lte = Number(precioMax);
    }

    if (calificacionMin) {
      query.calificacionPromedio = { $gte: Number(calificacionMin) };
    }

    // Ordenamiento
    const sort = {};
    sort[sortBy] = sortOrder === 'asc' ? 1 : -1;

    // Paginación
    const skip = (Number(page) - 1) * Number(limit);

    const destinos = await Destino.find(query)
      .sort(sort)
      .limit(Number(limit))
      .skip(skip);

    const total = await Destino.countDocuments(query);

    const response = {
      status: "success",
      data: destinos,
      pagination: {
        page: Number(page),
        limit: Number(limit),
        total,
        totalPages: Math.ceil(total / Number(limit))
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error obteniendo destinos:", error);
    return res.status(500).json({
      status: "error",
      error: "Error al obtener los destinos"
    });
  }
});

// GET - Obtener un destino por ID con sus reseñas
router.get("/:id", async (req, res) => {
  try {
    const destino = await Destino.findById(req.params.id);

    if (!destino) {
      return res.status(404).json({
        status: "error",
        error: "Destino no encontrado"
      });
    }

    // Obtener las últimas reseñas del destino
    const reseñas = await Reseña.find({ destino: req.params.id })
      .populate('usuario', 'username nombre apellido')
      .sort({ createdAt: -1 })
      .limit(10);

    const response = {
      status: "success",
      data: {
        ...destino.toObject(),
        reseñas
      }
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error obteniendo destino:", error);
    return res.status(500).json({
      status: "error",
      error: "Error al obtener el destino"
    });
  }
});

// POST - Crear un nuevo destino (solo admin)
router.post("/", checkAuth, checkAdmin, async (req, res) => {
  try {
    const {
      nombre,
      ciudad,
      pais,
      descripcion,
      imagenes,
      imagenPrincipal,
      precio,
      ubicacion,
      actividades,
      capacidadMaxima
    } = req.body;

    // Validaciones
    if (!nombre || !ciudad || !pais || !descripcion || !precio || !ubicacion) {
      return res.status(400).json({
        status: "error",
        error: "Faltan campos requeridos"
      });
    }

    const nuevoDestino = new Destino({
      nombre,
      ciudad,
      pais,
      descripcion,
      imagenes: imagenes || [],
      imagenPrincipal,
      precio,
      ubicacion,
      actividades: actividades || [],
      capacidadMaxima
    });

    await nuevoDestino.save();

    const response = {
      status: "success",
      message: "Destino creado exitosamente",
      data: nuevoDestino
    };

    return res.status(201).json(response);
  } catch (error) {
    console.error("Error creando destino:", error);
    return res.status(500).json({
      status: "error",
      error: "Error al crear el destino"
    });
  }
});

// PUT - Actualizar un destino (solo admin)
router.put("/:id", checkAuth, checkAdmin, async (req, res) => {
  try {
    const {
      nombre,
      ciudad,
      pais,
      descripcion,
      imagenes,
      imagenPrincipal,
      precio,
      ubicacion,
      actividades,
      disponibilidad,
      capacidadMaxima
    } = req.body;

    const destino = await Destino.findById(req.params.id);

    if (!destino) {
      return res.status(404).json({
        status: "error",
        error: "Destino no encontrado"
      });
    }

    // Actualizar campos
    if (nombre !== undefined) destino.nombre = nombre;
    if (ciudad !== undefined) destino.ciudad = ciudad;
    if (pais !== undefined) destino.pais = pais;
    if (descripcion !== undefined) destino.descripcion = descripcion;
    if (imagenes !== undefined) destino.imagenes = imagenes;
    if (imagenPrincipal !== undefined) destino.imagenPrincipal = imagenPrincipal;
    if (precio !== undefined) destino.precio = precio;
    if (ubicacion !== undefined) destino.ubicacion = ubicacion;
    if (actividades !== undefined) destino.actividades = actividades;
    if (disponibilidad !== undefined) destino.disponibilidad = disponibilidad;
    if (capacidadMaxima !== undefined) destino.capacidadMaxima = capacidadMaxima;

    await destino.save();

    const response = {
      status: "success",
      message: "Destino actualizado exitosamente",
      data: destino
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error actualizando destino:", error);
    return res.status(500).json({
      status: "error",
      error: "Error al actualizar el destino"
    });
  }
});

// DELETE - Eliminar un destino (solo admin)
router.delete("/:id", checkAuth, checkAdmin, async (req, res) => {
  try {
    const destino = await Destino.findById(req.params.id);

    if (!destino) {
      return res.status(404).json({
        status: "error",
        error: "Destino no encontrado"
      });
    }

    // En lugar de eliminar, desactivar
    destino.disponibilidad = false;
    await destino.save();

    const response = {
      status: "success",
      message: "Destino desactivado exitosamente"
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error eliminando destino:", error);
    return res.status(500).json({
      status: "error",
      error: "Error al eliminar el destino"
    });
  }
});

// GET - Obtener destinos destacados (mejores calificados)
router.get("/destacados/top", async (req, res) => {
  try {
    const limit = req.query.limit || 10;

    const destinos = await Destino.find({ 
      disponibilidad: true,
      totalReseñas: { $gte: 1 } 
    })
      .sort({ calificacionPromedio: -1, totalReseñas: -1 })
      .limit(Number(limit));

    const response = {
      status: "success",
      data: destinos
    };

    return res.status(200).json(response);
  } catch (error) {
    console.error("Error obteniendo destinos destacados:", error);
    return res.status(500).json({
      status: "error",
      error: "Error al obtener destinos destacados"
    });
  }
});

module.exports = router;
