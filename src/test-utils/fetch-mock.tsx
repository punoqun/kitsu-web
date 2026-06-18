import fetchMock from 'fetch-mock';
import { afterEach } from 'vitest';

fetchMock.mockGlobal();

afterEach(() => {
  fetchMock.removeRoutes();
  fetchMock.clearHistory();
});

export default fetchMock;
