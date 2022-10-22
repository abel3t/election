import apolloClient from '../apollo-client';
import { gql } from '@apollo/client';

export const GET_ELECTIONS = gql`
  query getElections {
    getElections {
      id
      name
      createdAt
      accountId
      maxSelected
    }
  }
`;

export const GET_ELECTION = gql`
  query getElection($electionId: String!) {
    getElection(electionId: $electionId) {
      id
      name
    }
  }
`;

export const GET_CANDIDATES = gql`
  query getCandidates($electionId: String!) {
    getCandidates(electionId: $electionId) {
      id
      name
      electionId
      imageUrl
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

export const GET_ELECTION_RESULT = gql`
  query getElectionResult($electionId: String!) {
    getElectionResult(electionId: $electionId) {
      id
      name
      votes
      totalCodes
      imageUrl
      codeIds
      createdAt
    }
  }
`;

export const getElections = async () => {
  const result = await apolloClient.query({
    query: GET_ELECTIONS
  });

  if (result?.errors) {
    throw new Error(result?.errors[0]?.message);
  }

  return result.data;
};

export const getElection = async (electionId: string) => {
  const result = await apolloClient.query({
    query: GET_ELECTION,
    variables: { electionId }
  });

  if (result?.errors) {
    throw new Error(result?.errors[0]?.message);
  }

  return result.data;
};

export const getCandidates = async (electionId: string) => {
  const result = await apolloClient.query({
    query: GET_CANDIDATES,
    variables: { electionId }
  });

  if (result?.errors) {
    throw new Error(result?.errors[0]?.message);
  }

  return result.data;
};

export const getCodes = async (electionId: string) => {
  const result = await apolloClient.query({
    query: GET_CODES,
    variables: { electionId }
  });

  if (result?.errors) {
    throw new Error(result?.errors[0]?.message);
  }

  return result.data;
};

export const getElectionResult = async (electionId: string) => {
  const result = await apolloClient.query({
    query: GET_ELECTION_RESULT,
    variables: { electionId }
  });

  if (result?.errors) {
    throw new Error(result?.errors[0]?.message);
  }

  return result.data;
};
