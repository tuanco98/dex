// import { DAO } from "../infra/database/mongo/methods"
// import { collections, connectMongo } from "../infra/database/mongo/mongo"

// const createPair = async () => {
//     await DAO.pairs.create_pair({
//         pair_id: 1,
//         pair_name: 'BTC/USD',
//         source_pair: [
//             { name: 'Pyth', value: '0xf9c0172ba10dfa4d19088d94f5bf61d3b54d5bd7483a322a982e1373ee8ea31b' },
//             { name: "Chainlink", value: '0x6550bc2301936011c1334555e62A87705A81C12C' }
//         ],
//         min_leverage: 4,
//         max_leverage: 150
//     })
//     await DAO.pairs.create_pair({
//         pair_id: 2,
//         pair_name: 'ETH/USD',
//         source_pair: [
//             { name: 'Pyth', value: '0xca80ba6dc32e08d06f1aa886011eed1d77c77be9eb761cc10d72b7d0a2fd57a6' },
//             { name: "Chainlink", value: '0x62CAe0FA2da220f43a51F86Db2EDb36DcA9A5A08' }
//         ],
//         min_leverage: 4,
//         max_leverage: 150
//     })
//     console.log('Create success')
// }

// const create_trades = () => {
//     try {
//         // const dataTrade: TTrade = {
//         //     isActive: true,
//         //     isLong: true,
//         //     pairId: 0,
//         //     leverage: 0,
//         //     amount: 0,
//         //     tp: 0,
//         //     sl: 0,
//         // }
//     } catch (error) {
//         throw error
//     }
// }

// const create_copy_proof = async () => {
//     const dataUsers = await collections.users.find({ address: { $ne: '0x37400ec9cf7299018f8cf5ca26b57b54190286fd' } }).limit(10).toArray()
//     for (const user of dataUsers) {
//         await collections.copy_proofs.insertOne({
//             owner: user.address,
//             master: "0x37400ec9cf7299018f8cf5ca26b57b54190286fd",
//             maxAmount: '0',
//             createAt: new Date(),
//             fixedAmount: 0,
//             percentAmount: 0,
//             updateAt: new Date(),
//             isActive: true,
//             signature: "Testing",
//             percentTp: 0,
//             percentSl: 0,
//             sharePercent: 0,
//             lowerOwner: 'string',
//             lowerMaster: 'string'
//         })
//     }
//     console.log('Create successful');
// }

// const start = async () => {
//     await connectMongo()
//     await create_copy_proof()
// }
// start()