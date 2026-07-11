import type { CodegenConfig } from '@graphql-codegen/cli';

// TODO: point this at your app's real GraphQL backend. VITE_GRAPHQL_ENDPOINT
// is also read by src/core/graphql/client.ts at runtime — keep them in sync.
const GRAPHQL_SCHEMA_ENDPOINT =
  process.env.VITE_GRAPHQL_ENDPOINT ?? 'http://localhost:4000/graphql';

const config: CodegenConfig = {
  schema: [
    {
      [GRAPHQL_SCHEMA_ENDPOINT]: {
        headers: {
          sourceapp: 'sampark',
          // TODO: add an authorization header here if your backend requires
          // one to serve introspection queries.
        },
      },
    },
  ],
  documents: ['src/**/*.ts', 'src/**/*.tsx'],
  ignoreNoDocuments: true,
  generates: {
    // Typed hooks for every GraphQL operation found under `documents`.
    'src/core/graphql/generated.ts': {
      plugins: ['typescript', 'typescript-operations', 'typescript-react-apollo'],
      config: {
        withHooks: true,
        withResultType: true,
        apolloReactHooksImportFrom: '@apollo/client',
        scalars: {
          ID: 'string',
        },
      },
    },
    // Snapshots of the live schema, checked in so schema drift shows up in
    // code review instead of only at codegen time.
    'src/core/graphql/schema.graphql': {
      plugins: ['schema-ast'],
    },
    'src/core/graphql/introspection.json': {
      plugins: ['introspection'],
    },
  },
};

export default config;
