// SPDX-License-Identifier: MIT
import "./UniSwap.sol";

pragma solidity 0.6.12;

contract QuickSwap is UniSwap {
    constructor(address _factoryAddress) UniSwap(_factoryAddress) public {
    }
}
