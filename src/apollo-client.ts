import { ApolloLink, ApolloClient, concat, HttpLink, InMemoryCache, DefaultOptions } from '@apollo/client';
import { REFRESH_TOKEN } from './operation/auth.mutation';
import jwtDecode from "jwt-decode";

const httpLink = new HttpLink({ uri: 'http://localhost:8080/graphql' });

const defaultOptions: DefaultOptions = {
  watchQuery: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'ignore',
  },
  query: {
    fetchPolicy: 'no-cache',
    errorPolicy: 'all',
  },
}

const callRefreshToken = async (email: string, refreshToken: string) => {
  const apolloClient = new ApolloClient({
    link: httpLink,
    cache: new InMemoryCache(),
    defaultOptions,
  });

  const { data } = await apolloClient.mutate({
    mutation: REFRESH_TOKEN,
    variables: { input: { email, refreshToken } },
  });

  return data;
}

const authMiddleware = new ApolloLink((operation, forward) => {
  const token = localStorage.getItem('token');
  const refreshToken = localStorage.getItem('refreshToken');
  const expiredTime = localStorage.getItem('expiredTime');

  console.log({
    token,
    refreshToken
  })

  if (!expiredTime || expiredTime < new Date().toISOString()) {
    if (token && refreshToken) {
      const payload: any = jwtDecode(token);
      callRefreshToken(payload.email, refreshToken)
        .then(data => {
          localStorage.setItem('token', data.refreshToken?.token);
          const date = new Date();

          date.setHours(date.getHours() + 1);
          localStorage.setItem('expiredTime', date.toISOString());
        })
    }
  }

  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : "",
    },
  });
  return forward(operation);
});

const apolloClient = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache(),
  defaultOptions,
});

export default apolloClient;