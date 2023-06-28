type EReadNotifyType = "ALL" | "SINGLE";
type Input = {
	readType: EReadNotifyType;
    id: string;
};

export { Input as ReadNotifyInput, EReadNotifyType };
