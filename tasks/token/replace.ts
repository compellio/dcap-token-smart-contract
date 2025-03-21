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

import {task} from "hardhat/config";
import {createCliTable, extractTokenProperties, getNetworkChainId, getNetworkProvider} from "../../lib/utils";
import {tokenScope} from "../token";

tokenScope.task("replace", "Attempt to replace a token with is successor")
    .addPositionalParam("predecessor", "The Token Id of the predecessor token")
    .addPositionalParam("successor", "The Token Id of the successor token.")
    .addFlag("force", "Skip validations and forge-update the predecessor.")
    .setAction(async (params, hre) => {

        const predecessor = extractTokenProperties(params.predecessor);
        const successor = extractTokenProperties(params.successor);

        if (predecessor.chainId !== await getNetworkChainId(hre, hre.network.name)) {
            throw new Error("selected network invalid. You must switch to the predecessor's network using --network.");
        }

        if (!params.force) {
            // Verify the successor points to its predecessor

            const successorNetwork = await getNetworkProvider(hre, successor.chainId);
            const DCAPToken = await hre.ethers.getContractFactory("DCAPToken");

            if (!successorNetwork.url) {
                throw new Error("successor network configured without a URL. Use --force to skip this check.")
            }

            const provider = new hre.ethers.JsonRpcProvider(successorNetwork.url);
            const successorContract = DCAPToken.connect(provider).attach(successor.address);

            //@ts-expect-error ts contract definitions buggy when using factories
            if (predecessor.tokenId !== await successorContract.predecessor()) {
                throw new Error(`successor token ${successor.tokenId} points to another predecessor (${predecessor.tokenId})`)
            }
        }

        const predecessorContract = await hre.ethers.getContractAt("DCAPToken", predecessor.address);

        const response = await predecessorContract.replace(successor.tokenId);
        const transaction = await response.getTransaction();

        const table = createCliTable();

        table.push(
            {'Updated Token (predecessor):': `${predecessor.tokenId} (contract ${predecessor.address})`},
            {"Transaction Hash:": transaction?.hash},
            {},
            {'Successor Id:': successor.tokenId},
        );

        console.log("Predecessor token replaced\n");
        console.log(table.toString());

    });
