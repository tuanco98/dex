import { ClientSession } from "mongodb";
import { ErrMsg, ERROR_CODE } from "../../../../lib/error_handler";
import { TCopyRequest } from "../models/CopyProof";
import { collections } from "../mongo";

const getDAO = () => ({
	common: collections.copy_proofs,
	newProof: async (copy_request: TCopyRequest, session?: ClientSession) => {
		const date_now = new Date();
		const old_proof = await collections.copy_proofs.findOne({
			lowerMaster: copy_request.master.toLowerCase(),
			lowerOwner: copy_request.owner.toLowerCase(),
			isActive: true,
		});
		if (old_proof) throw ErrMsg(ERROR_CODE.ALREADY_FOLLOW);
		await collections.copy_proofs.insertOne(
			{
				...copy_request,
				createAt: date_now,
				updateAt: date_now,
				isActive: true,
				lowerMaster: copy_request.master.toLowerCase(),
				lowerOwner: copy_request.owner.toLowerCase(),
			},
			{ session },
		);
	},
	deleteProof: async (
		copier: string,
		sign: string,
		master: string,
		session?: ClientSession,
	) => {
		const { value } = await collections.copy_proofs.findOneAndUpdate(
			{
				lowerOwner: copier.toLowerCase(),
				signature: sign,
				lowerMaster: master.toLowerCase(),
				isActive: true,
			},
			{ $set: { isActive: false, updateAt: new Date() } },
			{ session },
		);
		if (!value) throw ErrMsg(ERROR_CODE.NOT_FOLLOW);
	},
	deleteProofBySignature: async (
		copier: string,
		signature: string,
		session?: ClientSession,
	) => {
		const { value } = await collections.copy_proofs.findOneAndUpdate(
			{ lowerOwner: copier.toLowerCase(), signature, isActive: true },
			{ $set: { isActive: false, updateAt: new Date() } },
			{ session },
		);
		return value;
	},
	getAllCopiers: async (master_address: string) => {
		return collections.copy_proofs
			.find({ lowerMaster: master_address.toLowerCase(), isActive: true })
			.toArray();
	},
});

type DAOType = ReturnType<typeof getDAO>;

export { getDAO as getCopyProofDAO, DAOType as CopyProofType };
