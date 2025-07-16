import { useCallback, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export function useNumberFormatter(options?: Intl.NumberFormatOptions) {
  const { i18n } = useTranslation();

  const formatter = useMemo(() => {
    return new Intl.NumberFormat(i18n.language, options);
  }, [i18n.language, options]);

  return useCallback(
    (num?: string | number | null) => {
      if (num === null || num === undefined) {
        return '-';
      }

      const numAsNumber = Number(num);
      if (isNaN(numAsNumber)) {
        return '-';
      }

      return formatter.format(numAsNumber);
    },
    [formatter]
  );
}

export function useFormatNumber(num?: string | number | null) {
  const formatter = useNumberFormatter();

  return formatter(num);
}
