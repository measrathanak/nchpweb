module.exports = {
  ci: {
    collect: {
      startServerCommand: 'node .next/standalone/server.js',
      startServerReadyPattern: 'Ready',
      startServerReadyTimeout: 60000,
      url: [
        'http://localhost:3000/en',
        'http://localhost:3000/km',
        'http://localhost:3000/en/articles',
        'http://localhost:3000/km/articles',
      ],
      numberOfRuns: 2,
    },
    assert: {
      assertions: {
        'categories:performance': ['warn', { minScore: 0.8 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:best-practices': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'largest-contentful-paint': ['warn', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        'interactive': ['warn', { maxNumericValue: 3800 }],
        'meta-description': 'error',
        'document-title': 'error',
        'canonical': 'error',
        'hreflang': 'error',
      },
    },
    upload: {
      target: 'temporary-public-storage',
    },
  },
};
