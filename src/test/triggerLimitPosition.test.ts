// import { connectWeb3 } from "../infra/blockchain/web3"
// import { MILLISECOND_PER_ONE_DAY } from "../lib/constants"
// import { CreateOrderGasLess } from "../server/apollo/input/createGasLessInput"

// const test = async () => {
//     await connectWeb3()
    
//     // const params: CreateOrderGasLess = {
//     //     order:{
//     //         isLong: false,
//     //         orderType: 'MARKET',
//     //         pairId: 1,
//     //         leverage: 10,
//     //         amount: "10000000",
//     //         tp: "1000",
//     //         sl: "1000"
//     //     },
//     //     gas_less: {
//     //         owner:"0x1866F3e63347E63618a79e5a7f8dD937a42556bb",
//     //         deadline:1677055602733,
//     //         nonce:0,
//     //         signature: ''
//     //     },
//     //     limitExpire: Math.floor((new Date().getTime() + MILLISECOND_PER_ONE_DAY) / 1000),
//     //     limitPrice:  "200000"
//     // }
//     // const sign = await getSignatureLimitPosition(params, "9a14326e342d35c420c88b917cdbf1d0237a783faa97685704e8348dc3570c0a")
//     // const input = {
//     //     owner: params.gas_less.owner,
//     //     isLong: params.order.isLong,
//     //     orderType: EOrderType[params.order.orderType],
//     //     pairId: params.order.pairId,
//     //     leverage: params.order.leverage,
//     //     expire: params.limitExpire || new Date().getTime(),
//     //     amount: params.order.amount,
//     //     limitPrice: params.limitPrice || "0",
//     //     tp: params.order.tp,
//     //     sl: params.order.sl,
//     //     signature: sign
//     // }
//     // const receipt = await trading_methods.OpenLimitPosition(input)
//     // console.log({receipt})
// }

// test()