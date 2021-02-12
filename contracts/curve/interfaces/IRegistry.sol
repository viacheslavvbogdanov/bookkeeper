pragma solidity >=0.5.0;

interface IRegistry {
  function get_n_coins(address _pool) external view returns (uint256[2]);
  function get_underlying_coins(address _pool) external view returns (address[8]);
  function get_underlying_balances(address _pool) external view returns (uint256[8]);
  function get_pool_from_lp_token(address _lp_token) external view returns (address);
}
