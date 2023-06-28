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
          "internalType": "address",
          "name": "_usdc",
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
          "internalType": "bytes",
          "name": "signature",
          "type": "bytes"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        }
      ],
      "name": "CancelSignature",
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
          "name": "copier",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "reason",
          "type": "bytes"
        }
      ],
      "name": "CopyFailed",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "owner",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "bytes",
          "name": "reason",
          "type": "bytes"
        }
      ],
      "name": "PermitFailed",
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
          "internalType": "bytes",
          "name": "sign",
          "type": "bytes"
        }
      ],
      "name": "cancel",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "bytes",
          "name": "sign",
          "type": "bytes"
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
      "name": "cancelGasLess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "int256",
          "name": "amount",
          "type": "int256"
        },
        {
          "internalType": "address",
          "name": "master",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "copier",
          "type": "address"
        }
      ],
      "name": "changeCopyAmount",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "copiedAmount",
      "outputs": [
        {
          "internalType": "int256",
          "name": "",
          "type": "int256"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256",
          "name": "_minSize",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_basePrice",
          "type": "uint256"
        },
        {
          "internalType": "uint256",
          "name": "_maxCopyExpire",
          "type": "uint256"
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
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "master",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "maxAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "fixedAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint32",
              "name": "percentAmount",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "sharePercent",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "percentTp",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "percentSl",
              "type": "uint32"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct IOpenPosition.CopyRequest[]",
          "name": "copyRequest",
          "type": "tuple[]"
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "deadline",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "v",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "r",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "s",
              "type": "bytes32"
            }
          ],
          "internalType": "struct Types.Permit[]",
          "name": "permits",
          "type": "tuple[]"
        }
      ],
      "name": "executeCopy",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "isCopied",
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
      "name": "maxCopyExpire",
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
      "name": "minSize",
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
          "internalType": "address",
          "name": "",
          "type": "address"
        }
      ],
      "name": "nonces",
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
              "internalType": "address",
              "name": "master",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "maxAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "fixedAmount",
              "type": "uint256"
            },
            {
              "internalType": "uint32",
              "name": "percentAmount",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "sharePercent",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "percentTp",
              "type": "uint32"
            },
            {
              "internalType": "uint32",
              "name": "percentSl",
              "type": "uint32"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct IOpenPosition.CopyRequest",
          "name": "copyRequest",
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
          "internalType": "bytes32",
          "name": "masterId",
          "type": "bytes32"
        },
        {
          "components": [
            {
              "internalType": "uint32",
              "name": "openFee",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "oracleFee",
              "type": "uint256"
            }
          ],
          "internalType": "struct OpenPosition.Fee",
          "name": "fee",
          "type": "tuple"
        }
      ],
      "name": "openCopyPosition",
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
              "internalType": "uint8",
              "name": "orderType",
              "type": "uint8"
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
              "name": "expire",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "limitPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "tp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sl",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct Types.OrderLimit",
          "name": "order",
          "type": "tuple"
        }
      ],
      "name": "openLimitPosition",
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
              "internalType": "uint8",
              "name": "orderType",
              "type": "uint8"
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
              "name": "expire",
              "type": "uint32"
            },
            {
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "limitPrice",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "tp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sl",
              "type": "uint256"
            },
            {
              "internalType": "bytes",
              "name": "signature",
              "type": "bytes"
            }
          ],
          "internalType": "struct Types.OrderLimit",
          "name": "order",
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
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "deadline",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "v",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "r",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "s",
              "type": "bytes32"
            }
          ],
          "internalType": "struct Types.Permit",
          "name": "permit",
          "type": "tuple"
        }
      ],
      "name": "openLimitPositionWithPermit",
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
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "tp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sl",
              "type": "uint256"
            }
          ],
          "internalType": "struct Types.Order",
          "name": "order",
          "type": "tuple"
        }
      ],
      "name": "openPosition",
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
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "tp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sl",
              "type": "uint256"
            }
          ],
          "internalType": "struct Types.Order",
          "name": "order",
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
      "name": "openPositionGasLess",
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
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "tp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sl",
              "type": "uint256"
            }
          ],
          "internalType": "struct Types.Order",
          "name": "order",
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
        },
        {
          "components": [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "deadline",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "v",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "r",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "s",
              "type": "bytes32"
            }
          ],
          "internalType": "struct Types.Permit",
          "name": "permit",
          "type": "tuple"
        }
      ],
      "name": "openPositionGasLessWithPermit",
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
              "internalType": "uint256",
              "name": "amount",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "tp",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "sl",
              "type": "uint256"
            }
          ],
          "internalType": "struct Types.Order",
          "name": "order",
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
              "internalType": "address",
              "name": "spender",
              "type": "address"
            },
            {
              "internalType": "uint256",
              "name": "value",
              "type": "uint256"
            },
            {
              "internalType": "uint256",
              "name": "deadline",
              "type": "uint256"
            },
            {
              "internalType": "uint8",
              "name": "v",
              "type": "uint8"
            },
            {
              "internalType": "bytes32",
              "name": "r",
              "type": "bytes32"
            },
            {
              "internalType": "bytes32",
              "name": "s",
              "type": "bytes32"
            }
          ],
          "internalType": "struct Types.Permit",
          "name": "permit",
          "type": "tuple"
        }
      ],
      "name": "openPositionWithPermit",
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
          "internalType": "address",
          "name": "master",
          "type": "address"
        }
      ],
      "name": "resetCopyAmount",
      "outputs": [],
      "stateMutability": "nonpayable",
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
          "internalType": "address",
          "name": "",
          "type": "address"
        },
        {
          "internalType": "bytes32",
          "name": "",
          "type": "bytes32"
        }
      ],
      "name": "signUsed",
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
        },
        {
          "internalType": "uint256",
          "name": "sl",
          "type": "uint256"
        }
      ],
      "name": "updateLimit",
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
        },
        {
          "internalType": "uint256",
          "name": "sl",
          "type": "uint256"
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
      "name": "updateLimitGasLess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
const CONVERT_ABI = convertAbiViem(CONTRACT_ABI);
export { CONVERT_ABI as OPEN_POSITION_ABI };
