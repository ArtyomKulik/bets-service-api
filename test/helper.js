import buildServer from '../src/main';
// automatically build and tear down our instance
export default async function buildApp(t) {
  const app = await buildServer();
  t.teardown(() => {
    app.close();
  });
  return app;
}
