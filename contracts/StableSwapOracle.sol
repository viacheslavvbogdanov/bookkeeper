// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

//import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/utils/SafeCast.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

interface IERC20 {
    function decimals() external view returns (uint256);
}

contract StableSwapOracle is Ownable {
    using SafeCast for uint;
    using SafeCast for int;

    struct StableSwapProvider {
        string name;
        address addr;
        bytes4 coins; // representing the function that gives underlying coins f(uint256) -> address
        bytes4 exchange; // representing function that gives the output amount f(int128,int128,uint256) -> uint256
    }

    mapping(string => StableSwapProvider) public registry;

    string[] stableSwapProviders;

    function _getCoinIndex(address _target, address _token, bytes memory data) private view
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
        uint256 key0;
        uint256 key1;

        for (uint256 i = 0; i < 10; i++) {

            data = abi.encodeWithSelector(_coins, i);
            (success, returnAddress) = _getCoinIndex(_target, _token0, data);

            if (returnAddress == _token0 && success) {
                key0 = i;

            } else if (returnAddress == _token1 && success) {
                key1 = i;

            } else if (!success) {
                break;
            }
        }

        return (true, key0, key1);
    }

    function addStableSwapProvider(string memory _name, address _addr, bytes4 _coins, bytes4 _exchange)
    public
    onlyOwner
    returns (bool)
    {
        StableSwapProvider memory s;

        s.name = _name;
        s.addr = _addr;
        s.coins = _coins;
        s.exchange = _exchange;

        registry[_name] = s;

        return true;
    }

    function getRate(string memory _name, address _token0, address _token1) public view
    returns (bool, uint256)
    {
        StableSwapProvider memory s = registry[_name];
        IERC20 token0 = IERC20(_token0);
        uint256 decimals = token0.decimals();
        uint256 token_amount = 10 ** decimals;

        (bool keysSuccess, uint256 _key0, uint256 _key1) = _getKeys(s.addr, s.coins, _token0, _token1);

        require(keysSuccess, "couldn't find tokens in this exchange");

        int128 key0 = _key0.toInt256().toInt128();
        int128 key1 = _key1.toInt256().toInt128();

        bytes memory data = abi.encodeWithSelector(s.exchange, key0, key1, token_amount);

        (bool success, bytes memory returnData) = s.addr.staticcall(data);

        require(success, "failed to get exchange rate");

        return (true, abi.decode(returnData, (uint256)));
    }

}



