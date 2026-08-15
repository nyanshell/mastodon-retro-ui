import { useCallback } from 'react';

import { defineMessages, useIntl } from 'react-intl';

import { Link, NavLink } from 'react-router-dom';

import { useAccount } from '@/mastodon/hooks/useAccount';
import { openNavigation } from 'mastodon/actions/navigation';
import { Search } from 'mastodon/features/compose/components/search';
import { useIdentity } from 'mastodon/identity_context';
import { domain, me, trendsEnabled } from 'mastodon/initial_state';
import { selectUnreadNotificationGroupsCount } from 'mastodon/selectors/notifications';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

const messages = defineMessages({
  home: { id: 'tabs_bar.home', defaultMessage: 'Home' },
  notifications: {
    id: 'tabs_bar.notifications',
    defaultMessage: 'Notifications',
  },
  profile: { id: 'retro.tabs_bar.profile', defaultMessage: 'Profile' },
  explore: { id: 'retro.tabs_bar.explore', defaultMessage: 'Explore' },
  more: { id: 'retro.tabs_bar.more', defaultMessage: 'More' },
});

const NotificationsNavLink: React.FC<{ label: string }> = ({ label }) => {
  const count = useAppSelector(selectUnreadNotificationGroupsCount);

  return (
    <NavLink
      to='/notifications'
      className='retro-header__nav-link'
      activeClassName='active'
    >
      {label}
      {count > 0 && <span className='retro-header__badge'>{count}</span>}
    </NavLink>
  );
};

/**
 * Glossy 2010-style top bar: wordmark + instance tag, search box and
 * text navigation links, shown in the single-column layout.
 */
export const RetroHeader: React.FC = () => {
  const intl = useIntl();
  const dispatch = useAppDispatch();
  const { signedIn } = useIdentity();
  const account = useAccount(me);

  const handleMoreClick = useCallback(() => {
    dispatch(openNavigation());
  }, [dispatch]);

  // Split the wordmark out of the instance domain, so
  // e.g. "mastodon.example.com" renders as "mastodon" + ".example.com".
  const instanceTag = domain?.startsWith('mastodon')
    ? domain.slice('mastodon'.length)
    : domain;

  return (
    <header className='retro-header'>
      <div className='retro-header__inner'>
        <Link to='/' className='retro-header__logo'>
          <span className='retro-header__wordmark'>mastodon</span>
          {instanceTag && (
            <span className='retro-header__instance'>{instanceTag}</span>
          )}
        </Link>

        <div className='retro-header__search'>
          <Search singleColumn />
        </div>

        <div className='retro-header__spacer' />

        <nav className='retro-header__nav'>
          {signedIn && (
            <NavLink
              to='/home'
              className='retro-header__nav-link'
              activeClassName='active'
            >
              {intl.formatMessage(messages.home)}
            </NavLink>
          )}

          {signedIn && (
            <NotificationsNavLink
              label={intl.formatMessage(messages.notifications)}
            />
          )}

          {signedIn && account && (
            <NavLink
              to={`/@${account.acct}`}
              className='retro-header__nav-link'
              activeClassName='active'
            >
              {intl.formatMessage(messages.profile)}
            </NavLink>
          )}

          {trendsEnabled && (
            <NavLink
              to='/explore'
              className='retro-header__nav-link'
              activeClassName='active'
            >
              {intl.formatMessage(messages.explore)}
            </NavLink>
          )}

          <button
            type='button'
            className='retro-header__nav-link retro-header__more'
            onClick={handleMoreClick}
          >
            {intl.formatMessage(messages.more)} &#9662;
          </button>
        </nav>
      </div>
    </header>
  );
};
