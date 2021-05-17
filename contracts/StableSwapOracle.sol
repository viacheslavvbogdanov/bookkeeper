// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/utils/SafeCast.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function decimals() external view returns (uint256);
}

contract StableSwapOracle is Ownable {
    using SafeCast for uint;
    using SafeCast for int;

    struct StableSwapProvider {
        address addr;
        bytes4 coins; // representing the function that gives underlying coins f(uint256) -> address
        bytes4 exchange; // representing function that gives the output amount f(int128,int128,uint256) -> uint256
    }

    mapping(address => StableSwapProvider) public registry;

    address public defaultProvider = 0x160CAed03795365F3A589f10C379FfA7d75d4E76;
    address public defaultSecondToken = 0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56;

    address[] private stableSwapProviders;

    function _getCoinIndex(address _target, bytes memory data) private view
    returns (bool, address)
    {

        (bool success, bytes memory returnData) = _target.staticcall(data);

        if (success) {
            return (true, abi.decode(returnData, (address)));
        } else {
            return (false, address(0));
        }

    }

    function _getKeys(address _target, bytes4 _coins, address _token0, address _token1) private view
    returns (bool, uint256, uint256)
    {
        bytes memory data;
        address returnAddress;
        bool success;
        bool gotKey0 = false;
        bool gotKey1 = false;
        uint256 key0;
        uint256 key1;

        for (uint256 i = 0; i < 10; i++) {

            data = abi.encodeWithSelector(_coins, i);
            (success, returnAddress) = _getCoinIndex(_target, data);

            if (returnAddress == _token0 && success) {
                key0 = i;
                gotKey0 = true;
            } else if (returnAddress == _token1 && success) {
                key1 = i;
                gotKey1 = true;
            } else if (!success) {
                break;
            }
        }

        return (gotKey0 && gotKey1, key0, key1);
    }

    function addStableSwapProvider(address _addr, bytes4 _coins, bytes4 _exchange)
    public
    onlyOwner
    returns (bool)
    {
        StableSwapProvider memory s;

        s.addr = _addr;
        s.coins = _coins;
        s.exchange = _exchange;

        registry[_addr] = s;

        stableSwapProviders.push(_addr);
        return true;
    }

    function changeDefaultProvider(address _addr) public onlyOwner
    returns (bool)
    {
        require(_addr != address(0));
        defaultProvider = _addr;
        return true;

    }

    function changeDefaultSecondToken(address _addr) public onlyOwner
    returns (bool)
    {
        require(_addr != address(0));
        defaultSecondToken = _addr;
        return true;

    }

    function _getPriceStables(address _addr, address _token0, address _token1) private view
    returns (bool, uint256)
    {
        require(_token0 != _token1, "cannot get rate for identical tokens");

        StableSwapProvider memory s = registry[_addr];
        IERC20 token0 = IERC20(_token0);
        uint256 decimals = token0.decimals();
        uint256 token_amount = 10 ** decimals;

        (bool keysSuccess, uint256 _key0, uint256 _key1) = _getKeys(s.addr, s.coins, _token0, _token1);

        require(keysSuccess, "couldn't find tokens in this exchange");

        uint8 key0 = _key0.toUint8();
        uint8 key1 = _key1.toUint8();

        bytes memory data = abi.encodeWithSelector(s.exchange, key0, key1, token_amount);

        (bool success, bytes memory returnData) = s.addr.staticcall(data);

        require(success, "failed to get exchange rate");

        return (true, abi.decode(returnData, (uint256)));
    }

    function getPriceStables(address _addr, address _token0, address _token1) public view
    returns (bool, uint256)
    {
        return _getPriceStables(_addr, _token0, _token1);
    }

    // will use default second token
    function getPriceStables(address _addr, address _token0) public view
    returns (bool, uint256)
    {
        return _getPriceStables(_addr, _token0, defaultSecondToken);
    }

    // will use the default provider and as second token default second token
    function getPriceStables(address _token0) public view
    returns (bool, uint256)
    {
        return _getPriceStables(defaultProvider, _token0, defaultSecondToken);
    }

    function getCoins(address _addr) public view
    returns (address[] memory)
    {
        StableSwapProvider memory s = registry[_addr];
        bytes memory data;
        address returnAddress;
        bool success;
        uint8 counter = 0;
        address[] memory addys = new address[](10);

        for (uint256 i = 0; i < 10; i++) {

            data = abi.encodeWithSelector(s.coins, i);
            (success, returnAddress) = _getCoinIndex(_addr, data);

            if (success) {
                addys[i] = returnAddress;
                counter = counter + 1;
            } else if (!success) {
                break;
            }
        }

        address[] memory _addys = new address[](counter);
        for (uint256 i = 0; i < _addys.length; i++) {
            _addys[i] = addys[i];
        }

        return _addys;
    }

    function getStableSwapProviders() public view
    returns (address[] memory)
    {
        address[] memory addys = new address[](stableSwapProviders.length);

        for (uint256 i = 0; i < stableSwapProviders.length; i++) {
            addys[i] = stableSwapProviders[i];
        }

        return addys;
    }

}



