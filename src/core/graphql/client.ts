import { ApolloClient, createHttpLink, from, InMemoryCache } from '@apollo/client';
import { setContext } from '@apollo/client/link/context';
import { onError } from '@apollo/client/link/error';

const errorLink = onError(({ graphQLErrors, networkError }) => {
  if (graphQLErrors)
    graphQLErrors.forEach(({ message, locations, path }) =>
      console.error(`[GraphQL error]: Message: ${message}, Location: ${locations}, Path: ${path}`)
    );
  if (networkError) console.error(`[Network error]: ${networkError}`);
});

const httpLink = createHttpLink({
  uri: import.meta.env.VITE_GRAPHQL_ENDPOINT,
});

// The Sampark shell does a Firebase sign-in and hands the app a JWT via
// localStorage['ApplicationToken']; the GraphQL backend authenticates by
// looking that token up directly. This is a deliberate exception to the
// "never store tokens in localStorage" rule that otherwise applies (see
// CLAUDE.md) — REST calls (apiClient.ts) use cookie/CSRF instead, because
// that flow predates this shell handoff and isn't part of it. Read fresh
// inside this callback (not captured in an outer const) so a token that
// only becomes available after this module first evaluates is still picked
// up on the next request.
const authLink = setContext((_, { headers }) => ({
  headers: {
    ...headers,
    authorization: `Bearer ${localStorage.getItem('ApplicationToken')}`,
    sourceapp: 'sampark',
  },
}));

export const apolloClient = new ApolloClient({
  link: from([errorLink, authLink, httpLink]),
  cache: new InMemoryCache(),
  defaultOptions: {
    watchQuery: { fetchPolicy: 'network-only', errorPolicy: 'all' },
    query: { fetchPolicy: 'network-only', errorPolicy: 'all' },
    mutate: { errorPolicy: 'all' },
  },
});
