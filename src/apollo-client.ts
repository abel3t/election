import {
  ApolloLink,
  ApolloClient,
  concat,
  HttpLink,
  InMemoryCache,
  DefaultOptions,
  Observable
} from '@apollo/client';
import { REFRESH_TOKEN } from './operation/auth.mutation';
import jwtDecode from 'jwt-decode';
import { FetchResult } from '@apollo/client/link/core/types';
import { subscribe } from 'graphql/execution';

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

const authMiddleware = new ApolloLink((operation, forward) => {
  const guest = localStorage.getItem('guest');
  const logIn = localStorage.getItem('logIn');

  if (guest === 'true' || logIn === 'true') {
    return forward(operation);
  }

  let token = localStorage.getItem('token');
  const expiredTime = localStorage.getItem('expiredTime') || '';
  const refreshToken = localStorage.getItem('refreshToken');

  if (!token && logIn !== 'true') {
    window.location.href = '/login';
  }

  if (expiredTime && expiredTime > new Date().toISOString()) {
    operation.setContext({
      headers: {
        authorization: token ? `Bearer ${token}` : ''
      }
    });

    return forward(operation);
  }

  return new Observable<FetchResult>((observer) => {
    if (token && refreshToken) {
      const payload: any = jwtDecode(token);
      callRefreshToken(payload.email, refreshToken)
        .then((data) => {
          if (data.errors) {
            console.log(data.errors);
            window.location.href = '/login';
          }

          if (data.refreshToken?.token) {
            token = data.refreshToken?.token;
            localStorage.setItem('token', `${token}`);
          }

          const date = new Date();
          date.setHours(date.getHours() + 1);
          localStorage.setItem('expiredTime', date.toISOString());

          operation.setContext({
            headers: {
              authorization: token ? `Bearer ${token}` : ''
            }
          });

          forward(operation).subscribe(observer);
        })
        .catch((error) => {
          localStorage.clear();
          console.log(error);
          window.location.href = '/login';
        });
    }
  });
});

const apolloClient = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache(),
  defaultOptions
});

export default apolloClient;
