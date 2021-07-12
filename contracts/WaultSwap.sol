// SPDX-License-Identifier: MIT
import "./UniSwap.sol";

pragma solidity 0.6.12;

contract WaultSwap is UniSwap {
    constructor(address _factoryAddress) UniSwap(_factoryAddress) public {
    }
}
