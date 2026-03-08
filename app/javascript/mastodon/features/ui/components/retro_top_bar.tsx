import { Link, NavLink } from 'react-router-dom';

import { useIdentity } from 'mastodon/identity_context';

export const RetroTopBar: React.FC = () => {
  const { signedIn } = useIdentity();

  return (
    <div className='retro-top-bar'>
      <div className='retro-top-bar__inner'>
        <Link to='/' className='retro-top-bar__logo'>
          mastodon
        </Link>

        <nav className='retro-top-bar__nav'>
          <NavLink
            to='/home'
            className='retro-top-bar__link'
            activeClassName='retro-top-bar__link--active'
          >
            Home
          </NavLink>
          <NavLink
            to='/public/local'
            className='retro-top-bar__link'
            activeClassName='retro-top-bar__link--active'
          >
            Local
          </NavLink>
          <NavLink
            to='/public'
            exact
            className='retro-top-bar__link'
            activeClassName='retro-top-bar__link--active'
          >
            Federated
          </NavLink>
          <NavLink
            to='/notifications'
            className='retro-top-bar__link'
            activeClassName='retro-top-bar__link--active'
          >
            Notifications
          </NavLink>
          <NavLink
            to='/lists'
            className='retro-top-bar__link'
            activeClassName='retro-top-bar__link--active'
          >
            Lists
          </NavLink>
          <a href='/settings/preferences' className='retro-top-bar__link'>
            Settings
          </a>
          <NavLink
            to='/about'
            className='retro-top-bar__link'
            activeClassName='retro-top-bar__link--active'
          >
            Help
          </NavLink>
          {signedIn ? (
            <a
              href='/auth/sign_out'
              className='retro-top-bar__link'
              data-method='delete'
            >
              Sign Out
            </a>
          ) : (
            <a href='/auth/sign_in' className='retro-top-bar__link'>
              Sign In
            </a>
          )}
        </nav>

        <NavLink
          to='/search'
          className='retro-top-bar__link retro-top-bar__search'
          activeClassName='retro-top-bar__link--active'
        >
          Search
        </NavLink>
      </div>
    </div>
  );
};
