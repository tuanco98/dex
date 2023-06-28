import gql from "graphql-tag";

const GQLUser = gql`
    type TPermit {
        nonce: Float
        owner: String
        spender: String
        value: String
        deadline: Float
        v: Float
        r: String
        s: String
    }

    type User {
        address: String
        permit: TPermit
        sponsor: String
        pending_ref: String
        ref_code: String
    }

    type UserRefInfo {
        ref_code: String
        total_users: Int
        total_open_volume: String
        total_usdc_profits: String
        unclaimed_usdc_rewards: String
    }

    type UserDetails {
        address: String
        profit_sharing: Int
        copiers: Int
        win_rate: Int 
        pnl: String 
        roi: String 
        total_trades: Int 
        copiers_pnl: String
        total_balance: String 
        trade_days: Int
        last_trade_at: Date
        signature: String
        rank_roi: Int
        #description: String
        #username
    }

`;
const GQLOrder = gql`
    type Order {
        id: String
        owner: String
        pairId: Float
        isLong: Boolean
        amount: String
        leverage: Float
        sl: String
        tp: String
        limitPrice: String
        limitExpire: Float
        isActive: Boolean
        orderAt: Date
        pnl: String
        entryPrice:String
        liquidationPrice:String
        orderType:String
        closePrice:String
        closeFee:String
        openFee:String
        isCopy:Boolean
        updateAt:Date
        fundingTracker:Float
        masterAddress:String
        masterShareAmount: String
        signature:String
    }
`;
const GQLDashboard = gql`
    type StatisticDashboard {
        totalUniqueUser: Int
        totalUniqueUserOpenPosition: Int
        totalOpenPosition: Int
        totalPnlProfitForUser: String
        totalPnlLossForUser: String
        totalQueueTransactionPending: Int
        totalTriggerGasLess: Int
        totalTriggerGasLessFail: Int
        totalTriggerGasLessSuccess: Int
        totalFeeTriggerGasLess: String
        totalFeeTriggerGasLessFail: String
        totalFeeTriggerGasLessSuccess: String
        totalOracleFeeTriggerGasLess: String
        totalTokenDepositPool: String
        totalTokenWithdrawPool: String
    }
    type ProfitUserChart {
        id: Float
        totalLossPnl: String
        totalProfitPnl: String
    }
    type PoolEventChart {
        id: Float
        totalDeposit: String
        totalWithdraw: String
    }
`
const GQLRequestCommission = gql`
    type ListRequestCommission {
        _id: String
        address: String
        create_at: Date
        update_at: Date
        request_amount: String,
        remain_amount: String,
        txid: String
        error: String
    }

    type RewardCommission {
        address: String
        request_amount: String
        remain_amount: String
        txid: String
    }
`;
const GQLNotification = gql`
    type PayloadPosition {
        orderId: String
        pairId: Int
        isLong: Boolean
        price: String
        pnl: String
        masterId: String
    }
    type NotificationPayLoad {
        reason: String
        position: PayloadPosition
        amount: String
        txid: String  
        oracleFee: String
    }
    type Notification {
        address: String
        status: String
        type: String
        id: String
        payload: NotificationPayLoad
        createAt: Date
        updateAt: Date
        readAt: Date
    }
    type NotificationSub {
        address: String
        status: String
        type: String
        id: String
        payload: NotificationPayLoad
        createAt: Date
        readAt: Date
        action: String
    }
`;
const GQLPair = gql`
    type Pair{
        source: [Source]
        pair_id: Int
        pair_name: String
        create_at: Date
        max_leverage: Float
        min_leverage: Float
        openFee:String
        closeFee:String
        spread:String
        liqThreshold:String
        minAge:Int
        price_24h: String
        current_price: String
        chainlink_price:String
        fundingTracker:Float
    }

    type Source {
        name: String
        value: String
    }

    type PairSub{
      pair_id:Int
      price:String
      chainlink_price:String
      timestamp:Float
   }

    type SystemStatusSub{
        latest_block_number:Float
        latest_block_consumed:Float
        chainlink_contract_status:Boolean
        base_fee:String
        l1_gas_fee:String
        update_at:Float
    }
`;

const GQLCopyTrade = gql`
    type ListMaster {
        address: String
        pnl: String
        roi: String
        total_copiers: Int
        total_pnl_copiers: String
        total_trades: Int
        win_rate: Int
        signature: String 
        percent_share: Float
    }

    type ListUserCopier {
        address: String
        pnl: String
        roi: String
        total_days_followed: Int
    }

    type ListUserMaster {
        address: String
        total_current_position: Int
        total_copy_position: Int
        pnl: String
        percent_share: Float
        signature: String
        max_amount_copy: String
        fixed_amount: String
        percent_amount: Int
        stop_loss_copy: Int
        take_profit_copy: Int
    }

    type ListPastTrade {
        id:String
        owner: String
        pairId: Float
        isLong: Boolean
        amount: String
        leverage: Float
        sl: String
        tp: String
        limitPrice: String
        limitExpire: Float
        isActive: Boolean
        orderAt: Date
        updateAt: Date
        pnl: String
        entryPrice:String
        liquidationPrice:String
        orderType:String
        closePrice:String
        closeFee:String
        openFee:String
        copier: Int
        isCopy: Boolean
    }
`;

const GQLLeaderBoard = gql`
    type LeaderBoard {
        address: String
        pnl: String
        win: Int
        loss: Int
        volume: String
        avg_leverage: Float
    }
`;

const GQLDataPrice = gql`
    type Price {
        open: String,
        close: String,
        highest: String,
        lowest: String,
        chainlink_price:String,
        timestamp: Float
    }
`;

const GQLPoolInfo = gql`
    type PoolInfo {
        apr: Float
    }
`;

const GQLInput = gql`
    input IpPermit {
        nonce: Float!
        owner: String!
        spender: String!
        value: String!
        deadline: Float!
        v: Float!
        r: String!
        s: String!
    }
    input IpOrder {
        isLong: Boolean!
        orderType: OrderType!
        pairId: Int!
        leverage: Float!
        amount: String!
        tp: String!
        sl: String!
    }
    input IpGasLess {
        owner: String!
        deadline: Float
        nonce: Int
        signature: String!
    }

    input SortFilterBy {
        fieldType: EFieldType
        arrangeType: ESortByType
    }

    input IpCopyRequest{
        """
            checksum address
        """
        owner: String! 
        """
            checksum address
        """
        master: String! 
        """
            atomic in 1e6
        """
        maxAmount: String! 
        """
            percent. Example: 100% -> value = 1000000
        """
        sharePercent: Float! 
        """
            atomic in 1e6
        """
        fixedAmount: String! 
        """
            percent. Example: 100% -> value = 1000000
        """
        percentAmount: Float! 
        """
            percent. Example: 100% -> value = 1000000
        """
        percentTp: Float! 
        """
           percent. Example: 100% -> value = 1000000
        """
        percentSl: Float!
        signature: String!
    }
`;

const GQLUserEpoch = gql`
    type Epoch {
        epochTime:Int
        startTime:Int
        startEpoch:Int
    }

    type UserEpoch{
        master:String
        epoch:Int
        totalMasterShare:String
        updateAt:Date
        isWithdraw:Boolean
        withdrawTxid:String
        isEnd:Boolean
        startAt:Date
        endAt:Date
    }
`;

const GQLResponse = gql`
    ${GQLPair}
    ${GQLDataPrice}
    ${GQLCopyTrade}
    ${GQLRequestCommission}
    ${GQLNotification}
    ${GQLDashboard}

    type ResSetSponsor{
        sponsor:String
        pending_ref:String
        alert:String
    }

    type ResPairsGet{
        total:Int
        data:[Pair]
    }

    type DataChart {
        totalItem: Int
        prices: [Price]
    }
    type ResProfitUserChart {
        totalItem: Int
        data: [ProfitUserChart]
    }
    type ResPoolEventChart {
        totalItem: Int
        data: [PoolEventChart]
    }
    type TopMasters {
        total: Int
        data: [ListMaster]
    }

    type UserCopiers {
        total: Int
        data: [ListUserCopier]
    }

    type UserMasters {
        total: Int
        data: [ListUserMaster]
    }

    type CurrentTrades {
        total: Int
        data: [Order]
    }

    type PastTrades {
        total: Int
        data: [ListPastTrade]
    }

    type RequestCommission {
        total: Int
        data: [ListRequestCommission]
    }

    type ResOrdersGet {
        total: Int
        data: [Order]
    }
    type Notifications {
        total: Int
        totalNotRead: Int
        data: [Notification]
    }
    type UserEpoches {
        total: Int
        data: [UserEpoch]
    }
`;

const GQLEnum = gql`
    enum EOrderType{
        position
        order
        history
    }

    enum OrderType {
        MARKET
        LIMIT
        STOP
    }

    enum SortTimeType {
        Daily 
        Weekly
        Monthly
        All
    }

    enum ESortByType {
        ASC
        DESC
    }
   
    enum ESortFieldListMaster {
        pnl
        roi
        total_copiers
        total_pnl_copiers
        total_trades
        win_rate
        percent_share
    }
    enum EEditPositionType {
        ADD_COLLATERAL
        REMOVE_COLLATERAL
        INC_POSITION
        DEC_POSITION
    }
    enum ETimeFilter {
        """SevenDays"""
        D7
        """ThirtyDays"""
        D30
        All
    }

    enum ETypeTradeFilter {
        Standard
        Copy
        All
    }

    enum ETypeRequest {
        Success
        Pending
        All
    }

    enum ETypeActivity {
        Current 
        Past
        All
    }

    enum EFieldType {
        amount
        leverage
        sl
        tp
        orderAt
        entryPrice
        liquidationPrice
        openFee
        updateAt
        fundingTracker
        closeFee
    }

    enum EEpochFilter {
       all
       not_end
       available_for_withdraw
       withdrawn
    }

    enum EEpochSort {
       epoch_asc
       epoch_desc
    }
    enum ESortFieldLeaderBoard {
        pnl
        win
        loss
        volume
        avg_leverage
    }
    enum EReadNotifyType {
        ALL
        SINGLE
    }
`;
export {
    GQLUser,
    GQLInput,
    GQLResponse,
    GQLOrder,
    GQLPair,
    GQLPoolInfo,
    GQLEnum,
    GQLLeaderBoard,
    GQLCopyTrade,
    GQLNotification,
    GQLUserEpoch,
    GQLDashboard
};
