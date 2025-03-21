/*
 * DCAPv2 Token Smart Contracts
 * Copyright (C) 2025  Compellio S.A.
 *
 * This program is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 3 of the License, or
 * (at your option) any later version.
 *
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 *
 * You should have received a copy of the GNU General Public License
 * along with this program.  If not, see <https://www.gnu.org/licenses/>.
 */

import {HardhatUserConfig} from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import {HttpNetworkUserConfig} from "hardhat/types";
import yargs from "yargs";
import dotenv from "dotenv";
import "./tasks/token/deploy";
import "./tasks/token/deploy-payload";
import "./tasks/token/replace";
import "./tasks/token/read"

// Extract selected network from CLI arguments
const vargs = yargs
    .help(false).version(false)
    .option("network", {type: "string", default: "hardhat"})
    .parseSync();

dotenv.config();

const {OWNER_KEY, ETHERSCAN_API_KEY, ETHERLINK_BLOCKSCOUT_API_KEY, POLYGONSCAN_API_KEY, TAR_JSON_RPC_URL} = process.env;

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

if (POLYGONSCAN_API_KEY) {
    etherscanVerificationApiKeys.amoy = POLYGONSCAN_API_KEY;
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
            },
            {
                network: 'amoy',
                chainId: 80002,
                urls: {
                    apiURL: "https://api-amoy.polygonscan.com/api",
                    browserURL: "https://amoy.polygonscan.com/"
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
