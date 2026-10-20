import { useEffect } from 'react';

import { FormattedMessage } from 'react-intl';

import { mountCompose, unmountCompose } from 'mastodon/actions/compose';
import ComposeFormContainer from 'mastodon/features/compose/containers/compose_form_container';
import { useIdentity } from 'mastodon/identity_context';
import { useAppDispatch, useAppSelector } from 'mastodon/store';

/**
 * "What's happening?" compose box shown above the home timeline in the
 * single-column 2010-style layout.
 */
export const RetroComposeBox: React.FC = () => {
  const dispatch = useAppDispatch();
  const { signedIn } = useIdentity();

  const hideComposer = useAppSelector((state) => {
    const mounted = state.compose.get('mounted');
    if (typeof mounted === 'number') {
      return mounted > 1;
    }
    return false;
  });

  useEffect(() => {
    dispatch(mountCompose());
    return () => {
      dispatch(unmountCompose());
    };
  }, [dispatch]);

  if (!signedIn) {
    return null;
  }

  return (
    <div className='retro-compose'>
      <h2 className='retro-compose__heading'>
        <FormattedMessage
          id='retro.whats_happening'
          defaultMessage="What's happening?"
        />
      </h2>

      {!hideComposer && <ComposeFormContainer singleColumn />}
    </div>
  );
};
