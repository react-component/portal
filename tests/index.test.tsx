import React from 'react';
import { render } from '@testing-library/react';
import Portal from '../src';

describe('Portal', () => {
  it('Order', () => {
    render(
      <Portal open debug="root">
        <p>Root</p>
        <Portal open debug="parent">
          <p>Parent</p>
          <Portal open debug="children">
            <p>Children</p>
          </Portal>
        </Portal>
      </Portal>,
    );

    const pList = Array.from(document.body.querySelectorAll('p'));
    expect(pList).toHaveLength(3);
    expect(pList.map(p => p.textContent)).toEqual([
      'Root',
      'Parent',
      'Children',
    ]);
  });

  describe('getContainer', () => {
    it('false', () => {
      const { container } = render(
        <>
          Hello
          <Portal open getContainer={false}>
            Bamboo
          </Portal>
          Light
        </>,
      );

      expect(container).toMatchSnapshot();
    });

    it('customize in same level', () => {
      let renderTimes = 0;

      const Content = () => {
        React.useEffect(() => {
          renderTimes += 1;
        });

        return <>Bamboo</>;
      };

      const Demo = () => {
        const divRef = React.useRef();

        return (
          <div ref={divRef} className="holder">
            <Portal open getContainer={() => divRef.current}>
              <Content />
            </Portal>
          </div>
        );
      };

      const { container } = render(<Demo />);
      expect(container).toMatchSnapshot();
      expect(renderTimes).toEqual(1);
    });
  });
});
