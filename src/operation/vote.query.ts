import { gql } from '@apollo/client';
import apolloClient from '../apollo-client';
import { GET_CODES } from './election.query';

export const GET_VOTING_CANDIDATES = gql`
  query getCandidates($electionId: String!, $codeId: String!) {
    getCandidates(electionId: $electionId, codeId: $codeId) {
      id
      name
      imageUrl
      createdAt
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
