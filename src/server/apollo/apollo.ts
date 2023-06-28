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
			path: "/graphql",
			// serves expressMiddleware at a different path
		});
		const schema = makeExecutableSchema({ typeDefs, resolvers });
		const serverCleanup = useServer(
			{
				schema,
			},
			wsServer,
		);
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
			expressMiddleware(server, {
				context: async (req) => ({
					...req,
				}),
			}),
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
