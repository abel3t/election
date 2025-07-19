import {
  ApolloLink,
  ApolloClient,
  concat,
  HttpLink,
  InMemoryCache,
  DefaultOptions,
  Observable
} from '@apollo/client';
import { onError } from '@apollo/client/link/error';
import { REFRESH_TOKEN } from './operation/auth.mutation';
import jwtDecode from 'jwt-decode';
import { FetchResult } from '@apollo/client/link/core/types';

const API_URL = `${process.env.NEXT_PUBLIC_API_URL}/graphql`;
const httpLink = new HttpLink({ uri: API_URL });

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore'
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all'
  }
};

const callRefreshToken = async (email: string, refreshToken: string) => {
  const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions
  });
  const { data } = await apolloClient.mutate({
    mutation: REFRESH_TOKEN,
    variables: { input: { email, refreshToken } }
  });
  return data;
};

const errorLink = onError(({ graphQLErrors, networkError, operation, forward }) => {
  let shouldRefresh = false;
  if (graphQLErrors) {
    for (let err of graphQLErrors) {
      if (
        err.extensions?.code === 'UNAUTHENTICATED' ||
        err.message?.toLowerCase().includes('token')
      ) {
        shouldRefresh = true;
      }
    }
  }
  if (networkError && networkError.message?.includes('401')) {
    shouldRefresh = true;
  }
  if (shouldRefresh) {
    // Try to refresh token
    const refreshToken = typeof window !== 'undefined' ? localStorage.getItem('refreshToken') : null;
    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    let email: string | null = null;
    if (token) {
      try {
        const decoded: any = jwtDecode(token);
        email = decoded.email || decoded.user?.email || decoded.username || null;
      } catch (e) {
        email = null;
      }
    }
    if (email !== null && refreshToken !== null) {
      return new Observable(observer => {
        callRefreshToken(email as string, refreshToken as string)
          .then((data) => {
            const newToken = data?.refreshToken?.token || data?.refreshToken?.accessToken || data?.refreshToken?.refreshToken;
            const newRefreshToken = data?.refreshToken?.refreshToken;
            if (newToken) {
              localStorage.setItem('token', newToken);
            }
            if (newRefreshToken) {
              localStorage.setItem('refreshToken', newRefreshToken);
            }
            // Retry the failed request
            operation.setContext(({ headers = {} }) => ({
              headers: {
                ...headers,
                authorization: `Bearer ${newToken}`
              }
            }));
            const subscriber = forward(operation).subscribe({
              next: (result) => observer.next(result),
              error: (err) => observer.error(err),
              complete: () => observer.complete(),
            });
            return () => subscriber.unsubscribe();
          })
          .catch((err) => {
            // If refresh fails, force logout
            localStorage.removeItem('token');
            localStorage.removeItem('refreshToken');
            window.location.href = '/login';
            observer.error(err);
          });
      });
    }
  }
});

const authMiddleware = new ApolloLink((operation, forward) => {
  // Always get the latest token from localStorage
  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  if (token) {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: `Bearer ${token}`
      }
    }));
  } else {
    operation.setContext(({ headers = {} }) => ({
      headers: {
        ...headers,
        authorization: ''
      }
    }));
  }
  return forward(operation);
});

const apolloClient = new ApolloClient({
  link: ApolloLink.from([
    errorLink,
    concat(authMiddleware, httpLink)
  ]),
  cache: new InMemoryCache(),
  defaultOptions
});

export default apolloClient;
