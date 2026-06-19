import { MemoryRouter, Route, Routes } from 'react-router';
import {
  afterAll,
  beforeAll,
  beforeEach,
  describe,
  expect,
  test,
  vi,
} from 'vitest';
import { useMutation, useQuery } from 'urql';

import { render, screen } from 'app/test-utils/testing-library';

import SettingsPage from './index';

const consoleError = console.error;

vi.mock('urql', () => ({
  useMutation: vi.fn(),
  useQuery: vi.fn(),
}));

vi.mock('@/contexts/SessionContext', () => ({
  useSession: () => ({ loggedIn: true }),
}));

vi.mock('@/contexts/AccountContext', () => ({
  useAccount: () => ({
    fetching: false,
    id: 'account-1',
    country: 'US',
    language: 'en',
    ratingSystem: 'SIMPLE',
    sfwFilter: true,
    timeZone: 'America/Los_Angeles',
    sitePermissions: new Set(),
    enabledFeatures: new Set(),
    profile: {
      id: 'profile-1',
      slug: 'punoqun',
      name: 'Puno Qun',
    },
  }),
}));

const useQueryMock = vi.mocked(useQuery);
const useMutationMock = vi.mocked(useMutation);

function renderSettingsPage() {
  return render(
    <MemoryRouter initialEntries={['/settings']}>
      <Routes>
        <Route path="/settings" element={<SettingsPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

beforeAll(() => {
  vi.spyOn(console, 'error').mockImplementation(
    (message?: unknown, ...args: unknown[]) => {
      if (String(message).includes('MISSING_TRANSLATION')) return;
      consoleError(message, ...args);
    },
  );
});

beforeEach(() => {
  useQueryMock.mockReset();
  useMutationMock.mockReset();
  useQueryMock.mockReturnValue([
    {
      fetching: false,
      data: {
        currentProfile: {
          id: 'profile-1',
          name: 'Puno Qun',
          about: 'Anime fan and community member.',
          slug: 'punoqun',
        },
        currentAccount: {
          id: 'account-1',
          country: 'US',
          timeZone: 'America/Los_Angeles',
          ratingSystem: 'SIMPLE',
          sfwFilterPreference: 'SFW',
          titleLanguagePreference: 'CANONICAL',
        },
      },
    },
  ] as never);
  useMutationMock.mockReturnValue([{ fetching: false }, vi.fn()] as never);
});

afterAll(() => {
  vi.restoreAllMocks();
});

describe('SettingsPage', () => {
  test('renders the settings sections', () => {
    renderSettingsPage();

    expect(
      screen.getByRole('heading', { name: 'Settings' }),
    ).toBeInTheDocument();
    expect(screen.getByText('Profile')).toBeInTheDocument();
    expect(screen.getByText('Account')).toBeInTheDocument();
    expect(screen.getByText('Password')).toBeInTheDocument();
    expect(screen.getByLabelText('Name')).toHaveValue('Puno Qun');
    expect(screen.getByLabelText('About')).toHaveValue(
      'Anime fan and community member.',
    );
    expect(screen.getByLabelText('Rating System')).toHaveValue('SIMPLE');
    expect(screen.getByLabelText('SFW Filter')).toHaveValue('SFW');
    expect(screen.getByLabelText('Title Language')).toHaveValue('CANONICAL');
  });
});
