type Type = {
	nonce: number;
	owner: string;
	spender: string;
	value: number;
	deadline: number;
	v: number;
	r: string;
	s: string;
};

export { Type as GQL_IpPermit };
