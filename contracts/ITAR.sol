// SPDX-License-Identifier: GPL-3.0-or-later
// SPDX-FileCopyrightText: Copyright (C) 2025 Compellio S.A.
// This program is free software: you can redistribute it and/or modify
// it under the terms of the GNU General Public License as published by
// the Free Software Foundation, either version 3 of the License, or
// (at your option) any later version.
//
// This program is distributed in the hope that it will be useful,
// but WITHOUT ANY WARRANTY; without even the implied warranty of
// MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
// GNU General Public License for more details.
//
// You should have received a copy of the GNU General Public License
// along with this program.  If not, see <https://www.gnu.org/licenses/>.

pragma solidity >=0.7.0 <0.9.0;

/**
 * @title Token Asset Record Standard
 */
interface ITAR {

    /**
     * This event emits when a new version is created.
     *
     * @param version The new version number
     * @param checksum The new version checksum
     */
    event Updated(uint256 indexed version, string checksum);

    /**
     * @notice Creates a new TAR version
     *
     * @param checksum The checksum of a the new version
     */
    function push(string memory checksum) external;

    /**
     * @notice Returns the total amount of versions stored by the contract
     *
     * @return A count of all versions tracked by this contract
     */
    function total() external view returns (uint256);

    /**
     * @notice Returns whether `version` exists.
     *
     * @param version A potential version number
     * @return True if _version exists, False otherwise
     */
    function exists(uint256 version) external view returns (bool);

    /**
     * @notice Returns the checksum of specific version.
     *
     * @param version A version number less than `totalVersions()`
     * @return The checksum of version
     */
    function checksum(uint256 version) external view returns (string memory);

    /**
     * @notice Returns the URI for `version`.
     *
     * @param version A version number less than `totalVersions()`
     * @return An RFC 3986 URI pointing toa JSON file containing the TAR's payload
     */
    function dataUri(uint256 version) external view returns (string memory);

}