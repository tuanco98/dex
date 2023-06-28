import gql from "graphql-tag";
import { PaginationInput } from "./common";
import {
   GQLDashboard,
	GQLEnum,
	GQLInput,
	GQLLeaderBoard,
	GQLNotification,
	GQLOrder,
	GQLPoolInfo,
	GQLResponse,
	GQLUser,
   GQLUserEpoch,
} from "./custom";

const version = "0.0.0";

const typeDefs = gql`
    """
    API_VERSION = ${version}
    """
   scalar Date
   scalar JSON
   ${GQLUser}
   ${GQLOrder}
   ${GQLLeaderBoard}
   ${GQLInput}
   ${GQLResponse}
   ${GQLPoolInfo}
   ${GQLEnum}
   ${GQLNotification}
   ${GQLUserEpoch}
   ${GQLDashboard}

   type Query{
      #Trading
      dex_user_info(address: String): User
      dex_user_orders(order_type:EOrderType!,pair_id:Int!,${PaginationInput}):ResOrdersGet
      dex_user_closed_order(id:String!):Order
      #Referral
      dex_user_ref_info(address: String!):UserRefInfo
      dex_list_request_commission(${PaginationInput},addressFilter: String, timeFilterBy: ETimeFilter, typeRequestBy: ETypeRequest):RequestCommission
      #Chart
      dex_pairs_get(${PaginationInput}):ResPairsGet
      dex_pair_info(pair_id:Int!):Pair
      dex_chart_data(pair_id:Int!, time_range: Int,from:Float,to:Float):DataChart
      #Support
      dex_get_signature(private_key: String!, timestamp: Float!): String
      showConfig: JSON
      apiVersion: String,
      get_error_code: JSON
      dex_user_get_sign_gasless(order: IpOrder!, private_key: String!, limitPrice: String, limitExpire: Float, deadline: Float): JSON
      #Pool
      dex_pool_info: PoolInfo
      #Leader Board
      dex_leader_board(sortTimeBy: SortTimeType, sortFieldBy: ESortFieldLeaderBoard, sortBy: ESortByType): [LeaderBoard]
      #Copy Trade
      dex_top_masters(sortTimeBy: SortTimeType, sortFieldBy: ESortFieldListMaster, sortBy: ESortByType, ${PaginationInput},user_address: String): TopMasters
      dex_user_details(address: String!, timeFilterBy: ETimeFilter): UserDetails
      dex_user_current_trades(${PaginationInput}, address: String!, timeFilterBy: ETimeFilter, typeTradeFilterBy: ETypeTradeFilter): CurrentTrades
      dex_user_past_trades(${PaginationInput}, address: String!, timeFilterBy: ETimeFilter, typeTradeFilterBy: ETypeTradeFilter): PastTrades
      dex_user_activity(${PaginationInput}, address: String!, timeFilterBy: ETimeFilter, typeTradeFilterBy: ETypeTradeFilter, typeActivity: ETypeActivity, masterFilterAddress: String, sortFilterBy: SortFilterBy): CurrentTrades
      dex_user_copiers(${PaginationInput}, address: String!, timeFilterBy: ETimeFilter): UserCopiers
      dex_user_masters(${PaginationInput}, address: String!, timeFilterBy: ETimeFilter): UserMasters
      dex_user_order_details(id: String!, orderType: OrderType): Order
      # notification
      dex_user_notifications(address: String!, ${PaginationInput}): Notifications
      dex_user_available_epochs_withdraw(address:String!):[Int]
      dex_epoch_info:Epoch
      dex_user_epochs(address:String!,filter:EEpochFilter,sort:EEpochSort,${PaginationInput}):UserEpoches
      # dashboard
      dex_dashboard_statistic_get (filter: SortTimeType): StatisticDashboard
      dex_dashboard_profit_for_user_chart_get (filter: SortTimeType): ResProfitUserChart
      dex_dashboard_pool_event_chart_get (filter: SortTimeType): ResPoolEventChart
   }

   type Mutation{
      dex_user_login(address:String!,timestamp:Float!,signature:String!,duration_sec:Int):String 
      #Support
      dex_user_mint_token_demo(address: String!): String
      dex_user_set_permit(permit:IpPermit!):String
      #Referral
      dex_set_pending_ref(ref_code:String):ResSetSponsor
      dex_user_request_commission(request_amount: String!): String
      dex_user_reward_commission(_id: String!): RewardCommission
      #Trading
      dex_user_cancel_limit_order(_id: String!, gasLess: IpGasLess!): String
      dex_user_edit_limit_order(_id: String! limitPrice: Float! orderType: OrderType!): String
      dex_user_update_limit_gasless_order(orderId: String! tp: String! sl: String! gasLess: IpGasLess!): String
      dex_user_create_gasless_order(order: IpOrder!,gas_less: IpGasLess!,limitPrice: String,limitExpire: Float): String
      dex_user_close_gasless_order(orderId: String!, gasLess: IpGasLess!): String
      dex_user_set_ref_code(ref_code: String!): String
      # POOL
      dex_user_deposit_pool_with_gasless(amount: String!,gasLess: IpGasLess!): String
      dex_user_withdraw_pool_with_gasless(amount: String!,gasLess: IpGasLess!): String
      #Copy
      dex_user_set_share_fee(new_share_fee:Float!, gasLess:IpGasLess!):String
      dex_user_cancel_copy_gasless(master_address:String!, sign: String! gasLess:IpGasLess!):String
      dex_user_copy_request(copy_request:IpCopyRequest!):String
      # edit position
      dex_user_edit_position_gasless(id: String!, amount: String, editType: EEditPositionType!, gasLess: IpGasLess!):String
      #profit share
      dex_user_withdraw_epoch_gasless(epochs: [Float]!, gasLess: IpGasLess!): String
      #notify
      dex_user_read_notification(readType: EReadNotifyType!, id: String): String
   }

   type Subscription{
      dex_current_price_sub(pairs:[Int]):PairSub
      dex_system_status:SystemStatusSub
      dex_user_notification_sub(address:String!): NotificationSub
      dex_user_active_order_sub(address:String!): Order
   }
`;

export { typeDefs, version };
