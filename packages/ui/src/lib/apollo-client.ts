import { ApolloClient, InMemoryCache, createHttpLink } from '@apollo/client';

const httpLink = createHttpLink({
  uri: 'http://192.168.70.176:8080/graphql', // Your GraphQL server URL
});

export const apolloClient = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
}); 