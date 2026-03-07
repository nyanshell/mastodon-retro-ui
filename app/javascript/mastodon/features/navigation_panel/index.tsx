import { Link } from 'react-router-dom';

import { autoPlayGif, me } from 'mastodon/initial_state';
import { useAppSelector } from 'mastodon/store';

import { Trends } from './components/trends';

const RetroProfileCard: React.FC = () => {
  const account = useAppSelector((state) =>
    me ? state.accounts.get(me) : undefined,
  );

  if (!me || !account) {
    return null;
  }

  const avatarSrc = autoPlayGif
    ? account.get('avatar')
    : account.get('avatar_static');
  const displayName = account.get('display_name') || account.get('username');
  const acct = account.get('acct');
  const followingCount = account.get('following_count');
  const followersCount = account.get('followers_count');
  const statusesCount = account.get('statuses_count');

  return (
    <div className='retro-profile-card'>
      <Link to={`/@${acct}`}>
        <img className='retro-profile-card__avatar' src={avatarSrc} alt='' />
      </Link>
      <div className='retro-profile-card__name'>
        <Link to={`/@${acct}`}>{displayName}</Link>
      </div>
      <div className='retro-profile-card__handle'>@{acct}</div>
      <div className='retro-profile-card__stats'>
        <Link to={`/@${acct}/following`} className='retro-profile-card__stat'>
          <span className='retro-profile-card__stat-value'>
            {followingCount}
          </span>
          <span className='retro-profile-card__stat-label'>Following</span>
        </Link>
        <Link to={`/@${acct}/followers`} className='retro-profile-card__stat'>
          <span className='retro-profile-card__stat-value'>
            {followersCount}
          </span>
          <span className='retro-profile-card__stat-label'>Followers</span>
        </Link>
        <Link to={`/@${acct}`} className='retro-profile-card__stat'>
          <span className='retro-profile-card__stat-value'>
            {statusesCount}
          </span>
          <span className='retro-profile-card__stat-label'>Updates</span>
        </Link>
      </div>
    </div>
  );
};

const RetroFooter: React.FC = () => (
  <div className='retro-footer'>
    <div>&copy; 2008 Mastodon</div>
    <div className='retro-footer__links'>
      <Link to='/about'>About Us</Link>
      <span>&middot;</span>
      <Link to='/about'>Contact</Link>
      <span>&middot;</span>
      <a
        href='https://docs.joinmastodon.org'
        target='_blank'
        rel='noopener noreferrer'
      >
        API
      </a>
    </div>
  </div>
);

export const NavigationPanel: React.FC<{ multiColumn?: boolean }> = () => {
  return (
    <div className='navigation-panel'>
      {me && <RetroProfileCard />}
      <Trends />
      <RetroFooter />
    </div>
  );
};

export const CollapsibleNavigationPanel: React.FC = () => {
  return (
    <div className='columns-area__panels__pane columns-area__panels__pane--start columns-area__panels__pane--navigational'>
      <div className='columns-area__panels__pane__inner'>
        <NavigationPanel />
      </div>
    </div>
  );
};
