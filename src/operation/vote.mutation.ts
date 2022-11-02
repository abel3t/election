import { gql } from '@apollo/client';
import apolloClient from '../apollo-client';

export const CREATE_VOTES = gql`
  mutation createVotes($input: CreateVoteInput!) {
    createVotes(input: $input)
  }
`;

export const createVotes = async (
  electionId: string,
  codeId: string,
  candidateIds: string[]
) => {
  const result = await apolloClient.mutate({
    mutation: CREATE_VOTES,
    variables: { input: { electionId, codeId, candidateIds, date: new Date().toISOString() } }
  });

  if (result?.errors) {
    throw new Error(result?.errors[0]?.message);
  }

  return result.data;
};
