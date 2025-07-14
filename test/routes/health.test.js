import t from 'tap';
import buildApp from '../helper';

t.test('Test health', async (t) => {
  const app = await buildApp(t);
  const response = await app.inject({ method: 'GET', url: '/health' });
  const body = await response.json();

  t.ok(body.status);
  t.ok(body.database);
  t.ok(body.timestamp);
});
