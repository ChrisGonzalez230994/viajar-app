const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const { checkAuth } = require('../middlewares/authentication.js');

//models import

const User = require('../models/user.js');

// Throttling map for MQTT credentials requests
const mqttCredentialsThrottle = new Map();

// Limpieza periódica del throttling map (cada 5 minutos)
setInterval(() => {
  const now = Date.now();
  const throttleTime = 10000; // 10 segundos

  for (const [userId, timestamp] of mqttCredentialsThrottle.entries()) {
    if (now - timestamp > throttleTime * 6) {
      // Limpiar entradas más antiguas que 1 minuto
      mqttCredentialsThrottle.delete(userId);
    }
  }
}, 5 * 60 * 1000); // 5 minutos

//POST -> req.body
//GET -> req.query

//******************
//**** A P I *******
//******************

//LOGIN
router.post('/login', async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    var user = await User.findOne({ email: email });

    //if no email
    if (!user) {
      const response = {
        status: 'error',
        code: 1,
        error: 'Invalid Credentials',
      };
      return res.status(401).json(response);
    }

    if (user.confirmed === false) {
      const response = {
        status: 'error',
        code: 0,
        error: 'Please confirm your email',
      };
      return res.status(404).json(response);
    }
    //if email and email ok
    if (bcrypt.compareSync(password, user.password)) {
      user.set('password', undefined, { strict: false });

      const token = jwt.sign({ userData: user }, process.env.TOKEN_SECRET, {
        expiresIn: 60 * 60 * 24 * 30,
      });

      const response = {
        status: 'success',
        token: token,
        userData: user.toObject(),
      };

      return res.json(response);
    } else {
      const response = {
        status: 'error',

        code: 2,
        error: 'Invalid Credentials',
      };
      return res.status(401).json(response);
    }
  } catch (error) {
    const response = {
      status: 'error',
      code: 3,
      error: 'Invalid Credentials',
    };
    console.log(error);
    return res.status(401).json(response);
  }
});

//REGISTER
router.post('/register', async (req, res) => {
  try {
    const name = req.body.name;
    const email = req.body.email;
    const password = req.body.password;

    const encryptedPassword = encryptPass(password);

    const newUser = {
      name: name,
      email: email,
      password: encryptedPassword,
    };

    var userValidation = await User.findOne({ email: email });

    if (userValidation !== null) {
      if (userValidation.confirmed == false) {
        //pending confirmation error
        const response = {
          status: 'error',
          code: 1,
          error: 'Pending confirmation',
        };
        return res.status(404).json(response);
      }

      //Usuario existente
      const response = {
        status: 'error',
        code: 2,
        error: 'Usuario existente',
      };
      return res.status(404).json(response);
    }

    var user = await User.create(newUser);

    user.set('password', undefined, { strict: false });
    const token = jwt.sign({ userData: user }, process.env.TOKEN_SECRET, {
      expiresIn: 60 * 60 * 24 * 30,
    });

    const response = {
      status: 'success',
      token: token,
      userData: user.toObject(),
    };

    res.status(200).json(response);
  } catch (error) {
    console.log('ERROR - REGISTER ENDPOINT');
    console.log(error);

    const response = {
      status: 'error',
      error: error,
    };

    return res.status(500).json(response);
  }
});

//EDITAR DATOS
router.post('/edituserdata', checkAuth, async (req, res) => {
  try {
    const name = req.body.name;
    const number = req.body.number;

    const userId = req.userData._id;

    if (number != '') {
      const regexNumeroArgentina = /^(?:(?:\+|00)54|0)\s?(9\d{2})?[-.\s]?(\d{4})[-.\s]?(\d{4})$/;

      if (!regexNumeroArgentina.test(number)) {
        const response = {
          status: 'error',
          code: 0,
          msg: 'invalid number',
        };

        return res.status(404).json(response);
      }

      await User.updateOne({ _id: userId }, { celular: number });
    } else if (name !== '') {
      await User.updateOne({ _id: userId }, { name: name });
    }

    const response = {
      status: 'success',
    };

    res.status(200).json(response);
  } catch (error) {
    console.log('ERROR - REGISTER ENDPOINT');
    console.log(error);

    const response = {
      status: 'error',
      error: error,
    };

    return res.status(500).json(response);
  }
});

//PREGUNTAR PARA BORRAR DATOS
router.delete('/askdeleteuserdata', checkAuth, async (req, res) => {
  try {
    const userData = req.userData;

    try {
      const url = process.env.FRONT_URL + '/deleteuserdata';
    } catch (error) {
      console.log('NodemailerError: ');
      console.error(error);
      const response = {
        status: 'error',
        code: 1,
        error: 'Error en envio de email',
      };
      return res.status(404).json(response);
    }

    const response = {
      status: 'success',
    };

    res.status(200).json(response);
  } catch (error) {
    console.log('ERROR - PREGUNTAR PARA BORRAR DATOS ENDPOINT');
    console.log(error);

    const response = {
      status: 'error',
      error: error,
    };

    return res.status(500).json(response);
  }
});

//DELETE DATOS
router.delete('/deleteuserdata', checkAuth, async (req, res) => {
  try {
    /*
    Borrar:
    devices
    y liberar serial
    GRAFICOS

    mobile datas

    schedule
    calendar

    notifs

  
    
    */

    const response = {
      status: 'success',
    };

    res.status(200).json(response);
  } catch (error) {
    console.log('ERROR - REGISTER ENDPOINT');
    console.log(error);

    const response = {
      status: 'error',
      error: error,
    };

    return res.status(500).json(response);
  }
});

router.post('/recuperarpassword', async (req, res) => {
  try {
    const email = req.body.email;

    var user = await User.findOne({ email: email });

    if (user == null) {
      const response = {
        status: 'error',
        code: 1,
        error: 'User not found',
      };

      return res.status(404).json(response);
    }

    user.set('password', undefined, { strict: false });
    const token = jwt.sign({ userData: user }, process.env.TOKEN_SECRET, {
      expiresIn: 60 * 60 * 24 * 30,
    });

    const url = process.env.FRONT_URL + '/cambiopass?peticion=' + token;

    const response = {
      status: 'success',
    };

    return res.status(200).json(response);
  } catch (error) {
    console.log('Recuperar Password ENDPOINT:');
    console.log(error);

    const response = {
      status: 'error',
      error: error,
    };
    return res.status(500).json(response);
  }
});

router.put('/nuevapassword', async (req, res) => {
  try {
    const token = req.body.token;
    const newPassword = req.body.password;

    let userData;
    const verificacion = jwt.verify(token, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log('ERROR (JWT): ErrorTokenVerification - peticion: ' + token);
        console.log(err.stack);
        console.log(err.inner);
        console.log(err.message);
        console.log(err.name);

        return false;
      }

      userData = decoded.userData;

      return true;
    });

    if (verificacion === false) {
      const response = {
        status: 'error',
        code: 1,
        error: 'ErrorTokenVerification',
      };

      return res.status(404).json(response);
    }

    const encryptedPassword = encryptPass(newPassword);
    var user = await User.updateOne(
      { _id: userData._id },
      { password: encryptedPassword, confirmed: true }
    );

    const response = {
      status: 'success',
    };

    res.status(200).json(response);
  } catch (error) {
    console.log('ERROR - REGISTER ENDPOINT');
    console.log(error);

    const response = {
      status: 'error',
      error: error,
    };

    return res.status(500).json(response);
  }
});

router.put('/cambiopasswordautorizado', checkAuth, async (req, res) => {
  try {
    const passwords = req.body;

    const email = req.userData.email;

    if (passwords.password !== passwords.confirmPassword) {
      const response = {
        status: 'error',
        code: 2,
        error: 'Passwords are not the same',
      };
      return res.status(401).json(response);
    }

    let user = await User.findOne({ email: email });

    //if no email
    if (!user) {
      const response = {
        status: 'error',
        code: 1,
        error: 'Invalid Credentials',
      };
      return res.status(401).json(response);
    }

    if (user.confirmed === false) {
      const response = {
        status: 'error',
        code: 0,
        error: 'Please confirm your email',
      };
      return res.status(404).json(response);
    }

    //if email and email ok
    if (bcrypt.compareSync(passwords.oldPassword, user.password)) {
      const newPassword = encryptPass(passwords.password);

      let userUpdate = await User.updateOne({ email: email }, { password: newPassword });

      if (userUpdate.modifiedCount === 0) {
        console.log('ERROR: Confirming ' + email + ' account.');
        const response = {
          status: 'error',
          code: 5,
          error: 'Error updating password',
        };

        return res.status(404).json(response);
      }

      const response = {
        status: 'success',
      };

      return res.status(200).json(response);
    } else {
      const response = {
        status: 'error',

        code: 3,
        error: 'Invalid Credentials',
      };
      return res.status(401).json(response);
    }
  } catch (error) {
    console.log('ERROR - CAMBIO DE PASS ENDPOINT');
    console.log(error);

    const response = {
      status: 'error',
      code: 4,
      error: error,
    };

    return res.status(500).json(response);
  }
});

router.put('/confirm-email', async (req, res) => {
  try {
    const peticion = req.body.peticion;

    let userData;

    const verificacion = jwt.verify(peticion, process.env.TOKEN_SECRET, (err, decoded) => {
      if (err) {
        console.log('ERROR (JWT): ErrorTokenVerification - peticion: ' + peticion);
        console.log(err.stack);
        console.log(err.inner);
        console.log(err.message);
        console.log(err.name);

        return false;
      }

      userData = decoded.userData;

      return true;
    });

    if (verificacion === false) {
      const response = {
        status: 'error',
        code: 1,
        error: 'ErrorTokenVerification',
      };

      return res.status(404).json(response);
    }

    const email = userData.email;

    let user = await User.findOne({ email: email });

    if (user.confirmed === false) {
      let userUpdate = await User.updateOne({ email: email }, { confirmed: true });

      if (userUpdate.modifiedCount === 0) {
        console.log('ERROR: Confirming ' + email + ' account.');
        const response = {
          status: 'error',
          code: 2,
          error: 'Error on confirming account',
        };

        return res.status(404).json(response);
      }
    }

    user.set('password', undefined, { strict: false });

    const token = jwt.sign({ userData: user }, process.env.TOKEN_SECRET, {
      expiresIn: 60 * 60 * 24 * 30,
    });

    user.set('isAdmin', undefined, { strict: false });

    const response = {
      status: 'success',
      token: token,
      userData: user,
    };

    res.status(200).json(response);
  } catch (error) {
    console.log('ERROR - Confirm password ENDPOINT ');
    console.log(error);

    const response = {
      status: 'error',
      error: error,
    };

    return res.status(500).json(response);
  }
});

//**********************
//**** FUNCTIONS *******
//**********************

function encryptPass(newPassword) {
  return bcrypt.hashSync(newPassword, 10);
}

// CONFIRM EMAIL CHANGE
router.post('/confirm-email-change', async (req, res) => {
  try {
    const { token } = req.body;

    if (!token) {
      return res.status(400).json({
        status: 'error',
        code: 1,
        message: 'Token de confirmación requerido',
      });
    }

    // Verificar token
    let tokenData;
    try {
      tokenData = jwt.verify(token, process.env.TOKEN_SECRET);
    } catch (jwtError) {
      return res.status(400).json({
        status: 'error',
        code: 2,
        message: 'Token inválido o expirado',
      });
    }

    // Verificar que sea un token de cambio de email
    if (tokenData.type !== 'email_change') {
      return res.status(400).json({
        status: 'error',
        code: 3,
        message: 'Token inválido para cambio de email',
      });
    }

    // Buscar usuario
    const user = await User.findById(tokenData.userId);
    if (!user) {
      return res.status(404).json({
        status: 'error',
        code: 4,
        message: 'Usuario no encontrado',
      });
    }

    // Verificar que el token corresponda al pendiente
    if (!user.pendingEmailChange || user.pendingEmailChange.token !== token) {
      return res.status(400).json({
        status: 'error',
        code: 5,
        message: 'Token de cambio de email no válido o ya utilizado',
      });
    }

    // Verificar que el email no haya sido tomado por otro usuario mientras tanto
    const existingUser = await User.findOne({
      email: tokenData.newEmail,
      _id: { $ne: tokenData.userId },
    });

    if (existingUser) {
      return res.status(400).json({
        status: 'error',
        code: 6,
        message: 'Este email ya está en uso por otro usuario',
      });
    }

    // Actualizar email y limpiar datos pendientes
    await User.updateOne(
      { _id: tokenData.userId },
      {
        $set: {
          email: tokenData.newEmail,
          confirmed: true, // Confirmar la cuenta si no estaba confirmada
        },
        $unset: {
          pendingEmailChange: 1, // Eliminar los datos pendientes
        },
      }
    );

    // // Enviar email de confirmación al email anterior
    // try {
    //   await transporter.sendMail({
    //     from: '"Confi Plant 🌱" <viajar@gmail.com>',
    //     to: user.email, // Email anterior
    //     subject: "Email cambiado exitosamente - ConfiPlant ✔",
    //     text: `Hola ${
    //       user.name || "Usuario"
    //     }, tu email ha sido cambiado exitosamente a ${
    //       tokenData.newEmail
    //     }. Si no fuiste tú, contacta inmediatamente con soporte.`,
    //     html: `
    //       <h2>Email cambiado exitosamente</h2>
    //       <p>Hola ${user.name || "Usuario"},</p>
    //       <p>Tu email ha sido cambiado exitosamente a <strong>${
    //         tokenData.newEmail
    //       }</strong>.</p>
    //       <p>Si no fuiste tú quien realizó este cambio, contacta inmediatamente con nuestro soporte.</p>
    //       <p>Saludos,<br>Equipo ConfiPlant 🌱</p>
    //     `,
    //   });
    // } catch (emailError) {
    //   console.error(
    //     "Error enviando confirmación al email anterior:",
    //     emailError
    //   );
    // }

    res.status(200).json({
      status: 'success',
      message: 'Email actualizado correctamente',
      newEmail: tokenData.newEmail,
    });
  } catch (error) {
    console.error('Error confirming email change:', error);
    res.status(500).json({
      status: 'error',
      code: 7,
      message: 'Error interno del servidor',
    });
  }
});

// GET USER PROFILE INFO
router.get('/profile', checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;

    const user = await User.findById(userId).select('-password');
    if (!user) {
      return res.status(404).json({
        status: 'error',
        code: 1,
        message: 'Usuario no encontrado',
      });
    }

    // Obtener información de subscripción
    let subscription = await Subscription.getActiveSubscription(userId);

    if (!subscription) {
      subscription = {
        plan: 'free',
        status: 'active',
        limits: { devices: 1, notifications: 100 },
      };
    }

    const response = {
      status: 'success',
      data: {
        id: user._id,
        name: user.name,
        email: user.email,
        celular: user.celular,
        confirmed: user.confirmed,
        createdAt: user.createdAt,
        plan: subscription.plan,
        planStatus: subscription.status,
        planLimits: subscription.limits,
        planEndDate: subscription.endDate,
        planDaysRemaining: subscription.getDaysRemaining ? subscription.getDaysRemaining() : null,
        hasPendingEmailChange: !!user.pendingEmailChange,
        pendingEmail: user.pendingEmailChange?.newEmail || null,
      },
    };

    res.status(200).json(response);
  } catch (error) {
    console.error('Error getting user profile:', error);
    res.status(500).json({
      status: 'error',
      code: 2,
      message: 'Error interno del servidor',
    });
  }
});

// CANCEL PENDING EMAIL CHANGE
router.delete('/cancel-email-change', checkAuth, async (req, res) => {
  try {
    const userId = req.userData._id;

    const result = await User.updateOne({ _id: userId }, { $unset: { pendingEmailChange: 1 } });

    if (result.modifiedCount === 0) {
      return res.status(404).json({
        status: 'error',
        code: 1,
        message: 'No hay cambio de email pendiente',
      });
    }

    res.status(200).json({
      status: 'success',
      message: 'Cambio de email cancelado',
    });
  } catch (error) {
    console.error('Error canceling email change:', error);
    res.status(500).json({
      status: 'error',
      code: 2,
      message: 'Error interno del servidor',
    });
  }
});

function makeid(length) {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() * charactersLength));
  }
  return result;
}

module.exports = router;
