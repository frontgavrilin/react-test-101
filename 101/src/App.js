import "fontsource-roboto";
import {
  ApolloClient,
  ApolloProvider,
  InMemoryCache,
  createHttpLink,
} from "@apollo/client";
import MainBar from "./Components/MainBar";
import Page from "./Components/Page";

const httpLink = createHttpLink({
  uri: "https://stage.gql.101internet.ru",
  fetch: fetch,
  headers: {
    Authorization: "Basic MTAxaW50ZXI6dGVzdDEwMQ==",
  },
});

const client = new ApolloClient({
  link: httpLink,
  cache: new InMemoryCache(),
});

function App() {
  return (
    <ApolloProvider client={client}>
      <MainBar />
      <Page />
    </ApolloProvider>
  );
}

export default App;
