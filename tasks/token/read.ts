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

import {createCliTable, extractTokenProperties, getNetworkProvider} from "../../lib/utils";
import {tokenScope} from "../token";

interface TokenDetails {
    id: string;
    chainId: bigint;
    address: string;
    predecessor: string;
    successor: string;
    owner: string;
    dataUri: string;
    checksum: string;
}

tokenScope.task("read", "Reads a DCAP Token")
    .addPositionalParam("tokenId", "A token Id of the predecessor token")
    .addFlag('json', "Display the token as a JSON string")
    .setAction(async (params, hre) => {

        const DCAPToken = await hre.ethers.getContractFactory("DCAPToken");

        async function fetchDetails(tokenId: string): Promise<TokenDetails> {
            const token = extractTokenProperties(tokenId);
            const tokenNetwork = await getNetworkProvider(hre, token.chainId);

            const provider = new hre.ethers.JsonRpcProvider(tokenNetwork.url);

            const tokenContract = DCAPToken.connect(provider).attach(token.address);

            const [predecessor, successor, owner, dataUri, checksum] = await Promise.all([
                tokenContract.getFunction('predecessor')(),
                tokenContract.getFunction('successor')(),
                tokenContract.getFunction('owner')(),
                tokenContract.getFunction('dataUri')(0),
                tokenContract.getFunction('checksum')(0)
            ])

            return {
                id: token.tokenId, chainId: token.chainId, address: token.address,
                predecessor, successor, owner, dataUri, checksum
            }
        }

        async function* traverse(tokenId: string, next: (token: TokenDetails) => string): AsyncGenerator<TokenDetails> {
            const token = await fetchDetails(tokenId);
            const nextToken = next(token);

            if (nextToken) {
                yield fetchDetails(nextToken);
                yield* traverse(nextToken, next);
            }
        }

        const token = await fetchDetails(params.tokenId);
        const predecessors: Array<TokenDetails> = (await Array.fromAsync(traverse(params.tokenId, (t) => t.predecessor))).reverse();
        const successors: Array<TokenDetails> = await Array.fromAsync(traverse(params.tokenId, (t) => t.successor))

        const summary = {
            ...token, predecessors, successors
        }

        if (params.json) {
            console.log(JSON.stringify(
                summary,
                (_, value) => typeof value === 'bigint' ? value.toString() : value)
            )
            return;
        }

        const table = createCliTable();

        table.push(
            {'Token Id:': summary.id},
            {'Network:': summary.chainId},
            {'Owner:': summary.owner},
            {'Data URI:': summary.dataUri},
            {'Checksum:': summary.checksum},
        );

        const history = [...summary.predecessors, token, ...summary.successors];

        for (let i = 0; i < history.length; i++) {
            const value = `[${history[i].id === token.id ? '>' : ' '}${i+1}] ${history[i].id}`;
            table.push((i === 0) ? {'History:': value} : {'': value})
        }

        console.log(table.toString());

    });
