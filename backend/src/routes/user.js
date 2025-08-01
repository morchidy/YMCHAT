const express = require('express')
const router = express.Router()
const user = require('../controllers/user.js')
const { verifieTokenPresent, verifieAdmin } = require('../middleware/auth'); // Import des middleware

// Route pour l'inscription
router.post('/register', user.register);

// Route pour lister les utilisateurs (protégée par un token)
router.get('/api/users', verifieTokenPresent, user.getUsers)

router.post('/api/users', user.newUser)

// Route pour mettre à jour un utilisateur (réservée aux administrateurs)
router.put('/api/users/:id', verifieTokenPresent, user.updateUser);

// Route pour supprimer un utilisateur (accessible uniquement aux administrateurs)
router.delete('/api/users/:id', verifieTokenPresent, verifieAdmin, user.deleteUser)

router.post('/login', user.login)

// Route pour changer le mot de passe de l'utilisateur connecté
router.put('/api/password', verifieTokenPresent, user.updatePassword);

module.exports = router
