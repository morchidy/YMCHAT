const userModel = require('../models/users.js')
const bcrypt = require('bcrypt');

// Ajouter ici les nouveaux require des nouveaux modèles
const { groups, groupMembers } = require('../models/groups.js');
const messages = require('../models/messages.js');

// eslint-disable-next-line no-unexpected-multiline
(async () => {
  // Regénère la base de données
  await require('../models/database.js').sync({ force: true })
  console.log('Base de données créée.')

  // Initialise la base avec quelques données
  const passhash = await bcrypt.hash('123456', 2)
  console.log(passhash)
  await userModel.create({
    name: 'Sebastien Viardot', email: 'Sebastien.Viardot@grenoble-inp.fr', passhash
  })

  // Ajouter ici le code permettant d'initialiser par défaut la base de donnée

  // Créer un utilisateur admin
  const adminPasshash = await bcrypt.hash('admin123', 2);
  const adminUser = await userModel.create({
    name: 'Admin User',
    email: 'admin@example.com',
    passhash: adminPasshash,
    isAdmin: true, // Cet utilisateur est un administrateur
  });

  // Créer un utilisateur normal
  const userPasshash = await bcrypt.hash('user123', 2);
  const normalUser = await userModel.create({
    name: 'Normal User',
    email: 'user@example.com',
    passhash: userPasshash,
  });

  // Créer un groupe appartenant à l'utilisateur admin
  const group1 = await groups.create({
    name: 'Admin Group',
    ownerId: adminUser.id, // L'utilisateur admin est le propriétaire
  });

  // Créer un groupe appartenant à l'utilisateur normal
  const group2 = await groups.create({
    name: 'User Group',
    ownerId: normalUser.id, // L'utilisateur normal est le propriétaire
  });

  // Ajouter des membres aux groupes
  await groupMembers.create({
    groupId: group1.id,
    userId: adminUser.id, // L'admin est membre de son propre groupe
  });

  await groupMembers.create({
    groupId: group1.id,
    userId: normalUser.id, // L'utilisateur normal est membre du groupe de l'admin
  });

  await groupMembers.create({
    groupId: group2.id,
    userId: normalUser.id, // L'utilisateur normal est membre de son propre groupe
  });

  // Créer des messages de test
  await messages.create({
    content: 'Premier message de test',
    userId: adminUser.id,
    groupId: group1.id
  });

  await messages.create({
    content: 'Deuxième message de test',
    userId: normalUser.id,
    groupId: group1.id
  });

  console.log('Base de données initialisée avec des données par défaut.');
  process.exit();
})()
