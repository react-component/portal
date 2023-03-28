import React from 'react';
import { renderToString } from 'react-dom/server';
import Portal from '../src';

describe('SSR', () => {
  it('No Render in SSR', () => {
    const errSpy = jest.spyOn(console, 'error').mockImplementation(() => {});

    renderToString(
      <Portal open>
        <div className="bamboo">Hello World</div>
      </Portal>,
    );

    expect(errSpy).toHaveBeenCalledWith(
      "Warning: Portal only work in client side. Please call 'useEffect' to show Portal instead default render in SSR.",
    );
    errSpy.mockRestore();
  });
});
