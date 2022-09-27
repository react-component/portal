import React from 'react';
import { render } from '@testing-library/react';
import Portal from '../src';

jest.mock('rc-util/lib/Dom/canUseDom', () => () => false);

describe('SSR', () => {
  it('No Render in SSR', () => {
    const { unmount } = render(
      <Portal open>
        <div className="bamboo">Hello World</div>
      </Portal>,
    );

    expect(document.querySelector('.bamboo')).toBeFalsy();

    unmount();
  });
});
