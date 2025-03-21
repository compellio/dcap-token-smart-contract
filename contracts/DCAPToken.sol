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

pragma solidity ^0.8.28;

import {ITAR} from "./ITAR.sol";

contract DCAPToken is ITAR {

    bytes16 private constant HEX_DIGITS = "0123456789abcdef";

    address private _owner;
    bytes32 private _checksum;

    string private _uriPrefix;

    string private _successorId;
    string private _predecessorId;

    event Transferred(string successor);

    constructor(string memory uriPrefix_, bytes32 checksum_, string memory predecessorId_) {
        _owner = msg.sender;
        _checksum = checksum_;
        _uriPrefix = uriPrefix_;
        _predecessorId = predecessorId_;

        emit Updated(0, toHexString(uint256(_checksum), 32));
    }

    function push(string memory) public override virtual {
        revert("DCAPToken: single version token");
    }

    function dataUri(uint256) public override view returns (string memory) {
        return string(abi.encodePacked(_uriPrefix, toHexString(uint256(uint160(address(this))), 20)));
    }

    function owner() public view returns (address) {
        return _owner;
    }

    function total() public override pure returns (uint256) {
        return 1;
    }

    function replace(string memory successorId_) public {
        require(msg.sender == _owner, "DCAPToken: unauthorized");
        require(bytes(_successorId).length == 0, "DCAPToken: already replaced");

        _successorId = successorId_;

        emit Transferred(successorId_);
    }

    function successor() public view returns (string memory) {
        return _successorId;
    }

    function predecessor() public view returns (string memory) {
        return _predecessorId;
    }

    function checksum(uint256 version_) public view returns (string memory) {
        require(exists(version_), "TAR: version does not exist");
        return toHexString(uint256(_checksum), 32);
    }

    function exists(uint256 version_) public override pure returns (bool) {
        return version_ == 0;
    }

    function toHexString(uint256 value, uint256 length) internal pure returns (string memory) {
        uint256 localValue = value;
        bytes memory buffer = new bytes(2 * length + 2);
        buffer[0] = "0";
        buffer[1] = "x";
        for (uint256 i = 2 * length + 1; i > 1; --i) {
            buffer[i] = HEX_DIGITS[localValue & 0xf];
            localValue >>= 4;
        }
        return string(buffer);
    }

}
