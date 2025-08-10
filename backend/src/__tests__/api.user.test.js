const app = require('../app')
const request = require('supertest')

test('Test if user can log in and list users', async () => {
  let response = await request(app)
    .post('/login')
    .send({ email: 'Youssef.Morchid@grenoble-inp.org', password: '123456' })
  expect(response.statusCode).toBe(200)
  expect(response.body).toHaveProperty('token')
  response = await request(app)
    .get('/api/users')
    .set('x-access-token', response.body.token)
  expect(response.statusCode).toBe(200)
  expect(response.body.message).toBe('Returning users')
  expect(response.body.data.length).toBeGreaterThan(0)
})

afterAll(async () => {
  // Nettoyer les données de test si nécessaire
  // Par exemple, supprimer les utilisateurs et groupes créés pour les tests
});