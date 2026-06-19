import { useId, useState, type FormEvent } from 'react';
import { useIntl } from 'react-intl';
import { useNavigate, useSearchParams } from 'react-router';

import SearchIcon from '@/assets/icons/search.svg?react';
import { paths as searchPaths, type SearchType } from '@/pages/Search/paths';

import styles from './styles.module.css';

function getSearchType(value: string | null): SearchType {
  if (value === 'manga' || value === 'users') return value;

  return 'anime';
}

export default function SearchBox({ className }: { className?: string }) {
  const searchId = useId();
  const { formatMessage } = useIntl();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [value, setValue] = useState('');

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    const query = value.trim();
    if (!query) return;

    navigate(
      searchPaths({
        query,
        type: getSearchType(searchParams.get('type')),
      }).toString(),
    );
    setValue('');
    event.currentTarget.querySelector('input')?.blur();
  }

  return (
    <form
      className={[styles.container, className].join(' ')}
      aria-label={formatMessage({
        defaultMessage: 'Site search',
        description: 'Accessible label for the header search form',
      })}
      role="search"
      onSubmit={handleSubmit}>
      <label htmlFor={searchId} aria-hidden="true">
        <SearchIcon className={styles.icon} />
      </label>
      <input
        className={styles.input}
        type="search"
        value={value}
        onChange={(event) => setValue(event.currentTarget.value)}
        aria-label={formatMessage({
          defaultMessage: 'Search Kitsu',
          description: 'Accessible label for search field',
        })}
        placeholder={formatMessage({
          id: 'components.application.nav-search',
          defaultMessage: 'Search Kitsu',
          description: 'Placeholder text for search field',
        })}
        id={searchId}
      />
    </form>
  );
}
