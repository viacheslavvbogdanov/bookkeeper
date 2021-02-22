// SPDX-License-Identifier: MID

pragma solidity >= 0.6.0 < 0.9.0;

library StringUtil {
    function strCompare(string memory a, string memory b) internal pure returns (bool) {
        return keccak256(abi.encodePacked(a)) == keccak256(abi.encodePacked(b));
    }

    function strConcat(string memory a, string memory b) internal pure returns (string memory) {
        return string (abi.encodePacked(a,b));
    }

    function strLength(string memory str) internal pure returns (uint) {
        return bytes(str).length;
    }
}