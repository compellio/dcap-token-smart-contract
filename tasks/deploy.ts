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
import DCAPTokenModule from "../ignition/modules/DCAPToken";
import {createCliTable, extractTokenProperties, getNetworkChainId} from "../lib/utils";

task("deploy", "Deploy a DCAP Token")
    .addPositionalParam("uriPrefix", "The URI prefix of the DCAP token registry.")
    .addPositionalParam("checksum", "A SHA256 checksum of a canonicalized DCAP payload (hex).")
    .addOptionalParam("predecessor", "The Token Id of a predecessor token (optional - used when replacing existing tokens).")
    .addFlag("json", "Return a deployment summary in JSON.")
    .addFlag("replace", "Attempt to replace the predecessor after a successful deployment.")
    .addFlag("verify", "Attempt to verify the contract after a successful deployment.")
    .setAction(async (params, hre) => {

        if (params.replace && !params.predecessor) {
            throw new Error('The predecessor token id id required when replacing');
        }

        if (params.replace && params.json) {
            throw new Error('Cannot use --replace with --json');
        }

        const constructorParams = {
            uriPrefix: params.uriPrefix,
            checksum: !params.checksum.startsWith("0x") ? "0x".concat(params.checksum) : params.checksum,
            predecessorId: params.predecessor ? extractTokenProperties(params.predecessor).tokenId : ""
        }

        const {token} = await hre.ignition.deploy(DCAPTokenModule, {
            displayUi: !params.json,
            deploymentId: `checksum-${params.checksum}`,
            parameters: {
                DCAPTokenModule: constructorParams
            }
        });

        const chainId = await getNetworkChainId(hre, hre.network.name);
        const address = await token.getAddress();

        if (params.verify) {
            try {
                await hre.run('verify', {
                    address: address,
                    constructorArgsParams: [
                        constructorParams.uriPrefix, constructorParams.checksum, constructorParams.predecessorId
                    ]
                });

            } catch (e) {
                console.error('Contract could not be verified:');
                console.error(e);
            }
        }

        const deploymentSummary = {
            address: address,
            chainId: chainId,
            tokenId: `urn:tar:eip155.${chainId}:${address.substring(2)}`,
            owner: await token.owner(),
            checksum: await token.checksum(0),
            dataUri: await token.dataUri(0),
            predecessorId: await token.predecessor()
        }

        if (params.json) {
            console.log(JSON.stringify(deploymentSummary));

        } else {

            const table = createCliTable();

            table.push(
                {'Token Id:': deploymentSummary.tokenId},
                {'Contract address:': deploymentSummary.address},
                {'Network:': `${hre.network.name} (${deploymentSummary.chainId})`},
                {'Owner:': deploymentSummary.owner},
                {'Checksum:': deploymentSummary.checksum},
                {'Data URI:': deploymentSummary.dataUri},
                {'Predecessor:': deploymentSummary.predecessorId}
            );

            console.log();
            console.log(table.toString());
        }

        if (deploymentSummary.predecessorId && params.replace) {

            console.log();

            try {
                await hre.run('replace', {
                    predecessor: deploymentSummary.predecessorId,
                    successor: deploymentSummary.tokenId,
                    force: true
                });

            } catch (e) {
                console.error('Predecessor could not be replaced:');
                console.error(e);
            }
        }

    });
