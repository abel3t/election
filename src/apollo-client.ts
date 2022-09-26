
import { ApolloClient, gql, InMemoryCache } from '@apollo/client';

const client = new ApolloClient({
  uri: "https://countries.trevorblades.com",
  cache: new InMemoryCache(),
});

export const getCountries = async () => {
  const { data } = await client.query({
    query: gql`
      query Countries {
        countries {
          code
          name
          emoji
        }
      }
    `,
  });

  return data;
}




export default client;