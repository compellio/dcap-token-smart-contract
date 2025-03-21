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

import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

const DCAPTokenModule = buildModule("DCAPTokenModule", (m) => {

    const uriPrefix = m.getParameter<string>("uriPrefix");
    const checksum = m.getParameter<string>("checksum");
    const predecessorId = m.getParameter<string>("predecessorId", "");

    const token = m.contract("DCAPToken", [uriPrefix, checksum, predecessorId]);

    return { token };

});

export default DCAPTokenModule;
