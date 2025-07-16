import React, { ReactElement } from 'react';
import { TableColumn } from '@heroui/react';
import { TFunction } from 'i18next';

/**
 * Generates table header columns based on user permissions
 */
export function generateHeaderColumns(
  t: TFunction,
  showAllUsers: boolean,
  canManageResources: boolean
): ReactElement[] {
  const headers: ReactElement[] = [];

  // Only show user column if we're showing all users (requires canManageResources)
  if (canManageResources && showAllUsers) {
    headers.push(<TableColumn key="user">{t('user')}</TableColumn>);
  }

  headers.push(
    <TableColumn key="startTime">{t('startTime')}</TableColumn>,
    <TableColumn key="endTime" className="hidden md:table-cell">
      {t('endTime')}
    </TableColumn>,
    <TableColumn key="duration">{t('duration')}</TableColumn>,
    <TableColumn key="icons">{''}</TableColumn>
  );

  return headers;
}
