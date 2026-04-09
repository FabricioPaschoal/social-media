import React from 'react';
import messages from '../../messages/en.json';

type Messages = Record<string, unknown>;

function getNestedValue(obj: Messages, path: string): unknown {
  return path.split('.').reduce((acc: unknown, key: string) => {
    if (acc && typeof acc === 'object') {
      return (acc as Messages)[key];
    }
    return undefined;
  }, obj);
}

export function useTranslations(namespace?: string) {
  return function t(key: string, params?: Record<string, string | number>) {
    const fullKey = namespace ? `${namespace}.${key}` : key;
    let value = getNestedValue(messages as Messages, fullKey);

    if (typeof value !== 'string') {
      return fullKey;
    }

    if (params) {
      Object.entries(params).forEach(([paramKey, paramValue]) => {
        value = (value as string).replace(`{${paramKey}}`, String(paramValue));
      });
    }

    return value as string;
  };
}

export function useLocale() {
  return 'en';
}

export function useMessages() {
  return messages;
}

export function useNow() {
  return new Date();
}

export function useTimeZone() {
  return 'UTC';
}

export function useFormatter() {
  return {
    dateTime: (date: Date) => date.toISOString(),
    number: (n: number) => String(n),
    relativeTime: (date: Date) => date.toISOString(),
  };
}

export function NextIntlClientProvider({
  children,
}: {
  children: React.ReactNode;
  locale?: string;
  messages?: Record<string, unknown>;
}) {
  return <>{children}</>;
}

const nextIntlMock = {
  useTranslations,
  useLocale,
  useMessages,
  useNow,
  useTimeZone,
  useFormatter,
  NextIntlClientProvider,
};

export default nextIntlMock;
