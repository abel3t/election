import { ApolloLink, ApolloClient, concat, HttpLink, InMemoryCache, DefaultOptions } from '@apollo/client';
import { REFRESH_TOKEN } from './operation/auth.mutation';
import jwtDecode from 'jwt-decode';
import { useRouter } from 'next/router';

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

  if (guest === 'true') {
    return forward(operation);
  }

  const token = localStorage.getItem('token');
  const logIn = localStorage.getItem('logIn');

  if (!token && logIn !== 'true') {
    window.location.href = '/login';
  }

  operation.setContext({
    headers: {
      authorization: token ? `Bearer ${token}` : ''
    }
  });
  return forward(operation);
});

const apolloClient = new ApolloClient({
  link: concat(authMiddleware, httpLink),
  cache: new InMemoryCache(),
  defaultOptions
});

export default apolloClient;