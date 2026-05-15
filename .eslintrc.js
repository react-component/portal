const restrictedPackageDirectoryImports = [
  '@rc-component/*/es',
  '@rc-component/*/es/**',
  '@rc-component/*/lib',
  '@rc-component/*/lib/**',
  'rc-*/es',
  'rc-*/es/**',
  'rc-*/lib',
  'rc-*/lib/**',
];

const config = {
  extends: [require.resolve('@umijs/fabric/dist/eslint')],
  rules: {
    'no-restricted-imports': [
      'error',
      {
        patterns: [
          {
            group: restrictedPackageDirectoryImports,
            message:
              'Do not import package internals from es/lib. Import from the package root.',
          },
        ],
      },
    ],
    'react/no-did-update-set-state': 0,
    'react/no-find-dom-node': 0,
    'import/no-extraneous-dependencies': 0,
    'react/sort-comp': 0,
  },
};

module.exports = config;
