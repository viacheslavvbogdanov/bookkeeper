// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

interface IStableSwapOracle {
    function getRate(string memory _name, address _token0, address _token1) external view returns (bool, uint256);
}
