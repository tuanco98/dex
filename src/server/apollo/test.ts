import { ApolloServer } from "@apollo/server";
import { ApolloServerPluginLandingPageGraphQLPlayground } from "@apollo/server-plugin-landing-page-graphql-playground";
import { expressMiddleware } from "@apollo/server/express4";
import { ApolloServerPluginDrainHttpServer } from "@apollo/server/plugin/drainHttpServer";
import {
	ApolloServerPluginLandingPageLocalDefault,
	ApolloServerPluginLandingPageProductionDefault,
} from "@apollo/server/plugin/landingPage/default";
import { makeExecutableSchema } from "@graphql-tools/schema";
import bodyParser from "body-parser";
import cors from "cors";
import express from "express";
import { useServer } from "graphql-ws/lib/use/ws";
import { createServer } from "http";
import { WebSocketServer } from "ws";
import { GRAPHQL_PORT, IS_USE_PLAYGROUND, NODE_ENV } from "../../config";
import { successConsoleLog } from "../../lib/color-log";
import { resolvers } from "./resolvers";
import { typeDefs } from "./typeDefs/schema";

export const startApolloServer = async () => {
	try {
		const app = express();
		const httpServer = createServer(app);
		// Creating the WebSocket server
		const wsServer = new WebSocketServer({
			// This is the `httpServer` we created in a previous step.
			server: httpServer,
			// Pass a different path here if app.use
			// serves expressMiddleware at a different path
		});
		const schema = makeExecutableSchema({ typeDefs, resolvers });
		const serverCleanup = useServer({ schema }, wsServer);
		const plugins: any[] = IS_USE_PLAYGROUND
			? [ApolloServerPluginLandingPageGraphQLPlayground()]
			: NODE_ENV === "production"
			? [ApolloServerPluginLandingPageProductionDefault({ footer: false })]
			: [ApolloServerPluginLandingPageLocalDefault({ footer: false })];

		plugins.push(ApolloServerPluginDrainHttpServer({ httpServer }));
		plugins.push({
			async serverWillStart() {
				return {
					async drainServer() {
						await serverCleanup.dispose();
					},
				};
			},
		});

		const server = new ApolloServer({
			schema,
			plugins,
		});

		await server.start();
		app.use(
			"/graphql",
			cors<cors.CorsRequest>(),
			bodyParser.json(),
			expressMiddleware(server),
		);
		const PORT = GRAPHQL_PORT;
		// Now that our HTTP server is fully set up, we can listen to it.
		httpServer.listen(PORT, () => {
			successConsoleLog(
				`Server is now running on http://localhost:${PORT}/graphql`,
			);
		});
		// successConsoleLog(`🚀 ${SERVER_NAME} graphql ready at ${url}`);
		// console.log(`Try your health check at: ${url}.well-known/apollo/server-health`);
	} catch (e) {
		throw e;
	}
};

export const startApolloServer2 = async () => {
	try {
		// Create the schema, which will be used separately by ApolloServer and
		// the WebSocket server.
		const schema = makeExecutableSchema({ typeDefs, resolvers });

		// Create an Express app and HTTP server; we will attach both the WebSocket
		// server and the ApolloServer to this HTTP server.
		const app = express();
		const httpServer = createServer(app);

		// Create our WebSocket server using the HTTP server we just set up.
		const wsServer = new WebSocketServer({
			server: httpServer,
			path: "/graphql",
		});
		// Save the returned server's info so we can shutdown this server later
		const serverCleanup = useServer({ schema }, wsServer);

		// Set up ApolloServer.
		const server = new ApolloServer({
			schema,
			plugins: [
				// Proper shutdown for the HTTP server.
				ApolloServerPluginDrainHttpServer({ httpServer }),

				// Proper shutdown for the WebSocket server.
				{
					async serverWillStart() {
						return {
							async drainServer() {
								await serverCleanup.dispose();
							},
						};
					},
				},
			],
		});

		await server.start();
		app.use(
			"/graphql",
			cors<cors.CorsRequest>(),
			bodyParser.json(),
			expressMiddleware(server),
		);

		const PORT = 4000;
		// Now that our HTTP server is fully set up, we can listen to it.
		httpServer.listen(PORT, () => {
			console.log(`Server is now running on http://localhost:${PORT}/graphql`);
		});
	} catch (e) {
		throw e;
	}
};
