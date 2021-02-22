// SPDX-License-Identifier: MID

import "../libraries/StringUtil.sol";


pragma solidity >= 0.6.0 < 0.9.0;

// Just a wrapper around StringUtil library for unit testing.
contract TestStringUtil {
    using StringUtil for string;

    function strCompare(string memory a, string memory b) public pure returns (bool) {
        return a.strCompare(b);
    }

    function strConcat(string memory a, string memory b) public pure returns (string memory) {
        return a.strConcat(b);
    }

    function strLength(string memory str) public pure returns (uint) {
        return str.strLength();
    }
}