import tap from 'tap';
import buildServer from '../src/main';
import { TapType } from './types';
// automatically build and tear down our instance
export default async function buildApp(t: TapType) {
  const app = await buildServer();
  t.teardown(() => {
    app.close();
  });
  return app;
}
