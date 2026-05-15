import React from 'react';
import { render } from '@testing-library/react';
import Portal from '../src';

jest.mock('../src/util', () => {
  const origin = jest.requireActual('../src/util');
  return {
    ...origin,
    isBodyOverflowing: () => true,
  };
});

jest.mock('@rc-component/util', () => {
  const origin = jest.requireActual('@rc-component/util');
  const React = jest.requireActual('react');
  return {
    ...origin,
    // Revert `useLayoutEffect` back to real one since we should keep order for test
    useLayoutEffect: React.useLayoutEffect,
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
