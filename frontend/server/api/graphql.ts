import { ApolloServer } from "@apollo/server";
import { buildSchema } from "drizzle-graphql";
import { db } from "../utils/db";

let server: ApolloServer | null = null;

async function getServer() {
  if (!server) {
    const { schema } = buildSchema(db);
    server = new ApolloServer({ schema });
    await server.start();
  }
  return server;
}

export default defineEventHandler(async (event) => {
  const { method } = event;

  if (method === "GET") {
    // Return GraphiQL playground HTML for GET requests
    return `
      <!DOCTYPE html>
      <html lang="en">
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>GraphiQL</title>
          <style>
            body {
              height: 100%;
              margin: 0;
              width: 100%;
              overflow: hidden;
            }
            #graphiql {
              height: 100vh;
            }
          </style>
        </head>
        <body>
          <div id="graphiql">Loading...</div>
          <script
            crossorigin
            src="https://unpkg.com/react@17/umd/react.production.min.js"
          ></script>
          <script
            crossorigin
            src="https://unpkg.com/react-dom@17/umd/react-dom.production.min.js"
          ></script>
          <link rel="stylesheet" href="https://unpkg.com/graphiql@2.4.7/graphiql.min.css" />
          <script
            crossorigin
            src="https://unpkg.com/graphiql@2.4.7/graphiql.min.js"
          ></script>
          <script>
            const fetcher = GraphiQL.createFetcher({
              url: '/api/graphql',
            });
            ReactDOM.render(
              React.createElement(GraphiQL, { fetcher: fetcher }),
              document.getElementById('graphiql')
            );
          </script>
        </body>
      </html>
    `;
  }

  const body = await readBody(event);
  const apolloServer = await getServer();

  const response = await apolloServer.executeOperation({
    query: body.query,
    variables: body.variables,
    operationName: body.operationName,
  });

  if (response.body.kind === "single") {
    return response.body.singleResult;
  }

  return response.body;
});
