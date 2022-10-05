import { gql } from '@apollo/client';

export const LOGIN =  gql`
  mutation Login($input: AccountLoginInput!) {
    login(input: $input) {
      token
      refreshToken
      accessToken
    }
  }
`;