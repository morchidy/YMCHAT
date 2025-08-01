const status = require('http-status')
const userModel = require('../models/users.js')
const has = require('has-keys')
const CodeError = require('../util/CodeError.js')
const bcrypt = require('bcrypt')
const jws = require('jws')
require('mandatoryenv').load(['TOKENSECRET'])
const { TOKENSECRET } = process.env

function validPassword (password) {
  return /^(?=.*[\d])(?=.*[A-Z])(?=.*[a-z])(?=.*[!@#$%^&*])[\w!@#$%^&*]{8,}$/.test(password)
}

module.exports = {
  async login (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Verify credentials of user using email and password and return token'
    // #swagger.parameters['obj'] = { in: 'body', schema: { $email: 'John.Doe@acme.com', $password: '12345'}}
    if (!has(req.body, ['email', 'password'])) throw new CodeError('You must specify the email and password', status.BAD_REQUEST)
    const { email, password } = req.body
    const user = await userModel.findOne({ where: { email } })
    if (user) {
      if (await bcrypt.compare(password, user.passhash)) {
        const token = jws.sign({
          header: { alg: 'HS256' },
          payload: {
            id: user.id,       // ID de l'utilisateur
            name: user.name,   // Nom de l'utilisateur
            email: user.email, // Email de l'utilisateur
            isAdmin: user.isAdmin, // Statut administrateur
          },
          secret: TOKENSECRET,
        });
        res.json({ status: true, message: 'Login/Password ok', token })
        return
      }
    }
    res.status(status.FORBIDDEN).json({ status: false, message: 'Wrong email/password' })
  },
  async newUser (req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'New User'
    // #swagger.parameters['obj'] = { in: 'body', description:'Name and email', schema: { $name: 'John Doe', $email: 'John.Doe@acme.com', $password: '1m02P@SsF0rt!'}}
    if (!has(req.body, ['name', 'email', 'password'])) throw new CodeError('You must specify the name and email', status.BAD_REQUEST)
    const { name, email, password } = req.body
    console.log(req.body)
    if (!validPassword(password)) throw new CodeError('Weak password!', status.BAD_REQUEST)
    await userModel.create({ name, email, passhash: await bcrypt.hash(password, 2) })
    res.json({ status: true, message: 'User Added' })
  },

  async register(req, res) {
  // #swagger.tags = ['Users']
  // #swagger.summary = 'Register a new user'
  // #swagger.parameters['obj'] = { in: 'body', description:'Name, email and password', schema: { $name: 'John Doe', $email: 'John.Doe@acme.com', $password: '1m02P@SsF0rt!'}}
  
  if (!has(req.body, ['name', 'email', 'password'])) {
    return res.status(status.BAD_REQUEST).json({ 
      status: false, 
      message: 'You must specify the name, email and password' 
    });
  }
  
  const { name, email, password } = req.body;
  
  // Vérifier si l'email existe déjà
  const existingUser = await userModel.findOne({ where: { email } });
  if (existingUser) {
    return res.status(status.CONFLICT).json({ 
      status: false, 
      message: 'Email already exists' 
    });
  }
  
  // Vérifier la force du mot de passe
  if (!validPassword(password)) {
    return res.status(status.BAD_REQUEST).json({ 
      status: false, 
      message: 'Weak password! Password must contain at least 8 characters, including uppercase, lowercase, number and special character'
    });
  }
  
  // Créer l'utilisateur
  await userModel.create({ 
    name, 
    email, 
    passhash: await bcrypt.hash(password, 10),
    isAdmin: false // Par défaut, l'utilisateur n'est pas admin
  });
  
  res.status(status.CREATED).json({ 
    status: true, 
    message: 'User registered successfully' 
  });
  },

  async getUsers (req, res) {
    // TODO : verify if the token is valid...
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Get All users'
    const data = await userModel.findAll({ attributes: ['id', 'name', 'email', 'isAdmin'] })
    res.json({ status: true, message: 'Returning users', data })
  },
  async updateUser (req, res) {
    // TODO : verify if the token is valid and correspond to an admin
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Mettre à jour les informations de l utilisateur (réservé à un utilisateur administrateur)'
    // #swagger.parameters['obj'] = { in: 'body', schema: { $name: 'John Doe', $email: 'John.Doe@acme.com', $password: '1m02P@SsF0rt!' }}

    // Vérifier les champs à mettre à jour
    const userModified = {}
    for (const field of ['name', 'email', 'password']) {
      if (has(req.body, field)) {
        if (field === 'password') {
          userModified.passhash = await bcrypt.hash(req.body.password, 2)
        } else {
          userModified[field] = req.body[field]
        }
      }
    }
    if (Object.keys(userModified).length === 0) throw new CodeError('You must specify the name, email or password', status.BAD_REQUEST)

    // Mettre à jour l'utilisateur
    await userModel.update(userModified, { where: { id: req.params.id } })
    res.json({ status: true, message: 'User updated' })
  },


  async updatePassword(req, res) {
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Mettre à jour le mot de passe de l\'utilisateur connecté'
    // #swagger.description = 'Permet à l\'utilisateur connecté de modifier son mot de passe.'
    // #swagger.parameters['obj'] = { in: 'body', description: 'Nouveau mot de passe', schema: { $password: 'Nouveau mot de passe' } }
    // #swagger.security = [{ "apiKeyAuth": [] }]
    // #swagger.responses[200] = { description: 'Mot de passe mis à jour avec succès' }
    // #swagger.responses[400] = { description: 'Mot de passe invalide ou manquant' }
    // #swagger.responses[401] = { description: 'Non authentifié' }
    // Vérifier si le token est valide (req.login contient l'email grâce au middleware verifieTokenPresent)
    if (!req.login) {
      return res.status(status.UNAUTHORIZED).json({ status: false, message: 'Unauthorized' });
    }
  
    // Vérifier si le nouveau mot de passe est fourni
    if (!has(req.body, 'password')) {
      throw new CodeError('You must specify the new password', status.BAD_REQUEST);
    }
  
    const { password } = req.body;
  
    // Vérifier la force du mot de passe
    if (!validPassword(password)) {
      throw new CodeError('Weak password!', status.BAD_REQUEST);
    }
  
    // Mettre à jour le mot de passe de l'utilisateur
    const passhash = await bcrypt.hash(password, 2);
    await userModel.update({ passhash }, { where: { email: req.login } });
  
    res.json({ status: true, message: 'Password updated successfully' });
  },

  async deleteUser (req, res) {
    // TODO : verify if the token is valid and correspond to an admin
    // #swagger.tags = ['Users']
    // #swagger.summary = 'Delete User'
    if (!has(req.params, 'id')) throw new CodeError('You must specify the id', status.BAD_REQUEST)
    const { id } = req.params
    await userModel.destroy({ where: { id } })
    res.json({ status: true, message: 'User deleted' })
  }
}
