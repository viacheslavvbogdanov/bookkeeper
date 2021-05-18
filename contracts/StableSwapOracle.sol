// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";

contract StableSwapOracle is Ownable {
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private stableTokens;

    struct registry {
        address _address;
        bytes _calldata;
    }

    mapping(address => registry) tokenToPrice;

    function modifyRegistry(address _token, address _address, bytes calldata _calldata)
    external onlyOwner
    returns (bool)
    {
        registry memory r;
        r._address = _address;
        r._calldata = _calldata;
        tokenToPrice[_token] = r;
        return true;
    }

    function addStableToken(address _token)
    external onlyOwner
    returns (bool)
    {
        stableTokens.add(_token);
        return true;
    }

    function removeStableToken(address _token)
    external onlyOwner
    returns (bool)
    {
        stableTokens.remove(_token);
        return true;
    }

    function isStableToken(address _token)
    internal view
    returns (bool)
    {
        return stableTokens.contains(_token);
    }

    function getStablesPrice(address _token)
    internal view
    returns (uint256)
    {
        registry memory r = tokenToPrice[_token];
        (bool success, bytes memory returnData) = r._address.staticcall(r._calldata);
        require(success, "oh no, something didn't work out!");
        return abi.decode(returnData, (uint256));

    }
}



