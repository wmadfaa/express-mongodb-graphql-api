import { ApolloServer } from "apollo-server";

import { environment } from "./environment";
import typeDefs from "./queries/testQuery/testQuery.schema";
import resolvers from "./queries/testQuery/testQuery.resolver";

const server = new ApolloServer({
  resolvers,
  typeDefs,
  introspection: environment.apollo.introspection,
  playground: environment.apollo.playground
});

server
  .listen(environment.port)
  .then(({ url }) => console.log(`Server ready at ${url}. `));

// Hot Module Replacement
if (module.hot) {
  module.hot.accept();
  module.hot.dispose(() => console.log("Module disposed. "));
}
