import apolloClient from '../apollo-client';
import { gql } from '@apollo/client';

export const CREATE_ELECTION = gql`
  mutation createElection($input: CreateElectionInput!) {
    createElection(input: $input) {
      id
      name
    }
  }
`;

export const CREATE_CANDIDATE = gql`
  mutation createCandidate($input: CreateCandidateInput!) {
    createCandidate(input: $input) {
      name
    }
  }
`;

export const GENERATE_CODES = gql`
  mutation generateCodes($input: GenerateCodesCodeInput!) {
    generateCodes(input: $input) {
      id
      isUsed
      downloaded
      createdAt
    }
  }
`;

export const DELETE_CANDIDATE = gql`
  mutation deleteCandidate($electionId: String!, $candidateId: String!) {
    deleteCandidate(electionId: $electionId, candidateId: $candidateId)
  }
`;

export const DELETE_ELECTION = gql`
  query deleteElection($electionId: String!) {
    deleteElection(electionId: $electionId)
  }
`;

export const CLONE_ELECTION = gql`
  mutation cloneElection($electionId: String!) {
    cloneElection(electionId: $electionId)
  }
`;

export const UPDATE_ELECTION = gql`
  mutation updateElection(
    $electionId: String!
    $name: String!
    $maxSelected: Float!
  ) {
    updateElection(
      electionId: $electionId
      name: $name
      maxSelected: $maxSelected
    )
  }
`;

export const STOP_VOTING = gql`
  mutation stopVoting($electionId: String!) {
    stopVoting(electionId: $electionId)
  }
`;

export const START_VOTING = gql`
  mutation startVoting($electionId: String!) {
    startVoting(electionId: $electionId)
  }
`;

export const createElection = async (name: string, maxSelected: number) => {
  const result = await apolloClient.mutate({
    mutation: CREATE_ELECTION,
    variables: { input: { name, maxSelected } }
  });

  return result.data;
};

export const createCandidate = async (
  electionId: string,
  name: string,
  imageUrl: string
) => {
  const result = await apolloClient.mutate({
    mutation: CREATE_CANDIDATE,
    variables: { input: { name, electionId, imageUrl } }
  });

  return result.data;
};

export const generateCodes = async (electionId: string, amount: number) => {
  const result = await apolloClient.mutate({
    mutation: GENERATE_CODES,
    variables: { input: { amount, electionId } }
  });

  return result.data;
};

export const deleteCandidate = async (
  electionId: string,
  candidateId: string
) => {
  const result = await apolloClient.mutate({
    mutation: DELETE_CANDIDATE,
    variables: { electionId, candidateId }
  });

  return result.data;
};

export const deleteElection = async (electionId: string) => {
  const result = await apolloClient.mutate({
    mutation: DELETE_ELECTION,
    variables: { electionId }
  });

  return result.data;
};

export const cloneElection = async (electionId: string) => {
  const result = await apolloClient.mutate({
    mutation: CLONE_ELECTION,
    variables: { electionId }
  });

  return result.data;
};

export const updateElection = async (
  electionId: string,
  name: string,
  maxSelected: string
) => {
  const result = await apolloClient.mutate({
    mutation: UPDATE_ELECTION,
    variables: { electionId, name, maxSelected }
  });

  if (result?.errors) {
    throw new Error(result?.errors[0]?.message);
  }

  return result.data;
};

export const stopVoting = async (electionId: string) => {
  const result = await apolloClient.mutate({
    mutation: STOP_VOTING,
    variables: { electionId }
  });

  if (result?.errors) {
    throw new Error(result?.errors[0]?.message);
  }

  return result.data;
};

export const startVoting = async (electionId: string) => {
  const result = await apolloClient.mutate({
    mutation: START_VOTING,
    variables: { electionId }
  });

  if (result?.errors) {
    throw new Error(result?.errors[0]?.message);
  }

  return result.data;
};
