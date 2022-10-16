import { gql } from '@apollo/client';
import apolloClient from '../apollo-client';

export const GET_VOTING_CANDIDATES = gql`
  query getVotingCandidates($electionId: String!, $codeId: String!) {
    getCandidates(electionId: $electionId, codeId: $codeId) {
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

export const getVotingCandidates = async (electionId: string, codeId: string) => {
  const result = await apolloClient.query({
    query: GET_VOTING_CANDIDATES,
    variables: { electionId, codeId }
  });

  return result.data;
}

export const checkCode = async (electionId: string, codeId: string) => {
  const result = await apolloClient.query({
    query: CHECK_CODE,
    variables: { input: { electionId, codeId } }
  });

  return result.data;
}
