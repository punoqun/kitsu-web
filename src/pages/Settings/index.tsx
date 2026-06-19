import { captureException } from '@sentry/react';
import {
  Suspense,
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from 'react';
import { FormattedMessage, useIntl, type IntlShape } from 'react-intl';

import { Link } from '@/components/content/Link';
import Button from '@/components/controls/Button';
import Field from '@/components/controls/Field';
import TextInput from '@/components/controls/TextInput';
import Alert from '@/components/feedback/Alert';
import Spinner from '@/components/feedback/Spinner';
import GroupBox from '@/components/GroupBox';
import { HeaderSettings } from '@/contexts/LayoutSettingsContext';
import { useAccount, type Account } from '@/contexts/AccountContext';
import { useSession } from '@/contexts/SessionContext';
import { graphql, useMutation, useQuery } from '@/graphql';
import utilStyles from '@/styles/utils.module.css';

import styles from './styles.module.css';

const SettingsPageQuery = graphql(`
  query SettingsPageQuery {
    currentProfile {
      id
      name
      about
      slug
    }
    currentAccount {
      id
      country
      timeZone
      ratingSystem
      sfwFilterPreference
      titleLanguagePreference
    }
  }
`);

const UpdateProfileMutation = graphql(`
  mutation SettingsUpdateProfile($input: ProfileUpdateInput!) {
    profile {
      update(input: $input) {
        result {
          id
          name
          about
          slug
        }
        errors {
          ... on Error {
            message
          }
        }
      }
    }
  }
`);

const UpdateAccountMutation = graphql(`
  mutation SettingsUpdateAccount($input: AccountUpdateInput!) {
    account {
      update(input: $input) {
        result {
          id
          country
          timeZone
          ratingSystem
          sfwFilterPreference
          titleLanguagePreference
        }
        errors {
          ... on Error {
            message
          }
        }
      }
    }
  }
`);

const ChangePasswordMutation = graphql(`
  mutation SettingsChangePassword($input: AccountChangePasswordInput!) {
    account {
      changePassword(input: $input) {
        result {
          id
        }
        errors {
          ... on Error {
            message
          }
        }
      }
    }
  }
`);

const RATING_SYSTEM_VALUES = ['ADVANCED', 'REGULAR', 'SIMPLE'] as const;
const SFW_FILTER_VALUES = [
  'NSFW_EVERYWHERE',
  'NSFW_SOMETIMES',
  'SFW',
] as const;
const TITLE_LANGUAGE_VALUES = ['CANONICAL', 'LOCALIZED', 'ROMANIZED'] as const;

type RatingSystem = (typeof RATING_SYSTEM_VALUES)[number];
type SfwFilterPreference = (typeof SFW_FILTER_VALUES)[number];
type TitleLanguagePreference = (typeof TITLE_LANGUAGE_VALUES)[number];
type PayloadErrors =
  | readonly ({ message?: string | null } | null | undefined)[]
  | null
  | undefined;
type Feedback =
  | { kind: 'success'; message: ReactNode }
  | { kind: 'error'; message: ReactNode };
type ProfileSettings = {
  id: string;
  name: string;
  about?: string | null;
};
type AccountSettings = {
  country?: string | null;
  timeZone?: string | null;
  ratingSystem?: string | null;
  sfwFilterPreference?: string | null;
  titleLanguagePreference?: string | null;
};

function getPayloadErrorMessage(errors: PayloadErrors): string | null {
  return (
    errors
      ?.map((error) => error?.message)
      .find((message): message is string => Boolean(message)) ?? null
  );
}

function isEnumValue<Value extends string>(
  values: readonly Value[],
  value?: string | null,
): value is Value {
  return values.includes(value as Value);
}

function getRatingSystem(value?: string | null): RatingSystem {
  return isEnumValue(RATING_SYSTEM_VALUES, value) ? value : 'SIMPLE';
}

function getSfwFilterPreference(
  value?: string | null,
  sfwFilter?: boolean,
): SfwFilterPreference {
  if (isEnumValue(SFW_FILTER_VALUES, value)) return value;
  return sfwFilter === false ? 'NSFW_EVERYWHERE' : 'SFW';
}

function getTitleLanguagePreference(
  value?: string | null,
): TitleLanguagePreference {
  return isEnumValue(TITLE_LANGUAGE_VALUES, value) ? value : 'CANONICAL';
}

function formatRatingSystem(
  value: RatingSystem,
  formatMessage: IntlShape['formatMessage'],
): string {
  switch (value) {
    case 'ADVANCED':
      return formatMessage({
        defaultMessage: 'Advanced',
        description: 'Rating system preference option.',
      });
    case 'REGULAR':
      return formatMessage({
        defaultMessage: 'Regular',
        description: 'Rating system preference option.',
      });
    case 'SIMPLE':
      return formatMessage({
        defaultMessage: 'Simple',
        description: 'Rating system preference option.',
      });
  }
}

function formatSfwFilterPreference(
  value: SfwFilterPreference,
  formatMessage: IntlShape['formatMessage'],
): string {
  switch (value) {
    case 'NSFW_EVERYWHERE':
      return formatMessage({
        defaultMessage: 'Show NSFW everywhere',
        description: 'SFW filter preference option.',
      });
    case 'NSFW_SOMETIMES':
      return formatMessage({
        defaultMessage: 'Show NSFW sometimes',
        description: 'SFW filter preference option.',
      });
    case 'SFW':
      return formatMessage({
        defaultMessage: 'Only show SFW content',
        description: 'SFW filter preference option.',
      });
  }
}

function formatTitleLanguagePreference(
  value: TitleLanguagePreference,
  formatMessage: IntlShape['formatMessage'],
): string {
  switch (value) {
    case 'CANONICAL':
      return formatMessage({
        defaultMessage: 'Canonical',
        description: 'Title language preference option.',
      });
    case 'LOCALIZED':
      return formatMessage({
        defaultMessage: 'Localized',
        description: 'Title language preference option.',
      });
    case 'ROMANIZED':
      return formatMessage({
        defaultMessage: 'Romanized',
        description: 'Title language preference option.',
      });
  }
}

function FeedbackMessage({ feedback }: { feedback: Feedback | null }) {
  if (!feedback) return null;

  return (
    <Alert kind={feedback.kind} className={styles.feedback}>
      {feedback.message}
    </Alert>
  );
}

function LoadingState() {
  return (
    <div className={styles.loading}>
      <Spinner size="3em" />
    </div>
  );
}

function SettingsShell({ children }: { children: ReactNode }) {
  return (
    <>
      <HeaderSettings background="opaque" scrollBackground="opaque" />
      <main className={[utilStyles.container, styles.page].join(' ')}>
        <header className={styles.header}>
          <h1 className={styles.title}>
            <FormattedMessage
              defaultMessage="Settings"
              description="Page title for account settings."
            />
          </h1>
          <p className={styles.description}>
            <FormattedMessage
              defaultMessage="Manage your Kitsu profile, account preferences, and password."
              description="Description for the settings page."
            />
          </p>
        </header>
        {children}
      </main>
    </>
  );
}

function SignedOutPrompt() {
  return (
    <Alert kind="info">
      <FormattedMessage
        defaultMessage="Please sign in to manage your settings. "
        description="Prompt shown when a signed-out user opens settings."
      />
      <Link to="/auth/sign-in">
        <FormattedMessage
          defaultMessage="Sign in"
          description="Link text to sign in from settings."
        />
      </Link>
    </Alert>
  );
}

function ProfileSettingsForm({ profile }: { profile: ProfileSettings }) {
  const { formatMessage } = useIntl();
  const [updateResult, updateProfile] = useMutation(UpdateProfileMutation);
  const [name, setName] = useState(profile.name);
  const [about, setAbout] = useState(profile.about ?? '');
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    setName(profile.name);
    setAbout(profile.about ?? '');
    setFeedback(null);
  }, [profile.id, profile.name, profile.about]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const result = await updateProfile({
      input: {
        id: profile.id,
        name: name.trim(),
        about,
      },
    });

    if (result.error) {
      captureException(result.error);
      setFeedback({ kind: 'error', message: result.error.message });
      return;
    }

    const payloadErrorMessage = getPayloadErrorMessage(
      result.data?.profile.update?.errors,
    );
    if (payloadErrorMessage) {
      setFeedback({ kind: 'error', message: payloadErrorMessage });
      return;
    }

    setFeedback({
      kind: 'success',
      message: (
        <FormattedMessage
          defaultMessage="Profile saved."
          description="Success message after saving profile settings."
        />
      ),
    });
  };

  return (
    <GroupBox
      title={formatMessage({
        defaultMessage: 'Profile',
        description: 'Settings section title for profile settings.',
      })}
      className={styles.sectionContent}>
      <form className={styles.form} onSubmit={(event) => void onSubmit(event)}>
        <FeedbackMessage feedback={feedback} />
        <TextInput
          label={formatMessage({
            defaultMessage: 'Name',
            description: 'Label for profile display name input.',
          })}
          value={name}
          onChange={(event) => setName(event.target.value)}
          autoComplete="name"
        />
        <Field
          label={formatMessage({
            defaultMessage: 'About',
            description: 'Label for profile bio input.',
          })}>
          {(fieldProps) => (
            <textarea
              id={fieldProps.id}
              className={[fieldProps.className, styles.textarea].join(' ')}
              placeholder={fieldProps.placeholder}
              value={about}
              onChange={(event) => setAbout(event.target.value)}
            />
          )}
        </Field>
        <div className={styles.actions}>
          <Button
            type="submit"
            kind="solid"
            color="green"
            loading={updateResult.fetching}
            disabled={updateResult.fetching}>
            <FormattedMessage
              defaultMessage="Save Profile"
              description="Submit button for profile settings."
            />
          </Button>
        </div>
      </form>
    </GroupBox>
  );
}

function AccountSettingsForm({
  account,
  settingsAccount,
}: {
  account: Account;
  settingsAccount?: AccountSettings | null;
}) {
  const { formatMessage } = useIntl();
  const [updateResult, updateAccount] = useMutation(UpdateAccountMutation);
  const [country, setCountry] = useState(
    settingsAccount?.country ?? account.country ?? '',
  );
  const [timeZone, setTimeZone] = useState(
    settingsAccount?.timeZone ?? account.timeZone ?? '',
  );
  const [ratingSystem, setRatingSystem] = useState<RatingSystem>(
    getRatingSystem(settingsAccount?.ratingSystem ?? account.ratingSystem),
  );
  const [sfwFilterPreference, setSfwFilterPreference] =
    useState<SfwFilterPreference>(
      getSfwFilterPreference(
        settingsAccount?.sfwFilterPreference,
        account.sfwFilter,
      ),
    );
  const [preferredTitleLanguage, setPreferredTitleLanguage] =
    useState<TitleLanguagePreference>(
      getTitleLanguagePreference(settingsAccount?.titleLanguagePreference),
    );
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  useEffect(() => {
    setCountry(settingsAccount?.country ?? account.country ?? '');
    setTimeZone(settingsAccount?.timeZone ?? account.timeZone ?? '');
    setRatingSystem(
      getRatingSystem(settingsAccount?.ratingSystem ?? account.ratingSystem),
    );
    setSfwFilterPreference(
      getSfwFilterPreference(
        settingsAccount?.sfwFilterPreference,
        account.sfwFilter,
      ),
    );
    setPreferredTitleLanguage(
      getTitleLanguagePreference(settingsAccount?.titleLanguagePreference),
    );
    setFeedback(null);
  }, [
    account.country,
    account.ratingSystem,
    account.sfwFilter,
    account.timeZone,
    settingsAccount?.country,
    settingsAccount?.ratingSystem,
    settingsAccount?.sfwFilterPreference,
    settingsAccount?.timeZone,
    settingsAccount?.titleLanguagePreference,
  ]);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    const result = await updateAccount({
      input: {
        country: country.trim() || null,
        timeZone: timeZone.trim() || null,
        ratingSystem,
        sfwFilterPreference,
        preferredTitleLanguage,
      },
    });

    if (result.error) {
      captureException(result.error);
      setFeedback({ kind: 'error', message: result.error.message });
      return;
    }

    const payloadErrorMessage = getPayloadErrorMessage(
      result.data?.account.update?.errors,
    );
    if (payloadErrorMessage) {
      setFeedback({ kind: 'error', message: payloadErrorMessage });
      return;
    }

    setFeedback({
      kind: 'success',
      message: (
        <FormattedMessage
          defaultMessage="Account preferences saved."
          description="Success message after saving account settings."
        />
      ),
    });
  };

  return (
    <GroupBox
      title={formatMessage({
        defaultMessage: 'Account',
        description: 'Settings section title for account preferences.',
      })}
      className={styles.sectionContent}>
      <form className={styles.form} onSubmit={(event) => void onSubmit(event)}>
        <FeedbackMessage feedback={feedback} />
        <div className={styles.fieldGrid}>
          <TextInput
            label={formatMessage({
              defaultMessage: 'Region',
              description: 'Label for account region input.',
            })}
            value={country}
            onChange={(event) => setCountry(event.target.value)}
            autoComplete="country"
          />
          <TextInput
            label={formatMessage({
              defaultMessage: 'Time Zone',
              description: 'Label for account time zone input.',
            })}
            value={timeZone}
            onChange={(event) => setTimeZone(event.target.value)}
          />
        </div>
        <div className={styles.fieldGrid}>
          <Field
            label={formatMessage({
              defaultMessage: 'Rating System',
              description: 'Label for account rating system select.',
            })}>
            {(fieldProps) => (
              <select
                id={fieldProps.id}
                className={[fieldProps.className, styles.select].join(' ')}
                value={ratingSystem}
                onChange={(event) =>
                  setRatingSystem(getRatingSystem(event.target.value))
                }>
                {RATING_SYSTEM_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {formatRatingSystem(value, formatMessage)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field
            label={formatMessage({
              defaultMessage: 'SFW Filter',
              description: 'Label for account SFW filter select.',
            })}>
            {(fieldProps) => (
              <select
                id={fieldProps.id}
                className={[fieldProps.className, styles.select].join(' ')}
                value={sfwFilterPreference}
                onChange={(event) =>
                  setSfwFilterPreference(
                    getSfwFilterPreference(event.target.value),
                  )
                }>
                {SFW_FILTER_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {formatSfwFilterPreference(value, formatMessage)}
                  </option>
                ))}
              </select>
            )}
          </Field>
          <Field
            label={formatMessage({
              defaultMessage: 'Title Language',
              description: 'Label for account title language select.',
            })}>
            {(fieldProps) => (
              <select
                id={fieldProps.id}
                className={[fieldProps.className, styles.select].join(' ')}
                value={preferredTitleLanguage}
                onChange={(event) =>
                  setPreferredTitleLanguage(
                    getTitleLanguagePreference(event.target.value),
                  )
                }>
                {TITLE_LANGUAGE_VALUES.map((value) => (
                  <option key={value} value={value}>
                    {formatTitleLanguagePreference(value, formatMessage)}
                  </option>
                ))}
              </select>
            )}
          </Field>
        </div>
        <div className={styles.actions}>
          <Button
            type="submit"
            kind="solid"
            color="green"
            loading={updateResult.fetching}
            disabled={updateResult.fetching}>
            <FormattedMessage
              defaultMessage="Save Account"
              description="Submit button for account preferences."
            />
          </Button>
        </div>
      </form>
    </GroupBox>
  );
}

function PasswordSettingsForm() {
  const { formatMessage } = useIntl();
  const [changeResult, changePassword] = useMutation(ChangePasswordMutation);
  const [oldPassword, setOldPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [feedback, setFeedback] = useState<Feedback | null>(null);

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFeedback(null);

    if (newPassword !== confirmPassword) {
      setFeedback({
        kind: 'error',
        message: formatMessage({
          defaultMessage: 'New passwords do not match.',
          description: 'Validation error for mismatched password confirmation.',
        }),
      });
      return;
    }

    const result = await changePassword({
      input: {
        oldPassword,
        newPassword,
      },
    });

    if (result.error) {
      captureException(result.error);
      setFeedback({ kind: 'error', message: result.error.message });
      return;
    }

    const payloadErrorMessage = getPayloadErrorMessage(
      result.data?.account.changePassword?.errors,
    );
    if (payloadErrorMessage) {
      setFeedback({ kind: 'error', message: payloadErrorMessage });
      return;
    }

    setOldPassword('');
    setNewPassword('');
    setConfirmPassword('');
    setFeedback({
      kind: 'success',
      message: (
        <FormattedMessage
          defaultMessage="Password changed."
          description="Success message after changing password."
        />
      ),
    });
  };

  return (
    <GroupBox
      title={formatMessage({
        defaultMessage: 'Password',
        description: 'Settings section title for password settings.',
      })}
      className={styles.sectionContent}>
      <form className={styles.form} onSubmit={(event) => void onSubmit(event)}>
        <FeedbackMessage feedback={feedback} />
        <TextInput
          type="password"
          autoComplete="current-password"
          label={formatMessage({
            defaultMessage: 'Current Password',
            description: 'Label for current password input.',
          })}
          value={oldPassword}
          onChange={(event) => setOldPassword(event.target.value)}
        />
        <div className={styles.fieldGrid}>
          <TextInput
            type="password"
            autoComplete="new-password"
            label={formatMessage({
              defaultMessage: 'New Password',
              description: 'Label for new password input.',
            })}
            value={newPassword}
            onChange={(event) => setNewPassword(event.target.value)}
          />
          <TextInput
            type="password"
            autoComplete="new-password"
            label={formatMessage({
              defaultMessage: 'Confirm New Password',
              description: 'Label for password confirmation input.',
            })}
            value={confirmPassword}
            onChange={(event) => setConfirmPassword(event.target.value)}
          />
        </div>
        <div className={styles.actions}>
          <Button
            type="submit"
            kind="solid"
            color="green"
            loading={changeResult.fetching}
            disabled={changeResult.fetching}>
            <FormattedMessage
              defaultMessage="Change Password"
              description="Submit button for changing account password."
            />
          </Button>
        </div>
      </form>
    </GroupBox>
  );
}

function SettingsContent({ account }: { account: Account }) {
  const [{ data, error, fetching }] = useQuery({ query: SettingsPageQuery });

  if (fetching) return <LoadingState />;

  if (error) {
    captureException(error);
    return <Alert kind="error">{error.message}</Alert>;
  }

  const profile = data?.currentProfile ?? account.profile;

  if (!profile?.id) {
    return (
      <Alert kind="error">
        <FormattedMessage
          defaultMessage="We couldn't load your profile settings."
          description="Error message when profile settings are unavailable."
        />
      </Alert>
    );
  }

  return (
    <div className={styles.sections}>
      <ProfileSettingsForm
        profile={{
          id: profile.id,
          name: profile.name,
          about: data?.currentProfile?.about,
        }}
      />
      <AccountSettingsForm
        account={account}
        settingsAccount={data?.currentAccount}
      />
      <PasswordSettingsForm />
    </div>
  );
}

export default function SettingsPage() {
  const session = useSession();
  const account = useAccount();

  if (!session.loggedIn) {
    return (
      <SettingsShell>
        <SignedOutPrompt />
      </SettingsShell>
    );
  }

  if (account.fetching) {
    return (
      <SettingsShell>
        <LoadingState />
      </SettingsShell>
    );
  }

  return (
    <SettingsShell>
      <Suspense fallback={<LoadingState />}>
        <SettingsContent account={account} />
      </Suspense>
    </SettingsShell>
  );
}
