import { type ComponentProps } from 'react';
import { MemoryRouter } from 'react-router';
import { describe, expect, test } from 'vitest';

import { render, screen } from 'app/test-utils/testing-library';

import ProfileCard from './index';

type ProfileCardProfile = ComponentProps<typeof ProfileCard>['profile'];

const profile = {
  id: '1',
  slug: 'punoqun',
  name: 'Puno Qun',
  about: 'Anime fan and community member.',
  avatarImage: {
    blurhash: null,
    views: [
      { height: 200, width: 200, url: 'https://example.com/profile.jpg' },
    ],
  },
} as unknown as ProfileCardProfile;

describe('ProfileCard', () => {
  test('renders profile details and links to the profile', () => {
    render(
      <MemoryRouter>
        <ProfileCard profile={profile} />
      </MemoryRouter>,
    );

    expect(screen.getByText('Puno Qun')).toBeInTheDocument();
    expect(screen.getByText('@punoqun')).toBeInTheDocument();
    expect(
      screen.getByText('Anime fan and community member.'),
    ).toBeInTheDocument();
    expect(screen.getByRole('link')).toHaveAttribute('href', '/users/punoqun');
  });
});
