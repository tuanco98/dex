import { convertAbiViem } from "../../../../../lib/utils";

const CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "contract IRoleManager",
          "name": "_roles",
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
          "name": "closePrice",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "int256",
          "name": "pnl",
          "type": "int256"
        },
        {
          "indexed": false,
          "internalType": "uint16",
          "name": "closeType",
          "type": "uint16"
        }
      ],
      "name": "ClosePosition",
      "type": "event"
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
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bool",
          "name": "isLong",
          "type": "bool"
        },
        {
          "indexed": false,
          "internalType": "uint16",
          "name": "pairId",
          "type": "uint16"
        },
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "leverage",
          "type": "uint32"
        },
        {
          "indexed": false,
          "internalType": "uint32",
          "name": "timestamp",
          "type": "uint32"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "entryPrice",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "int256",
          "name": "fundingTracker",
          "type": "int256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "masterId",
          "type": "bytes32"
        }
      ],
      "name": "OpenPosition",
      "type": "event"
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
          "name": "sl",
          "type": "uint256"
        }
      ],
      "name": "UpdateSL",
      "type": "event"
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
          "name": "tp",
          "type": "uint256"
        }
      ],
      "name": "UpdateTP",
      "type": "event"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "SL",
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
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "TP",
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
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isLong",
              "type": "bool"
            },
            {
              "internalType": "uint16",
              "name": "pairId",
              "type": "uint16"
            },
            {
              "internalType": "uint32",
              "name": "leverage",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "timestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "entryPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "int256",
              "name": "fundingTracker",
              "type": "int256"
            }
          ],
          "internalType": "struct Types.Position",
          "name": "position",
          "type": "tuple"
        }
      ],
      "name": "addPosition",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isLong",
              "type": "bool"
            },
            {
              "internalType": "uint16",
              "name": "pairId",
              "type": "uint16"
            },
            {
              "internalType": "uint32",
              "name": "leverage",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "timestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "entryPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "int256",
              "name": "fundingTracker",
              "type": "int256"
            }
          ],
          "internalType": "struct Types.Position",
          "name": "position",
          "type": "tuple"
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "masterId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "sharePercent",
              "type": "uint256"
            }
          ],
          "internalType": "struct IPosition.Master",
          "name": "master",
          "type": "tuple"
        },
        {
          "internalType": "uint256",
          "name": "percentTp",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "percentSl",
          "type": "uint256"
        }
      ],
      "name": "addPositionWithMaster",
      "outputs": [
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
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
          "name": "closePrice",
          "type": "uint256"
        },
        {
          "internalType": "int256",
          "name": "pnl",
          "type": "int256"
        },
        {
          "internalType": "int256",
          "name": "finalAmount",
          "type": "int256"
        },
        {
          "internalType": "uint16",
          "name": "closeType",
          "type": "uint16"
        }
      ],
      "name": "closePosition",
      "outputs": [
        {
          "internalType": "address",
          "name": "masterAddress",
          "type": "address"
        },
        {
          "internalType": "int256",
          "name": "amountShare",
          "type": "int256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [],
      "name": "funding",
      "outputs": [
        {
          "internalType": "contract IFunding",
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
          "internalType": "uint16",
          "name": "pairId",
          "type": "uint16"
        }
      ],
      "name": "getIO",
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
          "internalType": "uint16",
          "name": "pairId",
          "type": "uint16"
        }
      ],
      "name": "getIOLong",
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
          "internalType": "uint16",
          "name": "pairId",
          "type": "uint16"
        }
      ],
      "name": "getIOShort",
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
          "internalType": "uint16",
          "name": "pairId",
          "type": "uint16"
        }
      ],
      "name": "getIOs",
      "outputs": [
        {
          "components": [
            {
              "internalType": "uint256",
              "name": "long",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "short",
              "type": "uint256"
            }
          ],
          "internalType": "struct IPosition.OI",
          "name": "",
          "type": "tuple"
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
        }
      ],
      "name": "getMasterInfo",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "bytes32",
              "name": "masterId",
              "type": "bytes32"
            },
            {
              "internalType": "uint256",
              "name": "sharePercent",
              "type": "uint256"
            }
          ],
          "internalType": "struct IPosition.Master",
          "name": "",
          "type": "tuple"
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
        }
      ],
      "name": "getPosition",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isLong",
              "type": "bool"
            },
            {
              "internalType": "uint16",
              "name": "pairId",
              "type": "uint16"
            },
            {
              "internalType": "uint32",
              "name": "leverage",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "timestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "entryPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "int256",
              "name": "fundingTracker",
              "type": "int256"
            }
          ],
          "internalType": "struct Types.Position",
          "name": "",
          "type": "tuple"
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
        }
      ],
      "name": "getPositionPairId",
      "outputs": [
        {
          "internalType": "uint16",
          "name": "",
          "type": "uint16"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes32[]",
          "name": "id",
          "type": "bytes32[]"
        }
      ],
      "name": "getPositions",
      "outputs": [
        {
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "bool",
              "name": "isLong",
              "type": "bool"
            },
            {
              "internalType": "uint16",
              "name": "pairId",
              "type": "uint16"
            },
            {
              "internalType": "uint32",
              "name": "leverage",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "timestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "entryPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "int256",
              "name": "fundingTracker",
              "type": "int256"
            }
          ],
          "internalType": "struct Types.Position[]",
          "name": "_positions",
          "type": "tuple[]"
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
        }
      ],
      "name": "getSL",
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
        }
      ],
      "name": "getTP",
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
          "internalType": "contract IFunding",
          "name": "_funding",
          "type": "address"
        }
      ],
      "name": "setFunding",
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
          "name": "sl",
          "type": "uint256"
        }
      ],
      "name": "setSl",
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
          "name": "tp",
          "type": "uint256"
        }
      ],
      "name": "setTp",
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
              "internalType": "bool",
              "name": "isLong",
              "type": "bool"
            },
            {
              "internalType": "uint16",
              "name": "pairId",
              "type": "uint16"
            },
            {
              "internalType": "uint32",
              "name": "leverage",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "timestamp",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "entryPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "int256",
              "name": "fundingTracker",
              "type": "int256"
            }
          ],
          "internalType": "struct Types.Position",
          "name": "position",
          "type": "tuple"
        }
      ],
      "name": "updatePosition",
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
          "internalType": "int256",
          "name": "currentPrice",
          "type": "int256"
        }
      ],
      "name": "updatePositionWithMaster",
      "outputs": [
        {
          "internalType": "address",
          "name": "user",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "master",
          "type": "address"
        },
        {
          "internalType": "int256",
          "name": "amount",
          "type": "int256"
        },
        {
          "internalType": "int256",
          "name": "sizeChange",
          "type": "int256"
        }
      ],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
const CONVERT_ABI = convertAbiViem(CONTRACT_ABI);

export { CONVERT_ABI as POSITION_ABI };
