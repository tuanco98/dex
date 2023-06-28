import { OpenPosition } from "./OpenPosition";
import { ClosePosition } from "./ClosePosition";
import { UpdateTP } from "./UpdateTP";
import { UpdateSL } from "./UpdateSL";
import { CopyPosition } from "./CopyPosition";
import { MasterShare } from "./MasterShare";

const EventHandler = {
	OpenPosition,
	ClosePosition,
	UpdateTP,
	UpdateSL,
	CopyPosition,
	MasterShare,
};

export { EventHandler as PositionEventHandler };
