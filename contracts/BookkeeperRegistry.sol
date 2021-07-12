// SPDX-License-Identifier: MIT
import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./interface/IStrategy.sol";
import "./interface/IVault.sol";
import "./Governable.sol";
import "./interface/IRewardPool.sol";

pragma solidity 0.6.12;

contract BookkeeperRegistry is Governable {

    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    // Keeping track of links between all added contracts.
    mapping (address => bool) public isActive;
    mapping (address => uint256) public addedOnBlock;
    mapping (address => string) public contractType;
    mapping (address => address) public vaultStrategy;
    mapping (address => address[]) public vaultStrategies;
    mapping (address => address) public strategyVault;
    mapping (address => address) public vaultRewardPool;
    mapping (address => address) public rewardPoolVault;
    mapping (address => address) public vaultUnderlying;
    mapping (address => address[]) public underlyingVaults;
    mapping (address => bool) public vaultMultipleStrategies;
    address[] underlyingVaultsTemp;
    address[] vaultStrategiesTemp;
    address[] vaultList;
    address[] strategyList;
    address[] rewardPoolList;

    modifier validVault(address _vault){
        require(keccak256(abi.encodePacked(contractType[_vault])) ==
        keccak256(abi.encodePacked("vault")), "vault does not exist");
        require(isActive[_vault], "contract is not active");
        _;
    }
    modifier isVault(address _vault){
      require(keccak256(abi.encodePacked(contractType[_vault])) ==
      keccak256(abi.encodePacked("vault")), "vault does not exist");
      _;
    }
    modifier validStrategy(address _strategy){
        require(keccak256(abi.encodePacked(contractType[_strategy])) ==
        keccak256(abi.encodePacked("strategy")), "strategy does not exist");
        require(isActive[_strategy], "contract is not active");
        _;
    }
    modifier validRewardPool(address _rewardPool){
        require(keccak256(abi.encodePacked(contractType[_rewardPool])) ==
        keccak256(abi.encodePacked("rewardPool")), "reward pool does not exist");
        require(isActive[_rewardPool], "contract is not active");
        _;
    }
    modifier validUnderlying(address _underlying){
        require(keccak256(abi.encodePacked(contractType[_underlying])) ==
        keccak256(abi.encodePacked("underlying")), "underlying does not exist");
        require(isActive[_underlying], "contract is not active");
        _;
    }
    modifier singleStrategy(address _vault){
      require(!vaultMultipleStrategies[_vault], "Method does not allow multiple strategy vault");
      _;
    }
    modifier multipleStrategies(address _vault){
      require(vaultMultipleStrategies[_vault], "Method only allows multiple strategy vault");
      _;
    }

    event VaultAdded(address vault, address strategy, address rewardPool, address underlying);
    event RewardPoolChanged(address vault, address newRewardPool, address oldRewardPool);
    event StrategyChanged(address vault, address newStrategy, address oldStrategy);
    event VaultRemoved(address vault, address strategy, address rewardPool);
    event StrategyRemoved(address strategy, address vault);
    event RewardPoolRemoved(address rewardPool, address vault);

    constructor()
    Governable(msg.sender) public {}

    //Add a vault. RewardPool can be address(0).
    function addVault(address _vault, address _rewardPool, bool _multipleStrategies) external onlyGovernance {
        require(_vault != address(0), "new vault should not be empty");
        require(keccak256(abi.encodePacked(contractType[_vault])) != keccak256(abi.encodePacked("vault")), "vault already exists");

        address vault = _vault;
        address strategy = IVault(_vault).strategy();
        address rewardPool = _rewardPool;
        address underlying = IVault(_vault).underlying();

        isActive[vault] = true;
        addedOnBlock[vault] = block.number;
        contractType[vault] = "vault";
        vaultUnderlying[vault] = underlying;
        vaultMultipleStrategies[vault] = _multipleStrategies;

        if (vaultMultipleStrategies[vault]) {
          vaultStrategies[vault].push(strategy);
        } else {
          vaultStrategy[vault] = strategy;
        }

        isActive[strategy] = true;
        addedOnBlock[strategy] = block.number;
        contractType[strategy] = "strategy";
        strategyVault[strategy] = vault;

        if (rewardPool != address(0)){
          vaultRewardPool[vault] = rewardPool;
          isActive[rewardPool] = true;
          addedOnBlock[rewardPool] = block.number;
          contractType[rewardPool] = "rewardPool";
          rewardPoolVault[rewardPool] = vault;
        }

        isActive[underlying] = true;
        addedOnBlock[underlying] = block.number;
        contractType[underlying] = "underlying";
        underlyingVaults[underlying].push(vault);

        vaultList.push(vault);
        strategyList.push(strategy);
        rewardPoolList.push(rewardPool);

        emit VaultAdded(vault, strategy, rewardPool, underlying);
    }

    //Change Reward Pool for existing vault.
    function changeRewardPool(address _rewardPool) external onlyGovernance isVault(IRewardPool(_rewardPool).lpToken()) {
      require(_rewardPool != address(0), "new reward pool should not be empty");

      address rewardPool = _rewardPool;
      address vault = IRewardPool(rewardPool).lpToken();

      isActive[vault] = true;
      address oldRewardPool = vaultRewardPool[vault];
      isActive[oldRewardPool] = false;
      vaultRewardPool[vault] = rewardPool;

      isActive[rewardPool] = true;
      addedOnBlock[rewardPool] = block.number;
      contractType[rewardPool] = "rewardPool";
      rewardPoolVault[rewardPool] = vault;

      rewardPoolList.push(rewardPool);

      uint256 i;
      for ( i=0;i<rewardPoolList.length;i++) {
        if (oldRewardPool == rewardPoolList[i]){
          break;
        }
      }
      while (i<rewardPoolList.length-1) {
        rewardPoolList[i] = rewardPoolList[i+1];
        i++;
      }
      /* rewardPoolList.length--; */


      emit RewardPoolChanged(vault, rewardPool, oldRewardPool);
    }

    //Change strategy for existing vault.
    function changeStrategy(address _strategy) external onlyGovernance isVault(IStrategy(_strategy).vault()) {
      require(_strategy != address(0), "new strategy should not be empty");

      address strategy = _strategy;
      address vault = IStrategy(strategy).vault();
      strategyList.push(strategy);

      isActive[vault] = true;
      address oldStrategy;
      if (vaultMultipleStrategies[vault]){
        oldStrategy = address(0);
        vaultStrategies[vault].push(strategy);
      }
      else{
        oldStrategy = vaultStrategy[vault];
        isActive[oldStrategy] = false;
        vaultStrategy[vault] = strategy;

        uint256 i;
        for ( i=0;i<strategyList.length;i++) {
          if (oldStrategy == strategyList[i]){
            break;
          }
        }
        while (i<strategyList.length-1) {
          strategyList[i] = strategyList[i+1];
          i++;
        }
        /* strategyList.length--; */
      }

      isActive[strategy] = true;
      addedOnBlock[strategy] = block.number;
      contractType[strategy] = "strategy";
      strategyVault[strategy] = vault;

      emit StrategyChanged(vault, strategy, oldStrategy);
    }

    function getVaultInfoSingleStrategy(address _vault) internal view validVault(_vault) singleStrategy(_vault) returns(
      uint256, address[] memory, uint256[] memory, address, uint256, address) {

      address vault = _vault;
      uint256 vaultAdded = addedOnBlock[vault];
      address[] memory strategy = new address[](1);
      uint256[] memory strategyAdded = new uint256[](1);
      strategy[0] = vaultStrategy[vault];
      strategyAdded[0] = addedOnBlock[strategy[0]];
      address rewardPool = vaultRewardPool[vault];
      uint256 rewardPoolAdded = addedOnBlock[rewardPool];
      address underlying = vaultUnderlying[vault];

      return (vaultAdded, strategy, strategyAdded, rewardPool, rewardPoolAdded, underlying);
    }

    function getVaultInfoMultipleStrategies(address _vault) internal view validVault(_vault) multipleStrategies(_vault) returns(
      uint256, address[] memory, uint256[] memory, address, uint256, address) {

      address vault = _vault;
      uint256 vaultAdded = addedOnBlock[vault];
      address[] memory strategies = vaultStrategies[vault];
      uint256[] memory strategiesAdded = new uint256[](strategies.length);
      for (uint256 i=0;i<strategies.length;i++) {
        strategiesAdded[i] = addedOnBlock[strategies[i]];
      }
      address rewardPool = vaultRewardPool[vault];
      uint256 rewardPoolAdded = addedOnBlock[rewardPool];
      address underlying = vaultUnderlying[vault];

      return (vaultAdded, strategies, strategiesAdded, rewardPool, rewardPoolAdded, underlying);
    }

    function getVaultInfo(address _vault) external view validVault(_vault) returns(
      uint256, address[] memory, uint256[] memory, address, uint256, address) {

      if (vaultMultipleStrategies[_vault]) {
        return getVaultInfoMultipleStrategies(_vault);
      } else {
        return getVaultInfoSingleStrategy(_vault);
      }
    }

    function getStrategyInfo(address _strategy) external view validStrategy(_strategy) returns(
      uint256, address, uint256, address, uint256, address) {

      address strategy = _strategy;
      uint256 strategyAdded = addedOnBlock[strategy];
      address vault = strategyVault[strategy];
      uint256 vaultAdded = addedOnBlock[vault];
      address rewardPool = vaultRewardPool[vault];
      uint256 rewardPoolAdded = addedOnBlock[rewardPool];
      address underlying = vaultUnderlying[vault];

      return (strategyAdded, vault, vaultAdded, rewardPool, rewardPoolAdded, underlying);
    }

    function getRewardPoolInfoSingleStrategy(address _vault) internal view validVault(_vault) singleStrategy(_vault) returns(
      uint256, address, uint256, address[] memory, uint256[] memory, address) {

      address vault = _vault;
      uint256 vaultAdded = addedOnBlock[vault];
      address[] memory strategy = new address[](1);
      uint256[] memory strategyAdded = new uint256[](1);
      strategy[0] = vaultStrategy[vault];
      strategyAdded[0] = addedOnBlock[strategy[0]];
      address rewardPool = vaultRewardPool[vault];
      uint256 rewardPoolAdded = addedOnBlock[rewardPool];
      address underlying = vaultUnderlying[vault];

      return (rewardPoolAdded, vault, vaultAdded, strategy, strategyAdded, underlying);
    }

    function getRewardPoolInfoMultipleStrategies(address _vault) internal view validVault(_vault) multipleStrategies(_vault) returns(
      uint256, address, uint256, address[] memory, uint256[] memory, address) {

      address vault = _vault;
      uint256 vaultAdded = addedOnBlock[vault];
      address[] memory strategies = vaultStrategies[vault];
      uint256[] memory strategiesAdded = new uint256[](strategies.length);
      for (uint256 i=0;i<strategies.length;i++) {
        strategiesAdded[i] = addedOnBlock[strategies[i]];
      }
      address rewardPool = vaultRewardPool[vault];
      uint256 rewardPoolAdded = addedOnBlock[rewardPool];
      address underlying = vaultUnderlying[vault];

      return (rewardPoolAdded, vault, vaultAdded, strategies, strategiesAdded, underlying);
    }

    function getRewardPoolInfo(address _rewardPool) external view validRewardPool(_rewardPool) returns(
      uint256, address, uint256, address[] memory, uint256[] memory, address) {

      address rewardPool = _rewardPool;
      address vault = rewardPoolVault[rewardPool];
      if (vaultMultipleStrategies[vault]) {
        return getRewardPoolInfoMultipleStrategies(vault);
      } else {
        return getRewardPoolInfoSingleStrategy(vault);
      }
    }

    function getUnderlyingInfo(address _underlying) external view validUnderlying(_underlying) returns(
      address[] memory, uint256[] memory, address[] memory, uint256[] memory) {

      address underlying = _underlying;
      address[] memory vaults = underlyingVaults[underlying];
      uint256[] memory vaultsAdded = new uint256[](vaults.length);
      address[] memory rewardPools = new address[](vaults.length);
      uint256[] memory rewardPoolsAdded = new uint256[](vaults.length);


      for (uint256 i = 0; i<vaults.length;i++) {
        vaultsAdded[i] = addedOnBlock[vaults[i]];
        rewardPools[i] = vaultRewardPool[vaults[i]];
        rewardPoolsAdded[i] = addedOnBlock[rewardPools[i]];
      }

      return(vaults, vaultsAdded, rewardPools, rewardPoolsAdded);
    }

    //This will deactivate all strategies and reward pool associated to vault.
    //If it is only vault for underlying this will be deactivated too.
    function removeVault(address _vault) external onlyGovernance validVault(_vault) {
      address vault = _vault;
      address underlying = vaultUnderlying[vault];
      uint256 i;


      isActive[vault] = false;
      if (underlyingVaults[underlying].length<=1) {
        isActive[underlying] = false;
      }

      for ( i=0;i<underlyingVaults[underlying].length;i++) {
        if (vault == underlyingVaults[underlying][i]){
          break;
        }
      }
      while (i<underlyingVaults[underlying].length-1) {
        underlyingVaults[underlying][i] = underlyingVaults[underlying][i+1];
        i++;
      }
      /* underlyingVaults[underlying].length--; */

      for ( i=0;i<vaultList.length;i++) {
        if (vault == vaultList[i]){
          break;
        }
      }
      while (i<vaultList.length-1) {
        vaultList[i] = vaultList[i+1];
        i++;
      }
      /* vaultList.length--; */

      if (vaultMultipleStrategies[vault]){
        for(i=0;i<vaultStrategies[vault].length;i++){
          removeStrategy(vaultStrategies[vault][i]);
        }
      } else {
        if(vaultStrategy[vault]!=address(0)){
          removeStrategy(vaultStrategy[vault]);
        }
      }

      address rewardPool = vaultRewardPool[vault];
      if (rewardPool != address(0)) {
        removeRewardPool(rewardPool);
      }

      emit VaultRemoved(vault,vaultStrategy[vault],rewardPool);
    }

    //Deactivate strategy.
    function removeStrategy(address _strategy) public onlyGovernance validStrategy(_strategy) {
      address strategy = _strategy;
      address vault = strategyVault[strategy];
      isActive[strategy] = false;
      uint256 i;

      if (!vaultMultipleStrategies[vault]) {
        vaultStrategy[vault] = address(0);
      } else {
        for ( i=0;i<vaultStrategies[vault].length;i++) {
          if (strategy == vaultStrategies[vault][i]){
            break;
          }
        }
        while (i<vaultStrategies[vault].length-1) {
          vaultStrategies[vault][i] = vaultStrategies[vault][i+1];
          i++;
        }
        /* vaultStrategies[vault].length--; */
      }

      for ( i=0;i<strategyList.length;i++) {
        if (strategy == strategyList[i]){
          break;
        }
      }
      while (i<strategyList.length-1) {
        strategyList[i] = strategyList[i+1];
        i++;
      }
      /* strategyList.length--; */

      emit StrategyRemoved(strategy,vault);
    }

    //Deactivate reward pool. This does not deactivate the vault.
    function removeRewardPool(address _rewardPool) public onlyGovernance validRewardPool(_rewardPool) {
      address rewardPool = _rewardPool;
      address vault = rewardPoolVault[rewardPool];
      vaultRewardPool[vault] = address(0);
      isActive[rewardPool] = false;

      uint256 i;
      for ( i=0;i<rewardPoolList.length;i++) {
        if (rewardPool == rewardPoolList[i]){
          break;
        }
      }
      while (i<rewardPoolList.length-1) {
        rewardPoolList[i] = rewardPoolList[i+1];
        i++;
      }
      /* rewardPoolList.length--; */

      emit RewardPoolRemoved(rewardPool,vault);
    }

    function getAllVaults() external view returns (address[] memory) {
      return (vaultList);
    }

    function getAllStrategies() external view returns (address[] memory) {
      return (strategyList);
    }

    function getAllRewardPools() external view returns (address[] memory) {
      return (rewardPoolList);
    }

    // transfers token in the controller contract to the governance
    function salvage(address _token, uint256 _amount) external onlyGovernance {
        IERC20(_token).safeTransfer(governance, _amount);
    }

}
