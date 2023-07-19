import React from 'react';
import { render } from '@testing-library/react';
import Portal from '../src';
import { updateCSS } from 'rc-util/lib/Dom/dynamicCSS';

jest.mock('../src/util', () => {
  const origin = jest.requireActual('../src/util');
  return {
    ...origin,
    isBodyOverflowing: () => true,
  };
});

// Revert `useLayoutEffect` back to real one since we should keep order for test
jest.mock('rc-util/lib/hooks/useLayoutEffect', () => {
  const origin = jest.requireActual('react');
  return origin.useLayoutEffect;
});

// Revert `useLayoutEffect` back to real one since we should keep order for test
jest.mock('rc-util/lib/getScrollBarSize', () => {
  const origin = jest.requireActual('rc-util/lib/getScrollBarSize');
  return {
    ...origin,

    getTargetScrollBarSize: () => ({ width: 93, height: 1128 }),
  };
});

describe('::-webkit-scrollbar', () => {
  it('support ::-webkit-scrollbar', () => {
    render(
      <Portal open autoLock>
        <p />
      </Portal>,
    );

    expect(document.body).toHaveStyle({
      width: 'calc(100% - 93px)',
    });
  });
});
