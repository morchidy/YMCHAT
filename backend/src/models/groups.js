const Sequelize = require('sequelize');
const db = require('./database.js');
const users = require('./users.js'); // Importer le modèle User

// Définir le modèle Group
const groups = db.define('groups', {
    id: {
      primaryKey: true,
      type: Sequelize.INTEGER,
      autoIncrement: true,
    },
    name: {
      type: Sequelize.STRING(128),
      allowNull: false,
      validate: {
        len: [1, 128], // Le nom doit avoir entre 1 et 128 caractères
      },
    },
    ownerId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: users, // Référence au modèle User
        key: 'id',
      },
      onDelete: 'CASCADE', // Si le propriétaire est supprimé, le groupe est supprimé
    },
  }, { timestamps: false });
  
  // Définir les relations entre les modèles
  groups.belongsTo(users, { foreignKey: 'ownerId', as: 'owner' }); // Un groupe appartient à un utilisateur (propriétaire)
  users.hasMany(groups, { foreignKey: 'ownerId', as: 'ownedGroups' }); // Un utilisateur peut posséder plusieurs groupes
  
  
  // Table intermédiaire pour la relation "many-to-many" entre users et groups
const groupMembers = db.define('group_members', {
    groupId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: groups,
        key: 'id',
      },
      onDelete: 'CASCADE', // Si un groupe est supprimé, ses membres sont supprimés
    },
    userId: {
      type: Sequelize.INTEGER,
      allowNull: false,
      references: {
        model: users,
        key: 'id',
      },
      onDelete: 'CASCADE', // Si un utilisateur est supprimé, ses relations avec les groupes sont supprimées
    },
  }, { timestamps: false });
  
  // Définir les relations "many-to-many"
  groups.belongsToMany(users, { through: groupMembers, foreignKey: 'groupId', as: 'members' });
  users.belongsToMany(groups, { through: groupMembers, foreignKey: 'userId', as: 'memberGroups' });
  
  module.exports = { groups, groupMembers };