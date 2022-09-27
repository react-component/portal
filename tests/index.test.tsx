import React from 'react';
import { render } from '@testing-library/react';
import Portal from '../src';

describe('Portal', () => {
  it('Order', () => {
    render(
      <Portal open>
        <p>Root</p>
        <Portal open>
          <p>Parent</p>
          <Portal open>
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

    it('customize', () => {
      const Demo = () => {
        const divRef = React.useRef();

        return (
          <div ref={divRef} className="holder">
            <Portal open getContainer={() => divRef.current}>
              Bamboo
            </Portal>
          </div>
        );
      };

      const { container } = render(<Demo />);
      expect(container).toMatchSnapshot();
    });
  });
});
