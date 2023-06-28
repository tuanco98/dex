import { connectInfra } from "../infra";
import { startApolloServer } from "../server/apollo/apollo";

const start = async () => {
    try {
        await connectInfra()
        await startApolloServer()
    } catch (error) {
        throw error
    }
}

start()