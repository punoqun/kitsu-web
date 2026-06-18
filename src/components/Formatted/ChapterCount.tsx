import { FormattedMessage } from 'react-intl';

export default function FormattedChapterCount({
  chapterCount,
}: {
  chapterCount: number;
}) {
  return (
    <FormattedMessage
      defaultMessage="{count, plural, one {# Chapter} other {# Chapters}}"
      values={{ count: chapterCount }}
    />
  );
}
