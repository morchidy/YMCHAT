const { groups, groupMembers } = require('../models/groups');
const userModel = require('../models/users');
const Group = require('../models/groups').groups; // Alias pour la cohérence
const status = require('http-status');

// Lister les groupes créés par l'utilisateur
async function getMyGroups(req, res) {
  // #swagger.tags = ['Groups']
  // #swagger.summary = 'Lister les groupes créés par l\'utilisateur'
  // #swagger.description = 'Récupère tous les groupes dont l\'utilisateur connecté est propriétaire.'
  // #swagger.security = [{ "apiKeyAuth": [] }]
  // #swagger.responses[200] = { description: 'Groupes récupérés avec succès' }
  try {
    const userId = req.login.id; // ID de l'utilisateur connecté
    const userGroups = await groups.findAll({ where: { ownerId: userId } });
    res.json({ status: true, message: 'Groups retrieved successfully', data: userGroups });
  } catch (error) {
    console.error('Erreur dans getMyGroups:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}

// Lister les groupes dont l'utilisateur est membre
async function getGroupsMember(req, res) {
  // #swagger.tags = ['Groups']
  // #swagger.summary = 'Lister les groupes dont l\'utilisateur est membre'
  // #swagger.description = 'Récupère tous les groupes dont l\'utilisateur connecté est membre.'
  // #swagger.security = [{ "apiKeyAuth": [] }]
  // #swagger.responses[200] = { description: 'Groupes récupérés avec succès' }
  try {
    const userId = req.login.id; // ID de l'utilisateur connecté
    
    // Utiliser include pour joindre les informations du groupe
    const memberGroups = await userModel.findByPk(userId, {
      include: [{
        model: groups,
        as: 'memberGroups',
        through: { attributes: [] } // Ne pas inclure les attributs de la table de jointure
      }]
    });
    
    if (!memberGroups) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }
    
    res.json({ 
      status: true, 
      message: 'Groups retrieved successfully', 
      data: memberGroups.memberGroups 
    });
  } catch (error) {
    console.error('Erreur dans getGroupsMember:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}

// Supprimer un groupe
async function deleteGroup(req, res) {
  // #swagger.tags = ['Groups']
  // #swagger.summary = 'Supprimer un groupe'
  // #swagger.description = 'Supprime un groupe dont l\'utilisateur connecté est propriétaire.'
  // #swagger.parameters['gid'] = { description: 'ID du groupe à supprimer' }
  // #swagger.security = [{ "apiKeyAuth": [] }]
  // #swagger.responses[200] = { description: 'Groupe supprimé avec succès' }
  // #swagger.responses[404] = { description: 'Groupe non trouvé' }
  // #swagger.responses[403] = { description: 'Non autorisé (pas propriétaire)' }
  try {
    const groupId = req.params.gid; // ID du groupe à supprimer
    
    // Vérifier si le groupe existe
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ status: false, message: 'Groupe non trouvé' });
    }
    
    // Supprimer le groupe
    await group.destroy();
    res.status(200).json({ status: true, message: 'Groupe supprimé avec succès' });
  } catch (error) {
    console.error('Erreur dans deleteGroup:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}

// Ajouter un utilisateur à un groupe
async function addUserToGroup(req, res) {
  // #swagger.tags = ['Groups']
  // #swagger.summary = 'Ajouter un utilisateur à un groupe'
  // #swagger.description = 'Ajoute un utilisateur dans un groupe. L\'utilisateur connecté doit être propriétaire du groupe.'
  // #swagger.parameters['gid'] = { description: 'ID du groupe' }
  // #swagger.parameters['uid'] = { description: 'ID de l\'utilisateur à ajouter' }
  // #swagger.security = [{ "apiKeyAuth": [] }]
  // #swagger.responses[200] = { description: 'Utilisateur ajouté avec succès' }
  // #swagger.responses[404] = { description: 'Utilisateur ou groupe non trouvé' }
  // #swagger.responses[403] = { description: 'Non autorisé (pas propriétaire)' }
  try {
    const groupId = req.params.gid; // ID du groupe
    const userId = req.params.uid; // ID de l'utilisateur à ajouter

    // Vérifier si l'utilisateur existe
    const user = await userModel.findOne({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ status: false, message: 'User not found' });
    }

    // Ajouter l'utilisateur au groupe
    await groupMembers.create({ groupId, userId });
    res.json({ status: true, message: 'User added to group successfully' });
  } catch (error) {
    console.error('Erreur dans addUserToGroup:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}

// Supprimer un utilisateur d'un groupe
async function removeUserFromGroup(req, res) {
  // #swagger.tags = ['Groups']
  // #swagger.summary = 'Supprimer un utilisateur d\'un groupe'
  // #swagger.description = 'Supprime un utilisateur d\'un groupe. L\'utilisateur connecté doit être propriétaire du groupe.'
  // #swagger.parameters['gid'] = { description: 'ID du groupe' }
  // #swagger.parameters['uid'] = { description: 'ID de l\'utilisateur à supprimer' }
  // #swagger.security = [{ "apiKeyAuth": [] }]
  // #swagger.responses[200] = { description: 'Utilisateur supprimé avec succès' }
  // #swagger.responses[404] = { description: 'Groupe non trouvé' }
  // #swagger.responses[403] = { description: 'Non autorisé (pas propriétaire)' }
  try {
    const groupId = req.params.gid; // ID du groupe
    const userId = req.params.uid; // ID de l'utilisateur à supprimer

    // Supprimer l'utilisateur du groupe
    await groupMembers.destroy({ where: { groupId, userId } });
    res.json({ status: true, message: 'User removed from group successfully' });
  } catch (error) {
    console.error('Erreur dans removeUserFromGroup:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}

// Lister les membres d'un groupe
async function getGroupMembers(req, res) {
  // #swagger.tags = ['Groups']
  // #swagger.summary = 'Lister les membres d\'un groupe'
  // #swagger.description = 'Récupère tous les membres d\'un groupe spécifique. Accessible par le propriétaire, les membres du groupe et les administrateurs.'
  // #swagger.parameters['gid'] = { description: 'ID du groupe' }
  // #swagger.security = [{ "apiKeyAuth": [] }]
  // #swagger.responses[200] = { description: 'Membres récupérés avec succès' }
  // #swagger.responses[404] = { description: 'Groupe non trouvé' }
  // #swagger.responses[403] = { description: 'Non autorisé' }
  try {
    const groupId = req.params.gid; // ID du groupe
    
    // Vérifier si le groupe existe
    const group = await Group.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ status: false, message: 'Groupe non trouvé' });
    }
    
    // Récupérer les membres du groupe en utilisant la relation many-to-many définie dans models/groups.js
    const groupWithMembers = await Group.findByPk(groupId, {
      include: [{
        model: userModel,
        as: 'members',
        attributes: ['id', 'name', 'email'], // Seulement ces attributs
        through: { attributes: [] } // Ne pas inclure les attributs de la table de jointure
      }]
    });
    
    if (!groupWithMembers) {
      return res.status(404).json({ status: false, message: 'Groupe non trouvé' });
    }
    
    res.status(200).json({ 
      status: true, 
      message: 'Membres du groupe récupérés avec succès', 
      data: groupWithMembers.members
    });
  } catch (error) {
    console.error('Erreur dans getGroupMembers:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}

// Créer un groupe
async function createGroup(req, res) {
  // #swagger.tags = ['Groups']
  // #swagger.summary = 'Créer un groupe'
  // #swagger.description = 'Crée un nouveau groupe avec l\'utilisateur connecté comme propriétaire.'
  // #swagger.parameters['obj'] = { in: 'body', description: 'Nom du groupe', schema: { $name: 'Nom du groupe' } }
  // #swagger.security = [{ "apiKeyAuth": [] }]
  // #swagger.responses[201] = { description: 'Groupe créé avec succès' }
  // #swagger.responses[400] = { description: 'Nom du groupe manquant' }
  // #swagger.responses[409] = { description: 'Un groupe avec ce nom existe déjà' }
  try {
    if (!req.body.name) {
      return res.status(400).json({ status: false, message: 'Group name is required' });
    }
    
    const { name } = req.body;
    const ownerId = req.login.id;
    
    // Vérifier si un groupe avec ce nom existe déjà
    const existingGroup = await groups.findOne({ where: { name } });
    if (existingGroup) {
      return res.status(409).json({ status: false, message: 'A group with this name already exists' });
    }
    
    // Créer le groupe
    const newGroup = await groups.create({ name, ownerId });
    
    // Ajouter automatiquement le créateur comme membre du groupe
    await groupMembers.create({ groupId: newGroup.id, userId: ownerId });
    
    res.status(201).json({
      status: true,
      message: 'Group created successfully',
      data: newGroup
    });
  } catch (error) {
    console.error('Error in createGroup:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}



module.exports = {
  getMyGroups,
  getGroupsMember,
  createGroup,
  deleteGroup,
  addUserToGroup,
  removeUserFromGroup,
  getGroupMembers
};