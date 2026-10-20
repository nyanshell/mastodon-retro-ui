import { useEffect } from 'react';

import { FormattedMessage, FormattedNumber } from 'react-intl';

import { Link } from 'react-router-dom';

import type { List as ImmutableList, Map as ImmutableMap } from 'immutable';

import { useAccount } from '@/mastodon/hooks/useAccount';
import { selectUserListWithoutMe } from '@/mastodon/selectors/user_lists';
import { fetchFollowing } from 'mastodon/actions/accounts';
import { fetchTrendingHashtags } from 'mastodon/actions/trends';
import { Avatar } from 'mastodon/components/avatar';
import { DisplayName } from 'mastodon/components/display_name';
import { useIdentity } from 'mastodon/identity_context';
import { domain, me, showTrends, source_url } from 'mastodon/initial_state';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

const FOLLOWING_GRID_LIMIT = 14;

const FollowingCell: React.FC<{ accountId: string }> = ({ accountId }) => {
  const account = useAccount(accountId);

  if (!account) {
    return null;
  }

  return (
    <Link
      to={`/@${account.acct}`}
      className='retro-sidebar__following-cell'
      title={account.display_name || account.username}
    >
      <Avatar account={account} size={30} />
    </Link>
  );
};

const AccountCard: React.FC = () => {
  const account = useAccount(me);

  if (!account) {
    return null;
  }

  return (
    <div className='retro-sidebar__account'>
      <div className='retro-sidebar__account-row'>
        <Link to={`/@${account.acct}`} className='retro-sidebar__avatar'>
          <Avatar account={account} size={44} />
        </Link>

        <div className='retro-sidebar__account-name'>
          <Link to={`/@${account.acct}`}>
            <DisplayName account={account} variant='simple' />
          </Link>
          <div className='retro-sidebar__handle'>@{account.acct}</div>
        </div>
      </div>

      <div className='retro-sidebar__stats'>
        <Link to={`/@${account.acct}`} className='retro-sidebar__stat'>
          <strong>
            <FormattedNumber value={account.statuses_count} />
          </strong>
          <span>
            <FormattedMessage id='retro.stats.toots' defaultMessage='Toots' />
          </span>
        </Link>
        <Link
          to={`/@${account.acct}/following`}
          className='retro-sidebar__stat'
        >
          <strong>
            <FormattedNumber value={account.following_count} />
          </strong>
          <span>
            <FormattedMessage
              id='retro.stats.following'
              defaultMessage='Following'
            />
          </span>
        </Link>
        <Link
          to={`/@${account.acct}/followers`}
          className='retro-sidebar__stat'
        >
          <strong>
            <FormattedNumber value={account.followers_count} />
          </strong>
          <span>
            <FormattedMessage
              id='retro.stats.followers'
              defaultMessage='Followers'
            />
          </span>
        </Link>
      </div>
    </div>
  );
};

const SidebarTrends: React.FC = () => {
  const trends = useAppSelector(
    (state) =>
      state.trends.getIn(['tags', 'items']) as ImmutableList<
        ImmutableMap<string, unknown>
      >,
  );

  if (!showTrends || trends.isEmpty()) {
    return null;
  }

  return (
    <div className='retro-sidebar__section'>
      <h3 className='retro-sidebar__heading'>
        <FormattedMessage
          id='retro.trending'
          defaultMessage='Trending on the fediverse'
        />
      </h3>

      <div className='retro-sidebar__trends'>
        {trends.take(5).map((hashtag) => {
          const name = hashtag.get('name') as string;
          const uses = (
            hashtag.get('history') as
              | ImmutableList<ImmutableMap<string, unknown>>
              | undefined
          )?.reduce((total, day) => total + (Number(day.get('uses')) || 0), 0);

          return (
            <Link
              key={name}
              to={`/tags/${name}`}
              className='retro-sidebar__trend'
            >
              #{name}{' '}
              {typeof uses === 'number' && uses > 0 && (
                <span className='retro-sidebar__trend-count'>
                  <FormattedMessage
                    id='retro.trend_count'
                    defaultMessage='{count, plural, one {# toot} other {# toots}}'
                    values={{ count: uses }}
                  />
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </div>
  );
};

const FollowingGrid: React.FC = () => {
  const following = useAppSelector((state) =>
    selectUserListWithoutMe(state, 'following', me),
  );

  if (!following || following.items.length === 0) {
    return null;
  }

  return (
    <div className='retro-sidebar__section'>
      <h3 className='retro-sidebar__heading'>
        <FormattedMessage id='retro.following' defaultMessage='Following' />
      </h3>

      <div className='retro-sidebar__following'>
        {following.items.slice(0, FOLLOWING_GRID_LIMIT).map((accountId) => (
          <FollowingCell key={accountId} accountId={accountId} />
        ))}
      </div>
    </div>
  );
};

/**
 * 2010-style sidebar shown next to the timeline in the single-column
 * layout: account card with stats, trending hashtags, following grid
 * and a footer with instance links.
 */
export const RetroSidebar: React.FC = () => {
  const dispatch = useAppDispatch();
  const { signedIn } = useIdentity();

  useEffect(() => {
    if (showTrends) {
      dispatch(fetchTrendingHashtags());
    }

    if (signedIn && me) {
      dispatch(fetchFollowing(me));
    }
  }, [dispatch, signedIn]);

  return (
    <aside className='retro-sidebar'>
      {signedIn && <AccountCard />}

      <SidebarTrends />

      {signedIn && <FollowingGrid />}

      <div className='retro-sidebar__footer'>
        <Link to='/about'>
          <FormattedMessage id='navigation_bar.about' defaultMessage='About' />
        </Link>{' '}
        &middot;{' '}
        <a
          href='https://docs.joinmastodon.org'
          target='_blank'
          rel='noopener noreferrer'
        >
          <FormattedMessage id='retro.footer.help' defaultMessage='Help' />
        </a>{' '}
        &middot;{' '}
        <Link to='/privacy-policy'>
          <FormattedMessage
            id='retro.footer.privacy'
            defaultMessage='Privacy'
          />
        </Link>{' '}
        &middot;{' '}
        <a
          href='https://docs.joinmastodon.org/api/'
          target='_blank'
          rel='noopener noreferrer'
        >
          <FormattedMessage id='retro.footer.api' defaultMessage='API' />
        </a>{' '}
        &middot;{' '}
        <a href={source_url} target='_blank' rel='noopener noreferrer'>
          <FormattedMessage id='retro.footer.source' defaultMessage='Source' />
        </a>
        <br />
        {domain} &middot;{' '}
        <FormattedMessage
          id='retro.footer.powered_by'
          defaultMessage='powered by Mastodon'
        />
      </div>
    </aside>
  );
};
