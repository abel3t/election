import apolloClient from '../apollo-client';
import { gql } from '@apollo/client';

export const CREATE_ELECTION = gql`
    mutation createElection($input: CreateElectionInput!) {
      createElection(input: $input) {
        id,
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


export const createElection = async (name: string) => {
  const result = await apolloClient.mutate({
    mutation: CREATE_ELECTION,
    variables: { input: { name } }
  });

  return result.data;
}

export const createCandidate = async (electionId: string, name: string) => {
  const result = await apolloClient.mutate({
    mutation: CREATE_CANDIDATE,
    variables: { input: { name, electionId } }
  });

  return result.data;
}

export const generateCodes = async (electionId: string, amount: number) => {
  const result = await apolloClient.mutate({
    mutation: GENERATE_CODES,
    variables: { input: { amount, electionId } }
  });

  return result.data;
}
