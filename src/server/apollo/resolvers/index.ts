import { NODE_ENV, SERVER_NAME } from "../../../config";
import { dex_set_pending_ref } from "./mutation/dex_set_pending_ref";
import { dex_user_cancel_copy_gasless } from "./mutation/dex_user_cancel_copy_gasless";
import { dex_user_close_gasless_order } from "./mutation/dex_user_close_gasless_order";
import { dex_user_copy_request } from "./mutation/dex_user_copy_request";
import { dex_user_create_gasless_order } from "./mutation/dex_user_create_gasless_order";
import { dex_user_deposit_pool_with_gasless } from "./mutation/dex_user_deposit_pool_with_gasless";
import { dex_user_edit_limit_order } from "./mutation/dex_user_edit_limit_order";
import { dex_user_edit_position_gasless } from "./mutation/dex_user_edit_position_gasless";
import { dex_user_login } from "./mutation/dex_user_login";
import { dex_user_mint_token_demo } from "./mutation/dex_user_mint_token_demo";
import { dex_user_request_commission } from "./mutation/dex_user_request_commission";
import { dex_user_reward_commission } from "./mutation/dex_user_reward_commission";
import { dex_user_set_permit } from "./mutation/dex_user_set_permit";
import { dex_user_set_ref_code } from "./mutation/dex_user_set_ref_code";
import { dex_user_set_share_fee } from "./mutation/dex_user_set_share_fee";
import { dex_user_update_limit_gasless_order } from "./mutation/dex_user_update_limit_gasless_order";
import { dex_user_withdraw_pool_with_gasless } from "./mutation/dex_user_withdraw_pool_with_gasless";
import { api_version } from "./queries/api_version";
import { dex_chart_data } from "./queries/dex_chart_data";
import { dex_get_signature } from "./queries/dex_get_signature";
import { dex_leader_board } from "./queries/dex_leader_board";
import { dex_list_request_commission } from "./queries/dex_list_request_commission";
import { dex_pairs_get } from "./queries/dex_pairs_get";
import { dex_pair_info } from "./queries/dex_pair_info";
import { dex_pool_info } from "./queries/dex_pool_info";
import { dex_top_masters } from "./queries/dex_top_masters";
import { dex_user_activity } from "./queries/dex_user_activity";
import { dex_user_closed_order } from "./queries/dex_user_closed_order";
import { dex_user_copiers } from "./queries/dex_user_copiers";
import { dex_user_current_trades } from "./queries/dex_user_current_trades";
import { dex_user_details } from "./queries/dex_user_details";
import { dex_user_get_sign_gasless } from "./queries/dex_user_get_sign_gasless";
import { dex_user_info } from "./queries/dex_user_info";
import { dex_user_masters } from "./queries/dex_user_masters";
import { dex_user_orders } from "./queries/dex_user_orders";
import { dex_user_past_trades } from "./queries/dex_user_past_trades";
import { dex_user_ref_info } from "./queries/dex_user_ref_info";
import { get_error_code } from "./queries/get_error_code";
import { dex_current_price_sub } from "./subscription/dex_current_price_sub";
import { dex_system_status } from "./subscription/dex_system_status";
import { dex_user_notifications } from "./queries/dex_user_notifications";
import { dex_user_notification_sub } from "./subscription/dex_user_notification_sub";
import { dex_user_withdraw_epoch_gasless } from "./mutation/dex_user_withdraw_epoch_gasless";
import { dex_user_available_epochs_withdraw } from "./queries/dex_user_available_epochs_withdraw";
import { dex_user_epochs } from "./queries/dex_user_epochs";
import { dex_epoch_info } from "./queries/dex_epoch_info";
import { dex_user_read_notification } from "./mutation/dex_user_read_notification";
import { dex_user_order_details } from "./queries/dex_user_order_details";
import { dex_user_cancel_limit_order } from "./mutation/dex_user_cancel_limit_order";
import { dex_user_active_order_sub } from "./subscription/dex_user_active_order_sub";
import { dex_dashboard_statistic_get } from "./queries/dex_dashboard_statistic_get";
import { dex_dashboard_profit_for_user_chart_get } from "./queries/dex_dashboard_profit_for_user_chart_get";
import { dex_dashboard_pool_event_chart_get } from "./queries/dex_dashboard_pool_event_chart_get";

const resolvers = {
	Query: {
		showConfig: () => ({
			NODE_ENV,
			SERVER_NAME,
		}),
		apiVersion: api_version,
		dex_get_signature,
		dex_user_info,
		get_error_code,
		dex_chart_data,
		dex_pairs_get,
		dex_pair_info,
		dex_user_ref_info,
		dex_user_get_sign_gasless,
		dex_user_orders,
		dex_pool_info,
		dex_leader_board,
		dex_user_closed_order,
		dex_top_masters,
		dex_user_details,
		dex_user_masters,
		dex_user_copiers,
		dex_user_current_trades,
		dex_user_past_trades,
		dex_user_activity,
		dex_list_request_commission,
		dex_user_notifications,
		dex_user_available_epochs_withdraw,
		dex_user_epochs,
		dex_epoch_info,
		dex_user_order_details,
		dex_dashboard_statistic_get,
		dex_dashboard_profit_for_user_chart_get,
		dex_dashboard_pool_event_chart_get
	},
	Mutation: {
		dex_user_login,
		dex_user_create_gasless_order,
		dex_user_close_gasless_order,
		dex_user_set_permit,
		dex_set_pending_ref,
		dex_user_edit_limit_order,
		dex_user_update_limit_gasless_order,
		dex_user_set_ref_code,
		dex_user_withdraw_pool_with_gasless,
		dex_user_deposit_pool_with_gasless,
		dex_user_cancel_limit_order,
		dex_user_mint_token_demo,
		dex_user_cancel_copy_gasless,
		dex_user_copy_request,
		dex_user_request_commission,
		dex_user_set_share_fee,
		dex_user_edit_position_gasless,
		dex_user_reward_commission,
		dex_user_withdraw_epoch_gasless,
		dex_user_read_notification
	},
	Subscription: {
		dex_current_price_sub,
		dex_system_status,
		dex_user_notification_sub,
		dex_user_active_order_sub,
	},
};

export { resolvers };
