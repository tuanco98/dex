import { TUser } from "../../../infra/database/mongo/models/User";
import { MyOmit } from "../../../lib/typescript-utils";

type Type = Partial<
	MyOmit<TUser, "unclaim_commission" | "createAt" | "updateAt">
>;

export { Type as GQL_TPermit };
