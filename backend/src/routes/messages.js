const express = require('express');
const router = express.Router();
const { getGroupMessages, postMessage } = require('../controllers/messages.js');
const { verifieTokenPresent, verifieMembreGroupe } = require('../middleware/auth.js');

// Récupérer tous les messages d'un groupe (membre uniquement)
router.get('/api/messages/:gid', verifieTokenPresent, verifieMembreGroupe, getGroupMessages);

// Poster un message dans un groupe (membre uniquement)
router.post('/api/messages/:gid', verifieTokenPresent, verifieMembreGroupe, postMessage);

module.exports = router;