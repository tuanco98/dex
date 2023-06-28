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
          "name": "_trustedForwarder",
          "type": "address"
        },
        {
          "internalType": "contract IPool",
          "name": "_pool",
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
          "internalType": "address",
          "name": "master",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "total",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256[]",
          "name": "epoch",
          "type": "uint256[]"
        }
      ],
      "name": "MasterWithdraw",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "newEpochTime",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "startTime",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "currentEpoch",
          "type": "uint256"
        }
      ],
      "name": "NewEpochTime",
      "type": "event"
    },
    {
      "anonymous": false,
      "inputs": [
        {
          "indexed": false,
          "internalType": "address",
          "name": "master",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "address",
          "name": "copier",
          "type": "address"
        },
        {
          "indexed": false,
          "internalType": "uint256",
          "name": "epoch",
          "type": "uint256"
        },
        {
          "indexed": false,
          "internalType": "int256",
          "name": "currentProfit",
          "type": "int256"
        },
        {
          "indexed": false,
          "internalType": "int256",
          "name": "totalMasterShare",
          "type": "int256"
        },
        {
          "indexed": false,
          "internalType": "int256",
          "name": "change",
          "type": "int256"
        },
        {
          "indexed": false,
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        }
      ],
      "name": "NewShare",
      "type": "event"
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
          "internalType": "uint256",
          "name": "newEpoch",
          "type": "uint256"
        }
      ],
      "name": "changeEpochTime",
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
          "internalType": "address",
          "name": "master",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "copier",
          "type": "address"
        },
        {
          "internalType": "int256",
          "name": "amount",
          "type": "int256"
        },
        {
          "internalType": "bytes32",
          "name": "id",
          "type": "bytes32"
        }
      ],
      "name": "recordShare",
      "outputs": [
        {
          "internalType": "int256",
          "name": "change",
          "type": "int256"
        }
      ],
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
      "inputs": [],
      "name": "startEpoch",
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
      "name": "startTime",
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
          "internalType": "uint256[]",
          "name": "epoch",
          "type": "uint256[]"
        }
      ],
      "name": "withdrawEpoch",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint256[]",
          "name": "epoch",
          "type": "uint256[]"
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
      "name": "withdrawEpochGasLess",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
const CONVERT_ABI = convertAbiViem(CONTRACT_ABI);
export { CONVERT_ABI as PROFIT_SHARE_ABI };
