import * as React from 'react';

export function mockUseId() {
  const useIdModule = require('@rc-component/util/lib/hooks/useId');
  let useIdSpy: jest.SpyInstance;
  let uuid = 0;

  const setup = () => {
    uuid = 0;
    useIdSpy = jest.spyOn(useIdModule, 'default').mockImplementation(() => {
      const idRef = React.useRef('');

      if (!idRef.current) {
        uuid += 1;
        idRef.current = `test-id-${uuid}`;
      }

      return idRef.current;
    });
  };

  const cleanup = () => {
    useIdSpy?.mockRestore();
  };

  return { setup, cleanup };
}
