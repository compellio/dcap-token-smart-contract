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

import CliTable3 from "cli-table3";
import {HardhatRuntimeEnvironment} from "hardhat/types";

export function extractTokenProperties(tokenId: string) {
    const parts = tokenId.match(/urn:tar:eip155.(?<chainId>\d+):(?<address>[0-9a-fA-F]{40})/);

    if (parts === null) {
        throw new Error(`Invalid token id: ${tokenId}`);
    }

    return {
        tokenId: tokenId,
        chainId: BigInt(parseInt(parts?.groups?.chainId!)),
        address: "0x".concat(parts?.groups?.address!)
    }
}

export async function getNetworkChainId(hre: HardhatRuntimeEnvironment, name: string) {

    if ("chainId" in hre.config.networks[name] && hre.config.networks[name].chainId) {
        return BigInt(hre.config.networks[name].chainId);
    }

    if ("url" in hre.config.networks[name] && hre.config.networks[name].url) {
        const provider = new hre.ethers.JsonRpcProvider(hre.config.networks[name].url);
        const network = await provider.getNetwork();

        return network.chainId;
    }

    throw new Error(`Cannot find chain id of ${name}. Please set it manually in hardhat.config.ts.`);

}

export async function getNetworkProvider(hre: HardhatRuntimeEnvironment, chainId: bigint) {
    const networks = Object.keys(hre.config.networks);

    for (const network of networks) {
        if (network !== 'localhost' && await getNetworkChainId(hre, network) === chainId) {
            return {
                name: network,
                config: hre.config.networks[network],
                url: "url" in hre.config.networks[network] ? hre.config.networks[network].url : undefined
            }
        }
    }

    throw new Error(`No configured network with chain id ${chainId}`);
}

export function createCliTable() {
    return new CliTable3({
        chars: {
            'top': '',
            'top-mid': '',
            'top-left': '',
            'top-right': '',
            'bottom': '',
            'bottom-mid': '',
            'bottom-left': '',
            'bottom-right': '',
            'left': '',
            'left-mid': '',
            'mid': '',
            'mid-mid': '',
            'right': '',
            'right-mid': '',
            'middle': ''
        },
        style: {'padding-left': 0, 'padding-right': 1}
    });
}
