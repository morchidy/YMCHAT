const express = require('express');
const router = express.Router();
const {
  getMyGroups,
  getGroupsMember,
  createGroup,
  deleteGroup,
  addUserToGroup,
  removeUserFromGroup,
  getGroupMembers,
} = require('../controllers/groups');
const { 
  verifieTokenPresent, 
  verifieProprietaireGroupe, 
  verifieMembreGroupe, 
  verifieAccesGroupMembers
} = require('../middleware/auth');

// Lister les groupes créés par l'utilisateur
router.get('/api/mygroups', verifieTokenPresent, getMyGroups);

// Lister les groupes dont l'utilisateur est membre
router.get('/api/groupsmember', verifieTokenPresent, getGroupsMember);

// Supprimer un groupe (réservé au propriétaire)
router.delete('/api/mygroups/:gid', verifieTokenPresent, verifieProprietaireGroupe, deleteGroup);

// Ajouter un utilisateur à un groupe (réservé au propriétaire)
router.post('/api/mygroups/:gid/:uid', verifieTokenPresent, verifieProprietaireGroupe, addUserToGroup);

// Supprimer un utilisateur d'un groupe (réservé au propriétaire)
router.delete('/api/mygroups/:gid/:uid', verifieTokenPresent, verifieProprietaireGroupe, removeUserFromGroup);

// Lister les membres d'un groupe (accessible par le propriétaire, les membres et les admins)
router.get('/api/mygroups/:gid', verifieTokenPresent, verifieAccesGroupMembers, getGroupMembers);

// Créer un groupe
router.post('/api/mygroups', verifieTokenPresent, createGroup);

module.exports = router;