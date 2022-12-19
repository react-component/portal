import React from 'react';
import { render } from '@testing-library/react';
import Portal from '../src';

global.isOverflow = true;

jest.mock('../src/util', () => {
  const origin = jest.requireActual('../src/util');
  return {
    ...origin,
    isBodyOverflowing: () => global.isOverflow,
  };
});

// Revert `useLayoutEffect` back to real one since we should keep order for test
jest.mock('rc-util/lib/hooks/useLayoutEffect', () => {
  const origin = jest.requireActual('react');
  return origin.useLayoutEffect;
});

describe('Portal', () => {
  beforeEach(() => {
    global.isOverflow = true;
  });

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

  describe('dynamic change autoLock', () => {
    function test(name: string, config?: Parameters<typeof render>[1]) {
      it(name, () => {
        const { rerender } = render(<Portal open />, config);
        expect(document.body).not.toHaveStyle({
          overflowY: 'hidden',
        });

        rerender(<Portal open autoLock />);
        expect(document.body).toHaveStyle({
          overflowY: 'hidden',
        });

        rerender(<Portal open={false} autoLock />);
        expect(document.body).not.toHaveStyle({
          overflowY: 'hidden',
        });

        rerender(<Portal open autoLock />);
        expect(document.body).toHaveStyle({
          overflowY: 'hidden',
        });

        rerender(<Portal open autoLock={false} />);
        expect(document.body).not.toHaveStyle({
          overflowY: 'hidden',
        });
      });
    }

    test('basic');
    test('StrictMode', {
      wrapper: React.StrictMode,
    });

    it('window not scrollable', () => {
      global.isOverflow = false;
      render(<Portal open />);

      expect(document.body).not.toHaveStyle({
        overflowY: 'hidden',
      });
    });

    it('not lock screen when getContainer is not body', () => {
      const div = document.createElement('div');
      document.body.appendChild(div);
      render(
        <Portal open autoLock getContainer={() => div}>
          Bamboo
        </Portal>,
      );

      expect(document.body).not.toHaveStyle({
        overflowY: 'hidden',
      });
    });

    it('lock when getContainer give document.body', () => {
      render(
        <Portal open autoLock getContainer={() => document.body}>
          Bamboo
        </Portal>,
      );

      expect(document.body).toHaveStyle({
        overflowY: 'hidden',
      });
    });
  });

  it('autoDestroy', () => {
    expect(document.querySelector('p')).toBeFalsy();

    const renderDemo = (open: boolean, autoDestroy: boolean) => (
      <Portal open={open} autoDestroy={autoDestroy}>
        <p>Root</p>
      </Portal>
    );

    const { rerender } = render(renderDemo(true, false));
    expect(document.querySelector('p')).toBeTruthy();

    rerender(renderDemo(false, false));
    expect(document.querySelector('p')).toBeTruthy();

    rerender(renderDemo(false, true));
    expect(document.querySelector('p')).toBeFalsy();
  });

  describe('ref-able', () => {
    it('support forwardRef', () => {
      const elementRef = React.createRef<HTMLParagraphElement>();
      const portalRef = React.createRef();

      render(
        <Portal ref={portalRef} open>
          <p ref={elementRef}>Bamboo</p>
        </Portal>,
      );

      expect(elementRef.current).toBe(document.querySelector('p'));
      expect(portalRef.current).toBe(document.querySelector('p'));
    });

    it('not support fragment', () => {
      const elementRef = React.createRef<HTMLParagraphElement>();
      const portalRef = React.createRef();

      render(
        <Portal ref={portalRef} open>
          <>
            <p ref={elementRef}>Bamboo</p>
          </>
        </Portal>,
      );

      expect(elementRef.current).toBe(document.querySelector('p'));
      expect(portalRef.current).toBeFalsy();
    });

    it('not support FC', () => {
      const elementRef = React.createRef<HTMLParagraphElement>();
      const portalRef = React.createRef();

      const P = (props: any) => <p {...props} />;

      render(
        <Portal ref={portalRef} open>
          <P ref={elementRef}>Bamboo</P>
        </Portal>,
      );

      expect(elementRef.current).toBeFalsy();
      expect(portalRef.current).toBeFalsy();
    });
  });

  it('first render should ref accessible', () => {
    let checked = false;

    const Demo = ({ open }: { open?: boolean }) => {
      const pRef = React.useRef();

      React.useEffect(() => {
        if (open) {
          checked = true;
          expect(pRef.current).toBeTruthy();
        }
      }, [open]);

      return (
        <Portal open={open}>
          <div>
            <p ref={pRef} />
          </div>
        </Portal>
      );
    };

    const { rerender } = render(<Demo />);
    expect(checked).toBeFalsy();

    rerender(<Demo open />);
    expect(checked).toBeTruthy();
  });

  it('not block if parent already created', () => {
    const Checker = () => {
      const divRef = React.useRef<HTMLDivElement>(null);
      const [inDoc, setInDoc] = React.useState(false);

      React.useEffect(() => {
        setInDoc(document.contains(divRef.current));
      }, []);

      return (
        <div ref={divRef} className="checker">
          {String(inDoc)}
        </div>
      );
    };

    const Demo = ({ visible }: any) => (
      <Portal open>
        {visible && (
          <Portal open>
            <Checker />
          </Portal>
        )}
      </Portal>
    );

    const { rerender } = render(<Demo />);

    rerender(<Demo visible />);

    expect(document.querySelector('.checker').textContent).toEqual('true');
  });
});
