const app = require('../app');
const request = require('supertest');

describe('Tests pour les messages', () => {
  let token;
  let groupId;
  
  beforeAll(async () => {
    // Créer un utilisateur et un groupe pour les tests
    const userRes = await request(app)
      .post('/register')
      .send({
        name: 'Message Test User',
        email: 'messagetest@example.com',
        password: 'P@ssw0rd123!'
      });
      
    const loginRes = await request(app)
      .post('/login')
      .send({
        email: 'messagetest@example.com',
        password: 'P@ssw0rd123!'
      });
      
    token = loginRes.body.token;
    
    const groupRes = await request(app)
      .post('/api/mygroups')
      .set('x-access-token', token)
      .send({
        name: 'Message Test Group'
      });
      
    groupId = groupRes.body.data.id;
  });
  
  test('Devrait poster un message dans un groupe', async () => {
    const res = await request(app)
      .post(`/api/messages/${groupId}`)
      .set('x-access-token', token)
      .send({
        content: 'Test message'
      });
      
    expect(res.statusCode).toBe(201);
    expect(res.body.status).toBe(true);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.content).toBe('Test message');
  });
  
  test('Devrait récupérer les messages d\'un groupe', async () => {
    const res = await request(app)
      .get(`/api/messages/${groupId}`)
      .set('x-access-token', token);
      
    expect(res.statusCode).toBe(200);
    expect(res.body.status).toBe(true);
    expect(Array.isArray(res.body.data)).toBe(true);
    expect(res.body.data.length).toBeGreaterThan(0);
  });
  
  test('Devrait refuser l\'accès aux messages d\'un groupe dont l\'utilisateur n\'est pas membre', async () => {
    // Créer un autre utilisateur
    await request(app)
      .post('/register')
      .send({
        name: 'Other User',
        email: 'otheruser@example.com',
        password: 'P@ssw0rd123!'
      });
      
    const loginRes = await request(app)
      .post('/login')
      .send({
        email: 'otheruser@example.com',
        password: 'P@ssw0rd123!'
      });
      
    const otherToken = loginRes.body.token;
    
    const res = await request(app)
      .get(`/api/messages/${groupId}`)
      .set('x-access-token', otherToken);
      
    expect(res.statusCode).toBe(403);
  });
});

afterAll(async () => {
  // Nettoyer les données de test si nécessaire
  // Par exemple, supprimer les utilisateurs et groupes créés pour les tests
});