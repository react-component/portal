import React, { version } from 'react';
import Portal from '../../src';
import './basic.less';

const Child = () => {
  const divRef = React.useRef<HTMLPreElement>(null);

  React.useEffect(() => {
    const path: Element[] = [];

    for (let cur: HTMLElement = divRef.current; cur; cur = cur.parentElement) {
      path.push(cur);
    }

    console.log('Path:', path);
  }, []);

  return (
    <pre ref={divRef} style={{ border: '1px solid red' }}>
      <p>Hello Child {version}</p>
    </pre>
  );
};

export default () => {
  const [show1, setShow1] = React.useState(false);
  const [show2, setShow2] = React.useState(false);

  return (
    <React.StrictMode>
      <button
        onClick={() => {
          setShow1(!show1);
        }}
      >
        Trigger Inner Child
      </button>
      <button
        onClick={() => {
          setShow2(!show2);
        }}
      >
        Trigger Outer Child
      </button>

      <Portal open>
        <div style={{ border: '1px solid red' }}>
          <p>Hello Root {version}</p>

          {show1 && (
            <Portal open>
              <Child />
            </Portal>
          )}
        </div>
      </Portal>

      {show2 && (
        <Portal open>
          <Child />
        </Portal>
      )}
    </React.StrictMode>
  );
};
