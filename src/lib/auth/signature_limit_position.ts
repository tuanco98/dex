import { verifyTypedData } from "viem"
import { OPEN_POSITION_CONTRACT_ADDRESS } from "../../config"
import { EOrderType } from "../../infra/blockchain/viem/types/enum"
import { CreateOrderGasLess } from "../../server/apollo/input/createGasLessInput"
import { GetDomain } from "./helper"

const LIMIT_POSITION = {
    LimitPosition: [
        { name: "owner", type: "address" },
        { name: "isLong", type: "bool" },
        { name: "orderType", type: "uint8" },
        { name: "pairId", type: "uint16" },
        { name: "leverage", type: "uint32" },
        { name: "expire", type: "uint32" },
        { name: "amount", type: "uint256" },
        { name: "limitPrice", type: "uint256" },
        { name: "tp", type: "uint256" },
        { name: "sl", type: "uint256" },
    ],
}

const verifySignatureLimitPosition = async (params: CreateOrderGasLess) => {
    const domain: any = GetDomain({ verifyingContract: OPEN_POSITION_CONTRACT_ADDRESS })
    const values = {
        owner: params.gas_less.owner,
        isLong: params.order.isLong,
        orderType: EOrderType[params.order.orderType],
        pairId: params.order.pairId,
        leverage: params.order.leverage,
        expire: params.limitExpire || new Date().getTime(),
        amount: params.order.amount,
        limitPrice: params.limitPrice || "0",
        tp: params.order.tp,
        sl: params.order.sl,
    }
    const verify = await verifyTypedData({
        address: params.gas_less.owner as any,
        domain,
        types: LIMIT_POSITION,
        primaryType: "LimitPosition",
        message: values,
        signature: params.gas_less.signature as any,
    })
    return verify
}
export { verifySignatureLimitPosition }
