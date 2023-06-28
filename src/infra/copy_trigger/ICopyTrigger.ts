import { TGetAllLinkTradeWithOptions } from "../database/mongo/methods/dao.traders";
import { TCopyProof } from "../database/mongo/models/CopyProof";
import { TTrade } from "../database/mongo/models/Trade";

interface ICopyTrigger {
	ExecuteOpenCopy: (order: TTrade, copy_proofs: TCopyProof[]) => Promise<void>;
	ExecuteCloseCopy: (
		trade_id: string,
		options?: TGetAllLinkTradeWithOptions,
	) => Promise<string>;
	ExecuteEditCopy: (trades: TTrade[]) => Promise<string>;
}

export { ICopyTrigger };
