import { gql } from '@apollo/client';
import apolloClient from '../apollo-client';

export const LOGIN = gql`
  mutation Login($input: AccountLoginInput!) {
    login(input: $input) {
      token
      refreshToken
      accessToken
    }
  }
`;

export const REFRESH_TOKEN = gql`
  mutation refreshToken($input: RefreshTokenInput!) {
    refreshToken(input: $input) {
      token
      refreshToken
      accessToken
    }
  }
`;

export const login = async (email: string, password: string) => {
  const { data } = await apolloClient.mutate({
    mutation: LOGIN,
    variables: { input: { email, password } },
  });

  return data;
}