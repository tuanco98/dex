import { connectInfra, pair_controller } from "../infra"
import { sleep } from "../lib/utils"

const test = async () => {
    await connectInfra()
    pair_controller.getPair(1).updatePrice(22500)
    await sleep(1000)
    pair_controller.getPair(1).updatePrice(21000)
    await sleep(3000)
}

export {
    test as LiquidationTest
}