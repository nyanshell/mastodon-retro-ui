import { useCallback, useMemo } from 'react';

import { defineMessages, useIntl, FormattedMessage } from 'react-intl';

import classNames from 'classnames';
import { Helmet } from 'react-helmet';
import { NavLink } from 'react-router-dom';

import { AccountBio } from '@/mastodon/components/account_bio';
import { AccountFields } from '@/mastodon/components/account_fields';
import { AnimateEmojiProvider } from '@/mastodon/components/emoji/context';
import MoreHorizIcon from '@/material-icons/400-24px/more_horiz.svg?react';
import {
  followAccount,
  unblockAccount,
  unmuteAccount,
  pinAccount,
  unpinAccount,
  removeAccountFromFollowers,
} from 'mastodon/actions/accounts';
import { initBlockModal } from 'mastodon/actions/blocks';
import { mentionCompose, directCompose } from 'mastodon/actions/compose';
import {
  initDomainBlockModal,
  unblockDomain,
} from 'mastodon/actions/domain_blocks';
import { openModal } from 'mastodon/actions/modal';
import { initMuteModal } from 'mastodon/actions/mutes';
import { initReport } from 'mastodon/actions/reports';
import { Avatar } from 'mastodon/components/avatar';
import { Badge, AutomatedBadge, GroupBadge } from 'mastodon/components/badge';
import {
  FollowersCounter,
  FollowingCounter,
  StatusesCounter,
} from 'mastodon/components/counters';
import { Dropdown } from 'mastodon/components/dropdown_menu';
import { FollowButton } from 'mastodon/components/follow_button';
import { FormattedDateWrapper } from 'mastodon/components/formatted_date';
import { ShortNumber } from 'mastodon/components/short_number';
import { AccountNote } from 'mastodon/features/account/components/account_note';
import FollowRequestNoteContainer from 'mastodon/features/account/containers/follow_request_note_container';
import { useIdentity } from 'mastodon/identity_context';
import { me, domain as localDomain } from 'mastodon/initial_state';
import type { Account } from 'mastodon/models/account';
import type { MenuItem } from 'mastodon/models/dropdown_menu';
import {
  PERMISSION_MANAGE_USERS,
  PERMISSION_MANAGE_FEDERATION,
} from 'mastodon/permissions';
import { getAccountHidden } from 'mastodon/selectors/accounts';
import { useAppSelector, useAppDispatch } from 'mastodon/store';

import { MemorialNote } from './memorial_note';
import { MovedNote } from './moved_note';

const messages = defineMessages({
  unblock: { id: 'account.unblock', defaultMessage: 'Unblock @{name}' },
  edit_profile: { id: 'account.edit_profile', defaultMessage: 'Edit profile' },
  mention: { id: 'account.mention', defaultMessage: 'Mention @{name}' },
  direct: { id: 'account.direct', defaultMessage: 'Privately mention @{name}' },
  unmute: { id: 'account.unmute', defaultMessage: 'Unmute @{name}' },
  block: { id: 'account.block', defaultMessage: 'Block @{name}' },
  mute: { id: 'account.mute', defaultMessage: 'Mute @{name}' },
  report: { id: 'account.report', defaultMessage: 'Report @{name}' },
  share: { id: 'account.share', defaultMessage: "Share @{name}'s profile" },
  copy: { id: 'account.copy', defaultMessage: 'Copy link to profile' },
  media: { id: 'account.media', defaultMessage: 'Media' },
  blockDomain: {
    id: 'account.block_domain',
    defaultMessage: 'Block domain {domain}',
  },
  unblockDomain: {
    id: 'account.unblock_domain',
    defaultMessage: 'Unblock domain {domain}',
  },
  hideReblogs: {
    id: 'account.hide_reblogs',
    defaultMessage: 'Hide boosts from @{name}',
  },
  showReblogs: {
    id: 'account.show_reblogs',
    defaultMessage: 'Show boosts from @{name}',
  },
  enableNotifications: {
    id: 'account.enable_notifications',
    defaultMessage: 'Notify me when @{name} posts',
  },
  disableNotifications: {
    id: 'account.disable_notifications',
    defaultMessage: 'Stop notifying me when @{name} posts',
  },
  languages: {
    id: 'account.languages',
    defaultMessage: 'Change subscribed languages',
  },
  openOriginalPage: {
    id: 'account.open_original_page',
    defaultMessage: 'Open original page',
  },
  removeFromFollowers: {
    id: 'account.remove_from_followers',
    defaultMessage: 'Remove {name} from followers',
  },
  confirmRemoveFromFollowersTitle: {
    id: 'confirmations.remove_from_followers.title',
    defaultMessage: 'Remove follower?',
  },
  confirmRemoveFromFollowersMessage: {
    id: 'confirmations.remove_from_followers.message',
    defaultMessage:
      '{name} will stop following you. Are you sure you want to proceed?',
  },
  confirmRemoveFromFollowersButton: {
    id: 'confirmations.remove_from_followers.confirm',
    defaultMessage: 'Remove follower',
  },
  endorse: { id: 'account.endorse', defaultMessage: 'Feature on profile' },
  unendorse: {
    id: 'account.unendorse',
    defaultMessage: "Don't feature on profile",
  },
  add_or_remove_from_list: {
    id: 'account.add_or_remove_from_list',
    defaultMessage: 'Add or Remove from lists',
  },
  admin_account: {
    id: 'status.admin_account',
    defaultMessage: 'Open moderation interface for @{name}',
  },
  admin_domain: {
    id: 'status.admin_domain',
    defaultMessage: 'Open moderation interface for {domain}',
  },
});

const titleFromAccount = (account: Account) => {
  const displayName = account.display_name;
  const acct =
    account.acct === account.username
      ? `${account.username}@${localDomain}`
      : account.acct;
  const prefix =
    displayName.trim().length === 0 ? account.username : displayName;

  return `${prefix} (@${acct})`;
};

export const AccountHeader: React.FC<{
  accountId: string;
  hideTabs?: boolean;
}> = ({ accountId, hideTabs }) => {
  const dispatch = useAppDispatch();
  const intl = useIntl();
  const { signedIn, permissions } = useIdentity();
  const account = useAppSelector((state) => state.accounts.get(accountId));
  const relationship = useAppSelector((state) =>
    state.relationships.get(accountId),
  );
  const hidden = useAppSelector((state) => getAccountHidden(state, accountId));

  const handleBlock = useCallback(() => {
    if (!account) return;
    if (relationship?.blocking) {
      dispatch(unblockAccount(account.id));
    } else {
      dispatch(initBlockModal(account));
    }
  }, [dispatch, account, relationship]);

  const handleMention = useCallback(() => {
    if (!account) return;
    dispatch(mentionCompose(account));
  }, [dispatch, account]);

  const handleDirect = useCallback(() => {
    if (!account) return;
    dispatch(directCompose(account));
  }, [dispatch, account]);

  const handleReport = useCallback(() => {
    if (!account) return;
    dispatch(initReport(account));
  }, [dispatch, account]);

  const handleReblogToggle = useCallback(() => {
    if (!account) return;
    if (relationship?.showing_reblogs) {
      dispatch(followAccount(account.id, { reblogs: false }));
    } else {
      dispatch(followAccount(account.id, { reblogs: true }));
    }
  }, [dispatch, account, relationship]);

  const handleMute = useCallback(() => {
    if (!account) return;
    if (relationship?.muting) {
      dispatch(unmuteAccount(account.id));
    } else {
      dispatch(initMuteModal(account));
    }
  }, [dispatch, account, relationship]);

  const handleBlockDomain = useCallback(() => {
    if (!account) return;
    dispatch(initDomainBlockModal(account));
  }, [dispatch, account]);

  const handleUnblockDomain = useCallback(() => {
    if (!account) return;
    const domain = account.acct.split('@')[1];
    if (!domain) return;
    dispatch(unblockDomain(domain));
  }, [dispatch, account]);

  const handleEndorseToggle = useCallback(() => {
    if (!account) return;
    if (relationship?.endorsed) {
      dispatch(unpinAccount(account.id));
    } else {
      dispatch(pinAccount(account.id));
    }
  }, [dispatch, account, relationship]);

  const handleAddToList = useCallback(() => {
    if (!account) return;
    dispatch(
      openModal({
        modalType: 'LIST_ADDER',
        modalProps: { accountId: account.id },
      }),
    );
  }, [dispatch, account]);

  const handleChangeLanguages = useCallback(() => {
    if (!account) return;
    dispatch(
      openModal({
        modalType: 'SUBSCRIBED_LANGUAGES',
        modalProps: { accountId: account.id },
      }),
    );
  }, [dispatch, account]);

  const handleOpenAvatar = useCallback(
    (e: React.MouseEvent) => {
      if (e.button !== 0 || e.ctrlKey || e.metaKey) return;
      e.preventDefault();
      if (!account) return;
      dispatch(
        openModal({
          modalType: 'IMAGE',
          modalProps: { src: account.avatar, alt: '' },
        }),
      );
    },
    [dispatch, account],
  );

  const suspended = account?.suspended;
  const isRemote = account?.acct !== account?.username;
  const remoteDomain = isRemote ? account?.acct.split('@')[1] : null;

  const menuItems = useMemo(() => {
    const arr: MenuItem[] = [];
    if (!account) return arr;

    if (signedIn && !account.suspended) {
      arr.push({
        text: intl.formatMessage(messages.mention, { name: account.username }),
        action: handleMention,
      });
      arr.push({
        text: intl.formatMessage(messages.direct, { name: account.username }),
        action: handleDirect,
      });
      arr.push(null);
    }

    if (isRemote) {
      arr.push({
        text: intl.formatMessage(messages.openOriginalPage),
        href: account.url,
      });
      arr.push(null);
    }

    if (signedIn) {
      if (relationship?.following) {
        if (!relationship.muting) {
          if (relationship.showing_reblogs) {
            arr.push({
              text: intl.formatMessage(messages.hideReblogs, {
                name: account.username,
              }),
              action: handleReblogToggle,
            });
          } else {
            arr.push({
              text: intl.formatMessage(messages.showReblogs, {
                name: account.username,
              }),
              action: handleReblogToggle,
            });
          }
          arr.push({
            text: intl.formatMessage(messages.languages),
            action: handleChangeLanguages,
          });
          arr.push(null);
        }

        arr.push({
          text: intl.formatMessage(
            relationship.endorsed ? messages.unendorse : messages.endorse,
          ),
          action: handleEndorseToggle,
        });
        arr.push({
          text: intl.formatMessage(messages.add_or_remove_from_list),
          action: handleAddToList,
        });
        arr.push(null);
      }

      if (relationship?.followed_by) {
        const handleRemoveFromFollowers = () => {
          dispatch(
            openModal({
              modalType: 'CONFIRM',
              modalProps: {
                title: intl.formatMessage(
                  messages.confirmRemoveFromFollowersTitle,
                ),
                message: intl.formatMessage(
                  messages.confirmRemoveFromFollowersMessage,
                  { name: <strong>{account.acct}</strong> },
                ),
                confirm: intl.formatMessage(
                  messages.confirmRemoveFromFollowersButton,
                ),
                onConfirm: () => {
                  void dispatch(removeAccountFromFollowers({ accountId }));
                },
              },
            }),
          );
        };
        arr.push({
          text: intl.formatMessage(messages.removeFromFollowers, {
            name: account.username,
          }),
          action: handleRemoveFromFollowers,
          dangerous: true,
        });
      }

      if (relationship?.muting) {
        arr.push({
          text: intl.formatMessage(messages.unmute, { name: account.username }),
          action: handleMute,
        });
      } else {
        arr.push({
          text: intl.formatMessage(messages.mute, { name: account.username }),
          action: handleMute,
          dangerous: true,
        });
      }

      if (relationship?.blocking) {
        arr.push({
          text: intl.formatMessage(messages.unblock, {
            name: account.username,
          }),
          action: handleBlock,
        });
      } else {
        arr.push({
          text: intl.formatMessage(messages.block, { name: account.username }),
          action: handleBlock,
          dangerous: true,
        });
      }

      if (!account.suspended) {
        arr.push({
          text: intl.formatMessage(messages.report, { name: account.username }),
          action: handleReport,
          dangerous: true,
        });
      }
    }

    if (signedIn && isRemote) {
      arr.push(null);
      if (relationship?.domain_blocking) {
        arr.push({
          text: intl.formatMessage(messages.unblockDomain, {
            domain: remoteDomain,
          }),
          action: handleUnblockDomain,
        });
      } else {
        arr.push({
          text: intl.formatMessage(messages.blockDomain, {
            domain: remoteDomain,
          }),
          action: handleBlockDomain,
          dangerous: true,
        });
      }
    }

    if (
      (permissions & PERMISSION_MANAGE_USERS) === PERMISSION_MANAGE_USERS ||
      (isRemote &&
        (permissions & PERMISSION_MANAGE_FEDERATION) ===
          PERMISSION_MANAGE_FEDERATION)
    ) {
      arr.push(null);
      if ((permissions & PERMISSION_MANAGE_USERS) === PERMISSION_MANAGE_USERS) {
        arr.push({
          text: intl.formatMessage(messages.admin_account, {
            name: account.username,
          }),
          href: `/admin/accounts/${account.id}`,
        });
      }
      if (
        isRemote &&
        (permissions & PERMISSION_MANAGE_FEDERATION) ===
          PERMISSION_MANAGE_FEDERATION
      ) {
        arr.push({
          text: intl.formatMessage(messages.admin_domain, {
            domain: remoteDomain,
          }),
          href: `/admin/instances/${remoteDomain}`,
        });
      }
    }

    return arr;
  }, [
    dispatch,
    accountId,
    account,
    relationship,
    permissions,
    isRemote,
    remoteDomain,
    intl,
    signedIn,
    handleAddToList,
    handleBlock,
    handleBlockDomain,
    handleChangeLanguages,
    handleDirect,
    handleEndorseToggle,
    handleMention,
    handleMute,
    handleReblogToggle,
    handleReport,
    handleUnblockDomain,
  ]);

  if (!account) {
    return null;
  }

  const suspendedOrHidden = hidden || suspended;
  const isLocal = !account.acct.includes('@');
  const fields = account.fields;
  const displayName =
    account.display_name.trim().length === 0
      ? account.username
      : account.display_name;

  const badges = [];
  if (account.bot) {
    badges.push(<AutomatedBadge key='bot-badge' />);
  } else if (account.group) {
    badges.push(<GroupBadge key='group-badge' />);
  }
  account.roles.forEach((role) => {
    badges.push(
      <Badge
        key={`role-badge-${role.get('id')}`}
        label={<span>{role.get('name')}</span>}
        domain={isLocal ? localDomain : account.acct.split('@')[1]}
        roleId={role.get('id')}
      />,
    );
  });

  const isMovedAndUnfollowedAccount = account.moved && !relationship?.following;

  const menu = accountId !== me && (
    <Dropdown
      disabled={menuItems.length === 0}
      items={menuItems}
      icon='ellipsis-v'
      iconComponent={MoreHorizIcon}
    />
  );

  return (
    <div className='account-timeline__header'>
      {!hidden && account.memorial && <MemorialNote />}
      {!hidden && account.moved && (
        <MovedNote accountId={account.id} targetAccountId={account.moved} />
      )}

      <AnimateEmojiProvider
        className={classNames('account__header', {
          inactive: !!account.moved,
        })}
      >
        {!suspendedOrHidden && !account.moved && relationship?.requested_by && (
          <FollowRequestNoteContainer account={account} />
        )}

        {/* Retro heading */}
        <div className='retro-profile-heading'>
          {displayName}&apos;s updates
        </div>

        <div className='account__header__bar'>
          <div className='account__header__tabs'>
            <a
              className='avatar'
              href={account.avatar}
              rel='noopener'
              target='_blank'
              onClick={handleOpenAvatar}
            >
              <Avatar
                account={suspendedOrHidden ? undefined : account}
                size={48}
              />
            </a>

            <div className='account__header__tabs__name'>
              <h1>
                <span
                  dangerouslySetInnerHTML={{
                    __html: account.display_name_html,
                  }}
                />
                <small>@{account.acct}</small>
              </h1>
            </div>

            <div className='account__header__buttons account__header__buttons--desktop'>
              {!isMovedAndUnfollowedAccount && !hidden && (
                <FollowButton
                  accountId={accountId}
                  className='account__header__follow-button'
                  labelLength='long'
                />
              )}
              {menu}
            </div>
          </div>

          {badges.length > 0 && (
            <div className='account__header__badges'>{badges}</div>
          )}

          {!suspendedOrHidden && (
            <div className='account__header__extra'>
              <div className='account__header__bio'>
                {account.id !== me && signedIn && (
                  <AccountNote accountId={accountId} />
                )}

                <AccountBio
                  accountId={accountId}
                  className='account__header__content'
                />

                <div className='account__header__fields'>
                  <dl>
                    <dt>
                      <FormattedMessage
                        id='account.joined_short'
                        defaultMessage='Joined'
                      />
                    </dt>
                    <dd>
                      <FormattedDateWrapper
                        value={account.created_at}
                        year='numeric'
                        month='short'
                        day='2-digit'
                      />
                    </dd>
                  </dl>

                  <AccountFields fields={fields} emojis={account.emojis} />
                </div>
              </div>

              <div className='account__header__extra__links'>
                <NavLink
                  to={`/@${account.acct}`}
                  title={intl.formatNumber(account.statuses_count)}
                >
                  <ShortNumber
                    value={account.statuses_count}
                    renderer={StatusesCounter}
                  />
                </NavLink>

                <NavLink
                  exact
                  to={`/@${account.acct}/following`}
                  title={intl.formatNumber(account.following_count)}
                >
                  <ShortNumber
                    value={account.following_count}
                    renderer={FollowingCounter}
                  />
                </NavLink>

                <NavLink
                  exact
                  to={`/@${account.acct}/followers`}
                  title={intl.formatNumber(account.followers_count)}
                >
                  <ShortNumber
                    value={account.followers_count}
                    renderer={FollowersCounter}
                  />
                </NavLink>
              </div>
            </div>
          )}
        </div>
      </AnimateEmojiProvider>

      {!(hideTabs || hidden) && (
        <div className='account__section-headline'>
          <NavLink exact to={`/@${account.acct}/featured`}>
            <FormattedMessage id='account.featured' defaultMessage='Featured' />
          </NavLink>
          <NavLink exact to={`/@${account.acct}`}>
            <FormattedMessage id='account.posts' defaultMessage='Posts' />
          </NavLink>
          <NavLink exact to={`/@${account.acct}/with_replies`}>
            <FormattedMessage
              id='account.posts_with_replies'
              defaultMessage='Posts and replies'
            />
          </NavLink>
          <NavLink exact to={`/@${account.acct}/media`}>
            <FormattedMessage id='account.media' defaultMessage='Media' />
          </NavLink>
        </div>
      )}

      <Helmet>
        <title>{titleFromAccount(account)}</title>
        <meta
          name='robots'
          content={isLocal && !account.noindex ? 'all' : 'noindex'}
        />
        <link rel='canonical' href={account.url} />
      </Helmet>
    </div>
  );
};
