const messages = require('../models/messages.js');
const { groups, groupMembers } = require('../models/groups.js');
const status = require('http-status');

// Récupérer tous les messages d'un groupe
async function getGroupMessages(req, res) {
  // #swagger.tags = ['Messages']
  // #swagger.summary = 'Récupérer tous les messages d\'un groupe'
  // #swagger.description = 'Récupère tous les messages postés dans un groupe spécifique. L\'utilisateur doit être membre du groupe.'
  // #swagger.parameters['gid'] = { description: 'ID du groupe' }
  // #swagger.security = [{ "apiKeyAuth": [] }]
  // #swagger.responses[200] = { description: 'Messages récupérés avec succès' }
  // #swagger.responses[403] = { description: 'Accès interdit (non membre du groupe)' }
  try {
    const groupId = req.params.gid;
    const userId = req.login.id;
    
    // Vérifier si l'utilisateur est membre du groupe (déjà vérifié par middleware)
    const groupMessages = await messages.findAll({
      where: { groupId },
      order: [['createdAt', 'DESC']]
    });
    
    res.json({
      status: true,
      message: 'Messages retrieved successfully',
      data: groupMessages
    });
  } catch (error) {
    console.error('Error in getGroupMessages:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}

// Poster un message dans un groupe
async function postMessage(req, res) {
  // #swagger.tags = ['Messages']
  // #swagger.summary = 'Poster un message dans un groupe'
  // #swagger.description = 'Ajoute un nouveau message dans un groupe spécifique. L\'utilisateur doit être membre du groupe.'
  // #swagger.parameters['gid'] = { description: 'ID du groupe' }
  // #swagger.parameters['obj'] = { in: 'body', description: 'Contenu du message', schema: { $content: 'Contenu du message' } }
  // #swagger.security = [{ "apiKeyAuth": [] }]
  // #swagger.responses[201] = { description: 'Message créé avec succès' }
  // #swagger.responses[400] = { description: 'Contenu manquant' }
  // #swagger.responses[403] = { description: 'Accès interdit (non membre du groupe)' }
  try {
    if (!req.body.content) {
      return res.status(400).json({ status: false, message: 'Content is required' });
    }
    
    const groupId = req.params.gid;
    const userId = req.login.id;
    const { content } = req.body;
    
    // Créer le message
    const newMessage = await messages.create({
      content,
      userId,
      groupId
    });
    
    res.status(201).json({
      status: true,
      message: 'Message posted successfully',
      data: newMessage
    });
  } catch (error) {
    console.error('Error in postMessage:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}

module.exports = {
  getGroupMessages,
  postMessage
};