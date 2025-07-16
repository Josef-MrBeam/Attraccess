import { DateTimeOptions, useFormatDateTime } from '../../hooks';

interface DateTimeDisplayProps {
  date?: Date | string | number | null;
  options?: DateTimeOptions;
}

export function DateTimeDisplay(props: DateTimeDisplayProps & React.HTMLAttributes<HTMLSpanElement>) {
  const { date, options, ...spanProps } = props;

  const formattedDate = useFormatDateTime(date, options);

  return <span {...spanProps}>{formattedDate}</span>;
}
