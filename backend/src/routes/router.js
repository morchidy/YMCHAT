const router = require('express').Router()
router.use(require('./user')); // Routes pour les utilisateurs
router.use(require('./groups')); // Routes pour les groupes
router.use(require('./messages')); // Routes pour les messages
module.exports = router
