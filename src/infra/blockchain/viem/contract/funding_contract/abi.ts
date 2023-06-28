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
          "internalType": "contract IPosition",
          "name": "_position",
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
          "internalType": "uint16",
          "name": "pairId",
          "type": "uint16"
        },
        {
          "indexed": false,
          "internalType": "int256",
          "name": "fundingTracker",
          "type": "int256"
        },
        {
          "indexed": false,
          "internalType": "int256",
          "name": "fundingIncrement",
          "type": "int256"
        }
      ],
      "name": "FundingUpdated",
      "type": "event"
    },
    {
      "inputs": [],
      "name": "fundingInterval",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
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
      "name": "getFunding",
      "outputs": [
        {
          "components": [
            {
              "internalType": "int256",
              "name": "fundingTracker",
              "type": "int256"
            },
            {
              "internalType": "uint32",
              "name": "lastUpdated",
              "type": "uint32"
            }
          ],
          "internalType": "struct IFunding.Funding",
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
          "internalType": "uint16",
          "name": "pairId",
          "type": "uint16"
        }
      ],
      "name": "getFundingFactor",
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
      "name": "getFundingTracker",
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
          "internalType": "uint16[]",
          "name": "pairId",
          "type": "uint16[]"
        }
      ],
      "name": "getFundings",
      "outputs": [
        {
          "components": [
            {
              "internalType": "int256",
              "name": "fundingTracker",
              "type": "int256"
            },
            {
              "internalType": "uint32",
              "name": "lastUpdated",
              "type": "uint32"
            }
          ],
          "internalType": "struct IFunding.Funding[]",
          "name": "fl",
          "type": "tuple[]"
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
      "name": "getLastUpdated",
      "outputs": [
        {
          "internalType": "uint32",
          "name": "",
          "type": "uint32"
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
          "internalType": "uint16",
          "name": "pairId",
          "type": "uint16"
        },
        {
          "internalType": "uint256",
          "name": "amount",
          "type": "uint256"
        }
      ],
      "name": "setFundingFactor",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "uint32",
          "name": "amount",
          "type": "uint32"
        }
      ],
      "name": "setFundingInterval",
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
        }
      ],
      "name": "updateFunding",
      "outputs": [],
      "stateMutability": "nonpayable",
      "type": "function"
    }
  ];
const CONVERT_ABI = convertAbiViem(CONTRACT_ABI);
export { CONVERT_ABI as FUNDING_ABI };
