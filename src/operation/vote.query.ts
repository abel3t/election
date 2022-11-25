import { gql } from '@apollo/client';
import apolloClient from '../apollo-client';

export const GET_VOTING_CANDIDATES = gql`
  query getVotingCandidates($electionId: String!, $codeId: String!) {
    getVotingCandidates(electionId: $electionId, codeId: $codeId) {
      id
      name
      imageUrl
      createdAt
    }
  }
`;

export const CHECK_CODE = gql`
  query checkCode($input: CheckCodeInput!) {
    checkCode(input: $input) {
      isValid
    }
  }
`;

export const GET_MAX_SELECTED_CANDIDATE = gql`
  query getMaxSelectedCandidate($electionId: String!, $codeId: String!) {
    getMaxSelectedCandidate(electionId: $electionId, codeId: $codeId) {
      maxSelected
    }
  }
`;


export const GET_ELECTION_TITLE = gql`
  query getElectionTitle($electionId: String!) {
    getElectionTitle(electionId: $electionId) {
      title
    }
  }
`;


export const getVotingCandidates = async (
  electionId: string,
  codeId: string
) => {
  const result = await apolloClient.query({
    query: GET_VOTING_CANDIDATES,
    variables: { electionId, codeId }
  });

  if (result?.errors) {
    throw new Error(result?.errors[0]?.message);
  }

  return result.data;
};

export const checkCode = async (electionId: string, codeId: string) => {
  const result = await apolloClient.query({
    query: CHECK_CODE,
    variables: { input: { electionId, codeId } }
  });

  if (result?.errors) {
    throw new Error(result?.errors[0]?.message);
  }

  return result.data;
};

export const getMaxSelectedCandidate = async (
  electionId: string,
  codeId: string
) => {
  const result = await apolloClient.query({
    query: GET_MAX_SELECTED_CANDIDATE,
    variables: { electionId, codeId }
  });

  if (result?.errors) {
    throw new Error(result?.errors[0]?.message);
  }

  return result.data;
};

export const getElectionTitle = async (
  electionId: string
) => {
  const result = await apolloClient.query({
    query: GET_ELECTION_TITLE,
    variables: { electionId }
  });

  if (result?.errors) {
    throw new Error(result?.errors[0]?.message);
  }

  return result.data;
};

