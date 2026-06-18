import { useIntl } from 'react-intl';

import Tag from '@/components/content/Tag';

export default function ModerationScoreTag({
  moderationScores,
}: {
  moderationScores?: Record<string, number>;
}) {
  const intl = useIntl();
  const spamScore =
    moderationScores?.['sagemaker_v1_spamminess'] ??
    moderationScores?.['nyckel_spamminess'];

  const color =
    spamScore === undefined
      ? 'grey'
      : spamScore > 0.9
        ? 'red'
        : spamScore > 0.7
          ? 'yellow'
          : 'green';

  return (
    <Tag color={color}>
      {intl.formatMessage(
        { defaultMessage: '{score} Spam' },
        { score: intl.formatNumber(spamScore ?? 0, { style: 'percent' }) },
      )}
    </Tag>
  );
}
