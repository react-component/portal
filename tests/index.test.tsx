import { fireEvent, render } from '@testing-library/react';
import React from 'react';
import Portal from '../src';
import { _test } from '../src/useEscKeyDown';

global.isOverflow = true;

jest.mock('../src/util', () => {
  const origin = jest.requireActual('../src/util');
  return {
    ...origin,
    isBodyOverflowing: () => global.isOverflow,
  };
});

// Revert `useLayoutEffect` back to real one since we should keep order for test
jest.mock('@rc-component/util/lib/hooks/useLayoutEffect', () => {
  const origin = jest.requireActual('react');
  return origin.useLayoutEffect;
});

jest.mock('@rc-component/util/lib/hooks/useId', () => {
  const origin = jest.requireActual('react');
  return origin.useId;
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

    it('no warning for React 19 ref', () => {
      const errSpy = jest.spyOn(console, 'error');
      const elementRef = React.createRef<HTMLParagraphElement>();
      const portalRef = React.createRef();

      const P = (props: any) => <p {...props} />;

      render(
        <Portal ref={portalRef} open>
          <P ref={elementRef}>Bamboo</P>
        </Portal>,
      );

      expect(errSpy).not.toHaveBeenCalled();

      errSpy.mockRestore();
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

  describe('onEsc', () => {
    beforeEach(() => {
      _test().reset();
      jest.useFakeTimers();
    });

    afterEach(() => {
      jest.clearAllTimers();
      jest.useRealTimers();
    });

    it('only last opened portal is top', () => {
      const onEscA = jest.fn();
      const onEscB = jest.fn();

      render(
        <>
          <Portal open onEsc={onEscA}>
            <div />
          </Portal>
          <Portal open onEsc={onEscB}>
            <div />
          </Portal>
        </>,
      );

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(onEscA).toHaveBeenCalledWith(
        expect.objectContaining({ top: false }),
      );
      expect(onEscB).toHaveBeenCalledWith(
        expect.objectContaining({ top: true }),
      );
    });

    it('top changes after portal closes', () => {
      const onEscA = jest.fn();
      const onEscB = jest.fn();

      const { rerender } = render(
        <>
          <Portal open onEsc={onEscA}>
            <div />
          </Portal>
          <Portal open onEsc={onEscB}>
            <div />
          </Portal>
        </>,
      );

      rerender(
        <>
          <Portal open onEsc={onEscA}>
            <div />
          </Portal>
          <Portal open={false} onEsc={onEscB}>
            <div />
          </Portal>
        </>,
      );

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(onEscA).toHaveBeenCalledWith(
        expect.objectContaining({ top: true }),
      );
      expect(onEscB).not.toHaveBeenCalled();
    });

    it('should not trigger onEsc when IME composing', () => {
      const onEsc = jest.fn();

      render(
        <Portal open onEsc={onEsc}>
          <input type="text" />
        </Portal>,
      );

      fireEvent.keyDown(window, { key: 'Escape', isComposing: true });
      expect(onEsc).not.toHaveBeenCalled();
    });

    it('should not trigger onEsc within IME lock duration after compositionend', () => {
      const onEsc = jest.fn();

      render(
        <Portal open onEsc={onEsc}>
          <input type="text" />
        </Portal>,
      );

      fireEvent.compositionEnd(window);

      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onEsc).not.toHaveBeenCalled();

      jest.advanceTimersByTime(100);
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onEsc).not.toHaveBeenCalled();

      jest.advanceTimersByTime(150);
      fireEvent.keyDown(window, { key: 'Escape' });
      expect(onEsc).toHaveBeenCalledWith(
        expect.objectContaining({ top: true }),
      );
    });

    it('should clear stack when unmount', () => {
      const { unmount } = render(
        <Portal open>
          <div />
        </Portal>,
      );

      expect(_test().stack).toHaveLength(1);
      unmount();
      expect(_test().stack).toHaveLength(0);
    });

    it('onEsc should treat first mounted portal as top in StrictMode', () => {
      const onEsc = jest.fn();

      const Demo = ({ visible }: { visible: boolean }) =>
        visible ? (
          <Portal open onEsc={onEsc}>
            <div />
          </Portal>
        ) : null;

      render(<Demo visible />, { wrapper: React.StrictMode });

      expect(_test().stack).toHaveLength(1);

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(onEsc).toHaveBeenCalledWith(
        expect.objectContaining({ top: true }),
      );
    });

    it('nested portals should trigger in correct order', () => {
      const onEsc = jest.fn();
      const onEsc2 = jest.fn();
      const onEsc3 = jest.fn();

      render(
        <Portal open onEsc={onEsc}>
          <div />
          <Portal open onEsc={onEsc2}>
            <div />
            <Portal open onEsc={onEsc3}>
              <div />
            </Portal>
          </Portal>
        </Portal>,
      );

      fireEvent.keyDown(window, { key: 'Escape' });

      expect(onEsc).toHaveBeenCalledWith(
        expect.objectContaining({ top: false }),
      );
      expect(onEsc2).toHaveBeenCalledWith(
        expect.objectContaining({ top: false }),
      );
      expect(onEsc3).toHaveBeenCalledWith(
        expect.objectContaining({ top: true }),
      );
    });

    describe('nonce', () => {
      it('should apply nonce to style tag when autoLock is enabled', () => {
        const testNonce = 'test-nonce-123';

        render(
          <Portal open autoLock nonce={testNonce}>
            <div>Content</div>
          </Portal>,
        );

        const styleTag = document.querySelector('style[nonce]');
        expect(styleTag).toBeTruthy();
        expect(styleTag?.getAttribute('nonce')).toBe(testNonce);
      });

      it('should not apply nonce when autoLock is disabled', () => {
        const testNonce = 'test-nonce-123';

        render(
          <Portal open nonce={testNonce}>
            <div>Content</div>
          </Portal>,
        );

        const styleTag = document.querySelector(`style[nonce="${testNonce}"]`);
        expect(styleTag).toBeFalsy();
      });

      it('should remove style tag when portal closes but preserve nonce capability', () => {
        const testNonce = 'test-nonce-123';

        const { rerender } = render(
          <Portal open autoLock nonce={testNonce}>
            <div>Content</div>
          </Portal>,
        );

        expect(
          document.querySelector(`style[nonce="${testNonce}"]`),
        ).toBeTruthy();

        rerender(
          <Portal open={false} autoLock nonce={testNonce}>
            <div>Content</div>
          </Portal>,
        );

        expect(document.querySelector(`style[nonce="${testNonce}"]`)).toBeFalsy();

        // Reopen and verify nonce is still applied
        rerender(
          <Portal open autoLock nonce={testNonce}>
            <div>Content</div>
          </Portal>,
        );

        expect(
          document.querySelector(`style[nonce="${testNonce}"]`),
        ).toBeTruthy();
      });

      it('should work with custom container and nonce', () => {
        const testNonce = 'test-nonce-123';

        render(
          <Portal
            open
            autoLock
            getContainer={() => document.body}
            nonce={testNonce}
          >
            <div>Content</div>
          </Portal>,
        );

        const styleTag = document.querySelector('style[nonce]');
        expect(styleTag?.getAttribute('nonce')).toBe(testNonce);
      });

      it('should not apply nonce when rendering to custom non-body container', () => {
        const testNonce = 'test-nonce-123';
        const div = document.createElement('div');
        document.body.appendChild(div);

        render(
          <Portal open autoLock getContainer={() => div} nonce={testNonce}>
            <div>Content</div>
          </Portal>,
        );

        // Should not lock body when container is custom div
        const styleTag = document.querySelector(`style[nonce="${testNonce}"]`);
        expect(styleTag).toBeFalsy();

        document.body.removeChild(div);
      });

      it('should handle undefined nonce gracefully', () => {
        render(
          <Portal open autoLock>
            <div>Content</div>
          </Portal>,
        );

        // Should still create style tag, just without nonce
        expect(document.body).toHaveStyle({
          overflowY: 'hidden',
        });
      });

      it('should work in StrictMode with nonce', () => {
        const testNonce = 'test-nonce-strict';

        render(
          <Portal open autoLock nonce={testNonce}>
            <div>Content</div>
          </Portal>,
          { wrapper: React.StrictMode },
        );

        const styleTag = document.querySelector('style[nonce]');
        expect(styleTag?.getAttribute('nonce')).toBe(testNonce);
      });
    });
  });
});
