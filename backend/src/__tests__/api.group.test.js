const app = require('../app')
const request = require('supertest')

describe('Tests pour GET /api/mygroups/:gid', () => {
  let token;
  let groupId;

  beforeAll(async () => {
    // Créer un utilisateur de test
    await request(app)
      .post('/register')
      .send({
        name: 'Test User',
        email: 'testuser@example.com',
        password: 'password123'
      });
    
    // Se connecter pour obtenir le token
    const res = await request(app)
      .post('/login')
      .send({
        email: 'testuser@example.com',
        password: 'password123'
      });
    
    token = res.body.token;
    
    // Créer un groupe de test
    const groupRes = await request(app)
      .post('/api/mygroups')
      .set('x-access-token', token)
      .send({
        name: 'Test Group'
      });
    
    groupId = groupRes.body.data.id;
  });

  test('Devrait retourner les membres du groupe', async () => {
    const res = await request(app)
      .get(`/api/mygroups/${groupId}`)
      .set('x-access-token', token);
    
    expect(res.statusCode).toEqual(200);
    expect(Array.isArray(res.body)).toBe(true);
    // Le créateur du groupe devrait être dans la liste des membres
    expect(res.body.length).toBeGreaterThan(0);
  });

  test('Devrait retourner 404 pour un groupe inexistant', async () => {
    const res = await request(app)
      .get('/api/mygroups/999999')
      .set('x-access-token', token);
    
    expect(res.statusCode).toEqual(404);
  });
});

describe('Tests pour DELETE /api/mygroups/:gid', () => {
  let token;
  let groupId;

  beforeAll(async () => {
    // Créer un utilisateur de test
    await request(app)
      .post('/register')
      .send({
        name: 'Delete Test User',
        email: 'deletetest@example.com',
        password: 'password123'
      });
    
    // Se connecter pour obtenir le token
    const res = await request(app)
      .post('/login')
      .send({
        email: 'deletetest@example.com',
        password: 'password123'
      });
    
    token = res.body.token;
    
    // Créer un groupe de test
    const groupRes = await request(app)
      .post('/api/mygroups')
      .set('x-access-token', token)
      .send({
        name: 'Delete Test Group'
      });
    
    groupId = groupRes.body.id;
  });

  test('Devrait supprimer le groupe avec succès', async () => {
    const res = await request(app)
      .delete(`/api/mygroups/${groupId}`)
      .set('x-access-token', token);
    
    expect(res.statusCode).toEqual(200);
    expect(res.body.message).toContain('succès');
    
    // Vérifier que le groupe n'existe plus
    const checkRes = await request(app)
      .get(`/api/mygroups/${groupId}`)
      .set('x-access-token', token);
    
    expect(checkRes.statusCode).toEqual(404);
  });

  test('Devrait retourner 404 pour un groupe inexistant', async () => {
    const res = await request(app)
      .delete('/api/mygroups/999999')
      .set('x-access-token', token);
    
    expect(res.statusCode).toEqual(404);
  });
});

afterAll(async () => {
  // Nettoyer les données de test si nécessaire
  // Par exemple, supprimer les utilisateurs et groupes créés pour les tests
});