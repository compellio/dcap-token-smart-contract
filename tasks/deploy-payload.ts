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
import canonicalize from "canonicalize";
import fs from "fs";
import {createHash} from "node:crypto";

task("deploy:payload", "Deploy a DCAP Token from a JSON payload")
    .addPositionalParam("uriPrefix", "The URI prefix of the DCAP token registry.")
    .addOptionalPositionalParam("path", "The path to a JSON file including a Cultural Heritage Object instance")
    .addOptionalParam("predecessor", "The Token Id of a predecessor token (optional - used when replacing existing tokens).")
    .addFlag("json", "Return a deployment summary in JSON.")
    .addFlag("stdin", "Read the DCAP Token payload from stdin")
    .addFlag("replace", "Attempt to replace the predecessor after successful deployment.")
    .addFlag("verify", "Attempt to verify the contract after a successful deployment.")
    .setAction(async ({path, stdin, ...params}, hre) => {

        if (path && stdin || !path && !stdin) {
            throw new Error('You must either provide a path or use --stdin');
        }

        const input = fs.readFileSync(stdin ? 0 : path).toString();
        const json = JSON.parse(input);

        const canonical = canonicalize(json);

        if (!canonical) {
            throw new Error('could not canonicalize input file.');
        }

        const checksum = createHash('sha256').update(canonical).digest('hex');

        await hre.run('deploy', { checksum, ...params })

    });
