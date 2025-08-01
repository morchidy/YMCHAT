const jws = require('jws');
require('mandatoryenv').load(['TOKENSECRET']);
const userModel = require('../models/users.js'); // Importer le modèle User
const { groups, groupMembers } = require('../models/groups.js'); // Importer les modèles Group et GroupMember
const { TOKENSECRET } = process.env;

function verifieTokenPresent(req, res, next) {
  // Vérifier la présence du token dans l'en-tête
  if (!req.headers || !req.headers.hasOwnProperty('x-access-token')) {
    return res.status(403).json({ status: false, message: 'Token missing' });
  }

  const token = req.headers['x-access-token'];

  // Vérifier la validité du token
  if (!jws.verify(token, 'HS256', TOKENSECRET)) {
    return res.status(403).json({ status: false, message: 'Token invalid' });
  }

  // Décoder le payload du token
  const decodedPayload = jws.decode(token).payload;

  // Convertir le payload en objet si nécessaire
  req.login = typeof decodedPayload === 'string' ? JSON.parse(decodedPayload) : decodedPayload;

  // Passer au middleware suivant
  next();
}

// function verifieAdmin(req, res, next) {

//   // Vérifier si le token est valide et si l'utilisateur est un administrateur
//   if (!req.login) {
//     return res.status(UNAUTHORIZED).json({ status: false, message: 'Unauthorized' });
//   }

//   const adminUser = userModel.findOne({ where: { email: req.login } });
//   if (!adminUser || !adminUser.isAdmin) {
//     return res.status(403).json({ status: false, message: 'Forbidden' });
//   }

//   // Passer au middleware suivant
//   next();
// }


// async function verifieAdmin(req, res, next) {
//   try {
//     // Vérifier si le token est valide
//     if (!req.login) {
//       return res.status(401).json({ status: false, message: 'Unauthorized' });
//     }

//     // Rechercher l'utilisateur dans la base de données
//     const adminUser = await userModel.findOne({ where: { email: req.login } });

//     // Vérifier si l'utilisateur est un administrateur
//     if (!adminUser || !adminUser.isAdmin) {
//       return res.status(403).json({ status: false, message: 'Forbidden' });
//     }

//     // Passer au middleware suivant
//     next();
//   } catch (error) {
//     // Gérer les erreurs (par exemple, problème de base de données)
//     console.error('Erreur dans verifieAdmin:', error);
//     res.status(500).json({ status: false, message: 'Internal Server Error' });
//   }
// }

function verifieAdmin(req, res, next) {
  try {
    // Vérifier si le token est valide
    if (!req.login) {
      return res.status(401).json({ status: false, message: 'Unauthorized' });
    }

    // Vérifier si l'utilisateur est un administrateur
    if (!req.login.isAdmin) {
      return res.status(403).json({ status: false, message: 'Forbidden: Not an admin' });
    }

    // Passer au middleware suivant
    next();
  } catch (error) {
    console.error('Erreur dans verifieAdmin:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}


async function verifieProprietaireGroupe(req, res, next) {
  try {
    const groupId = req.params.gid; // Récupérer l'ID du groupe depuis les paramètres
    const group = await groups.findOne({ where: { id: groupId } });

    if (!group) {
      return res.status(404).json({ status: false, message: 'Group not found' });
    }

    if (group.ownerId !== req.login.id) {
      return res.status(403).json({ status: false, message: 'Forbidden: Not the owner of the group' });
    }

    next();
  } catch (error) {
    console.error('Erreur dans verifieProprietaireGroupe:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}

async function verifieMembreGroupe(req, res, next) {
  try {
    const groupId = req.params.gid; // Récupérer l'ID du groupe depuis les paramètres
    const userId = req.login.id; // Récupérer l'ID de l'utilisateur depuis le token

    const membership = await groupMembers.findOne({ where: { groupId, userId } });

    if (!membership) {
      return res.status(403).json({ status: false, message: 'Forbidden: Not a member of the group' });
    }

    next();
  } catch (error) {
    console.error('Erreur dans verifieMembreGroupe:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}

// Middleware : Vérifie que l'utilisateur est le propriétaire d'un groupe
// async function verifieProprietaireGroupe(req, res, next) {
//   try {
//     const groupId = req.params.gid; // Récupérer l'ID du groupe depuis les paramètres
//     const group = await groups.findOne({ where: { id: groupId } });

//     if (!group) {
//       return res.status(404).json({ status: false, message: 'Group not found' });
//     }

//     if (group.ownerId !== req.login.id) {
//       return res.status(403).json({ status: false, message: 'Forbidden: Not the owner of the group' });
//     }

//     next();
//   } catch (error) {
//     console.error('Erreur dans verifieProprietaireGroupe:', error);
//     res.status(500).json({ status: false, message: 'Internal Server Error' });
//   }
// }

// // Middleware : Vérifie que l'utilisateur est membre d'un groupe
// async function verifieMembreGroupe(req, res, next) {
//   try {
//     const groupId = req.params.gid; // Récupérer l'ID du groupe depuis les paramètres
//     const userId = req.login.id; // Récupérer l'ID de l'utilisateur depuis le token

//     const membership = await groupMembers.findOne({ where: { groupId, userId } });

//     if (!membership) {
//       return res.status(403).json({ status: false, message: 'Forbidden: Not a member of the group' });
//     }

//     next();
//   } catch (error) {
//     console.error('Erreur dans verifieMembreGroupe:', error);
//     res.status(500).json({ status: false, message: 'Internal Server Error' });
//   }
// }


//Middleware de vérification d'accès:
//L'accès aux membres d'un groupe devrait être restreint au propriétaire, aux membres du groupe et aux administrateurs.
async function verifieAccesGroupMembers(req, res, next) {
  try {
    const groupId = req.params.gid;
    const userId = req.login.id;
    
    // Vérifier si l'utilisateur est un administrateur
    if (req.login.isAdmin) {
      return next();
    }
    
    // Vérifier si l'utilisateur est le propriétaire du groupe
    const group = await groups.findByPk(groupId);
    if (!group) {
      return res.status(404).json({ status: false, message: 'Group not found' });
    }
    
    if (group.ownerId === userId) {
      return next();
    }
    
    // Vérifier si l'utilisateur est membre du groupe
    const membership = await groupMembers.findOne({ where: { groupId, userId } });
    if (membership) {
      return next();
    }
    
    // Si aucune des conditions n'est remplie, refuser l'accès
    return res.status(403).json({ status: false, message: 'Forbidden: Not authorized to view group members' });
  } catch (error) {
    console.error('Erreur dans verifieAccesGroupMembers:', error);
    res.status(500).json({ status: false, message: 'Internal Server Error' });
  }
}

module.exports = { 
  verifieTokenPresent, 
  verifieAdmin, 
  verifieProprietaireGroupe, 
  verifieMembreGroupe,
  verifieAccesGroupMembers,
};
