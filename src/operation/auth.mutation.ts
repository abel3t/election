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
  const result = await apolloClient.mutate({
    mutation: LOGIN,
    variables: { input: { email, password } }
  });

  if (result?.errors) {
    throw new Error(result?.errors[0]?.message);
  }

  return result?.data;
};
