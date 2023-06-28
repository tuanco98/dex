import { convertAbiViem } from "../../../../../lib/utils";

export const CONTRACT_ABI = [
    {
      "inputs": [
        {
          "internalType": "contract ERC20",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "address",
          "name": "spender",
          "type": "address"
        },
        {
          "internalType": "address[]",
          "name": "users",
          "type": "address[]"
        }
      ],
      "name": "batchAllowance",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract ERC20",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "address[]",
          "name": "user",
          "type": "address[]"
        }
      ],
      "name": "batchBalanceOf",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "address[]",
          "name": "users",
          "type": "address[]"
        }
      ],
      "name": "batchEthBalances",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    },
    {
      "inputs": [
        {
          "internalType": "contract IERC20Permit",
          "name": "token",
          "type": "address"
        },
        {
          "internalType": "address[]",
          "name": "users",
          "type": "address[]"
        }
      ],
      "name": "batchNonces",
      "outputs": [
        {
          "internalType": "uint256[]",
          "name": "",
          "type": "uint256[]"
        }
      ],
      "stateMutability": "view",
      "type": "function"
    }
  ];
const CONVERT_ABI = convertAbiViem(CONTRACT_ABI);
export { CONVERT_ABI as BATCH_CALL_ABI };
