module.exports = {
  forbidden: [
    { name: 'no-cycles', severity: 'error', from: {}, to: { circular: true } },
    { name: 'features-do-not-import-each-other', severity: 'error', from: { path: '^app/features/([^/]+)/' }, to: { path: '^app/features/(?!$1)([^/]+)/' } },
    { name: 'client-does-not-import-server', severity: 'error', from: { path: '^app/' }, to: { path: '^server/' } },
  ],
  options: { doNotFollow: { path: 'node_modules' }, tsPreCompilationDeps: true, combinedDependencies: true, preserveSymlinks: false },
};
