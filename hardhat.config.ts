import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import {HttpNetworkUserConfig} from "hardhat/types";
import yargs from "yargs";
import dotenv from "dotenv";
import "./tasks/deploy";
import "./tasks/deploy-payload";
import "./tasks/replace";

// Extract selected network from CLI arguments
const vargs = yargs
    .help(false).version(false)
    .option("network", {type: "string", default: "hardhat"})
    .parseSync();

dotenv.config();

const {OWNER_KEY, ETHERSCAN_API_KEY, ETHERLINK_BLOCKSCOUT_API_KEY, TAR_JSON_RPC_URL} = process.env;

const sharedNetworkConfig: HttpNetworkUserConfig = {}

if (vargs.network != "hardhat") {
    if (!OWNER_KEY) {
        throw Error("OWNER_KEY is not set");
    }

    sharedNetworkConfig.accounts = [OWNER_KEY];
}

const etherscanVerificationApiKeys: Record<string, string> = {
    'etherlink-testnet': ETHERLINK_BLOCKSCOUT_API_KEY ?? "not-used",
};

if (ETHERSCAN_API_KEY) {
    etherscanVerificationApiKeys.sepolia = ETHERSCAN_API_KEY;
}

const config: HardhatUserConfig = {
    solidity: "0.8.28",

    networks: {
        sepolia: {
            url: "https://ethereum-sepolia-rpc.publicnode.com",
            chainId: 11155111,
            ...sharedNetworkConfig
        },
        amoy: {
            url: "https://polygon-amoy-bor-rpc.publicnode.com",
            chainId: 80002,
            ...sharedNetworkConfig
        },
        'etherlink-testnet': {
            url: "https://node.ghostnet.etherlink.com",
            chainId: 128123,
            ...sharedNetworkConfig
        }
    },

    etherscan: {
        apiKey: etherscanVerificationApiKeys,
        customChains: [
            {
                network: 'etherlink-testnet',
                chainId: 128123,
                urls: {
                    apiURL: "https://testnet.explorer.etherlink.com/api",
                    browserURL: "https://testnet.explorer.etherlink.com/"
                }
            }
        ]
    },

    sourcify: {
        enabled: false
    }
};

if (TAR_JSON_RPC_URL) {
    config.networks!.custom = {
        ...sharedNetworkConfig,
        url: TAR_JSON_RPC_URL
    }
}

export default config;
