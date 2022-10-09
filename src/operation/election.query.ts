import apolloClient from '../apollo-client';
import { gql } from '@apollo/client';

export const GET_ELECTIONS = gql`
  query getElections {
    getElections {
      id
      name
      createdAt
      accountId
    }
  }
`;

export const GET_CANDIDATES = gql`
  query getCandidates($electionId: String!) {
      getCandidates(electionId: $electionId) {
        id
        name
        createdAt
      }
  }
`;

export const GET_CODES = gql`
  query getCodes($electionId: String!) {
    getCodes(electionId: $electionId) {
      id
      isUsed
      downloaded
      createdAt
      isActive
    }
  }
`;

export const getElections = async () => {
  console.log('test nè')
  const result = await apolloClient.query({
    query: GET_ELECTIONS
  });

  return result.data;
}

export const getCandidates = async (electionId: string) => {
  const result = await apolloClient.query({
    query: GET_CANDIDATES,
    variables: { electionId }
  });

  return result.data;
}

export const getCodes = async (electionId: string) => {
  const result = await apolloClient.query({
    query: GET_CODES,
    variables: { electionId }
  });

  return result.data;
}
