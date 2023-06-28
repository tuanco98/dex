import { convertAbiViem } from "../../../../../lib/utils";

const CONTRACT_ABI = [
  {
    "inputs": [
      {
        "internalType": "contract IRoleManager",
        "name": "_roles",
        "type": "address"
      },
      {
        "internalType": "contract IChainlink",
        "name": "_chainlink",
        "type": "address"
      },
      {
        "internalType": "contract IPosition",
        "name": "_position",
        "type": "address"
      },
      {
        "internalType": "contract IFunding",
        "name": "_funding",
        "type": "address"
      },
      {
        "internalType": "contract IPool",
        "name": "_pool",
        "type": "address"
      },
      {
        "internalType": "contract IProfitShare",
        "name": "_profitShare",
        "type": "address"
      },
      {
        "internalType": "contract IOpenPosition",
        "name": "_openPosition",
        "type": "address"
      },
      {
        "internalType": "contract IPair",
        "name": "_pairs",
        "type": "address"
      },
      {
        "internalType": "contract IRiskManager",
        "name": "_risks",
        "type": "address"
      },
      {
        "internalType": "address",
        "name": "_trustedForwarder",
        "type": "address"
      }
    ],
    "stateMutability": "nonpayable",
    "type": "constructor"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "caller",
        "type": "address"
      },
      {
        "internalType": "bytes32",
        "name": "role",
        "type": "bytes32"
      }
    ],
    "name": "NotAuthorized",
    "type": "error"
  },
  {
    "anonymous": false,
    "inputs": [
      {
        "indexed": false,
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "indexed": false,
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "indexed": false,
        "internalType": "uint16",
        "name": "closeType",
        "type": "uint16"
      },
      {
        "indexed": false,
        "internalType": "bytes",
        "name": "reason",
        "type": "bytes"
      }
    ],
    "name": "CloseFailed",
    "type": "event"
  },
  {
    "stateMutability": "nonpayable",
    "type": "fallback"
  },
  {
    "inputs": [],
    "name": "basePrice",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "uint16",
        "name": "closeType",
        "type": "uint16"
      }
    ],
    "name": "closePosition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "components": [
          {
            "internalType": "address",
            "name": "owner",
            "type": "address"
          },
          {
            "internalType": "uint256",
            "name": "deadline",
            "type": "uint256"
          },
          {
            "internalType": "bytes",
            "name": "signature",
            "type": "bytes"
          }
        ],
        "internalType": "struct Types.GasLess",
        "name": "gasLess",
        "type": "tuple"
      }
    ],
    "name": "closePositionGasLess",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32[]",
        "name": "Ids",
        "type": "bytes32[]"
      },
      {
        "internalType": "uint256[]",
        "name": "prices",
        "type": "uint256[]"
      },
      {
        "internalType": "uint16[]",
        "name": "closeType",
        "type": "uint16[]"
      }
    ],
    "name": "closePositions",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint256",
        "name": "_basePrice",
        "type": "uint256"
      },
      {
        "internalType": "contract IOpenPosition",
        "name": "_openPosition",
        "type": "address"
      }
    ],
    "name": "editParams",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "bool",
        "name": "isSelf",
        "type": "bool"
      },
      {
        "internalType": "uint16",
        "name": "closeType",
        "type": "uint16"
      },
      {
        "internalType": "int256",
        "name": "oracleFee",
        "type": "int256"
      }
    ],
    "name": "executePosition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "uint16",
        "name": "pairId",
        "type": "uint16"
      },
      {
        "internalType": "bool",
        "name": "isLong",
        "type": "bool"
      },
      {
        "internalType": "uint256",
        "name": "price",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "entryPrice",
        "type": "uint256"
      },
      {
        "internalType": "uint256",
        "name": "positionSize",
        "type": "uint256"
      },
      {
        "internalType": "int256",
        "name": "fundingTracker",
        "type": "int256"
      }
    ],
    "name": "getPnL",
    "outputs": [
      {
        "internalType": "int256",
        "name": "pnl",
        "type": "int256"
      },
      {
        "internalType": "int256",
        "name": "fundingFee",
        "type": "int256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "address",
        "name": "forwarder",
        "type": "address"
      }
    ],
    "name": "isTrustedForwarder",
    "outputs": [
      {
        "internalType": "bool",
        "name": "",
        "type": "bool"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "roles",
    "outputs": [
      {
        "internalType": "contract IRoleManager",
        "name": "",
        "type": "address"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [
      {
        "internalType": "bytes32",
        "name": "id",
        "type": "bytes32"
      },
      {
        "internalType": "uint16",
        "name": "closeType",
        "type": "uint16"
      }
    ],
    "name": "selfClosePosition",
    "outputs": [],
    "stateMutability": "nonpayable",
    "type": "function"
  }
];
const CONVERT_ABI = convertAbiViem(CONTRACT_ABI);

export { CONVERT_ABI as PROCESSOR_ABI };
