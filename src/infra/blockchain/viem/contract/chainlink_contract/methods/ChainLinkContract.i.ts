

interface IChainLinkContract {
    getPrice: (pairId: number) => Promise<bigint>
}

export { IChainLinkContract }
