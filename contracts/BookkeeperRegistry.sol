import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "./hardworkInterface/IStrategy.sol";
import "./hardworkInterface/IVault.sol";
import "./Storage.sol";
import "./Governable.sol";
import "./hardworkInterface/IRewardPool.sol";
import "./Controllable.sol";

// File: contracts/Viewer.sol

pragma solidity 0.5.16;

contract Viewer is Governable {

    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    // Keeping track of all added contracts. Lists are made so they can be returned by functions.
    mapping (address => bool) public vaultCheck;
    mapping (address => bool) public strategyCheck;
    mapping (address => bool) public rewardPoolCheck;
    mapping (address => bool) public coreContractCheck;
    mapping (address => address) public vaultRewardPool;
    mapping (address => address) public rewardPoolVault;
    address[] vaultList;
    address[] strategyList;
    address[] rewardPoolList;
    address[] coreContractList;

    modifier validVault(address _vault){
        require(vaultCheck[_vault], "vault does not exist");
        _;
    }
    modifier validStrategy(address _strategy){
        require(strategyCheck[_strategy], "strategy does not exist");
        _;
    }
    modifier validRewardPool(address _rewardPool){
        require(rewardPoolCheck[_rewardPool], "reward pool does not exist");
        _;
    }
    modifier validCoreContract(address _coreContract){
        require(coreContractCheck[_coreContract], "core contract does not exist");
        _;
    }

    event VaultAdded(address vault, address strategy, address rewardPool);
    event RewardPoolChanged(address vault, address newRewardPool, address oldRewardPool);
    event StrategyChanged(address vault, address newStrategy, address oldStrategy);

    constructor(address _storage)
    Governable(_storage) public {}

    //I did not find a consistent on-chain link between Vaults and Reward Pools, so it seems they would have to be added in pairs to keep track of the linkage.
    function addVaultAndRewardPool(address _vault, address _rewardPool) external onlyGovernance {
        require(_vault != address(0), "new vault shouldn't be empty");
        require(!vaultCheck[_vault], "vault already exists");
        require(_rewardPool != address(0), "new reward pool shouldn't be empty");

        vaultCheck[_vault] = true;
        strategyCheck[IVault(_vault).strategy()] = true;
        rewardPoolCheck[_rewardPool] = true;
        vaultList.push(_vault);
        strategyList.push(IVault(_vault).strategy());
        rewardPoolList.push(_rewardPool);
        vaultRewardPool[_vault] = _rewardPool;
        rewardPoolVault[_rewardPool] = _vault;

        emit VaultAdded(_vault, IVault(_vault).strategy(), _rewardPool);
    }

    //Change Reward Pool for existing vault. Again vault is needed as input, as no on-chain link.
    function changeRewardPool(address _rewardPool, address _vault) external onlyGovernance validVault(_vault) {
      require(_vault != address(0), "vault shouldn't be empty");
      require(!rewardPoolCheck[_rewardPool], "reward pool already exists");
      require(_rewardPool != address(0), "new reward pool shouldn't be empty");

      uint i = 0;
      while (vaultList[i] != _vault) {
        i++;
        require(i<vaultList.length, "Vault not in vaultList");
      }
      address oldRewardPool = rewardPoolList[i];

      rewardPoolCheck[_rewardPool] = true;
      rewardPoolCheck[oldRewardPool] = false;
      rewardPoolList[i] = _rewardPool;
      vaultRewardPool[_vault] = _rewardPool;
      rewardPoolVault[_rewardPool] = _vault;

      emit RewardPoolChanged(_vault, _rewardPool, oldRewardPool);
    }

    //Change strategy for existing vault. No vault input needed as it is contained in the strategy. If the strategy is for a vault that was not yet added the vault should be added first.
    function changeStrategy(address _strategy) external onlyGovernance {
      require(_strategy != address(0), "new strategy shouldn't be empty");
      require(!strategyCheck[_strategy], "strategy already exists");
      address vault = IStrategy(_strategy).vault();
      require(vaultCheck[vault], "Unknown vault. Add vault first.");

      uint i = 0;
      while (vaultList[i] != vault) {
        i++;
        require(i<vaultList.length, "Vault not in vaultList");
      }
      address oldStrategy = strategyList[i];

      strategyCheck[_strategy] = true;
      strategyCheck[oldStrategy] = false;
      strategyList[i] = _strategy;

      emit StrategyChanged(vault, _strategy, oldStrategy);
    }

    //Possibility to add core contracts, just for registry.
    function addCoreContract(address _coreContract) external onlyGovernance {
      require(_coreContract != address(0), "new contract shouldn't be empty");
      coreContractCheck[_coreContract] = true;
      coreContractList.push(_coreContract);
    }

    function removeVault(address _vault) external onlyGovernance validVault(_vault) {
      uint i = 0;
      while (vaultList[i] != _vault) {
        i++;
        require(i<vaultList.length, "Vault not in vaultList");
      }
      while (i<vaultList.length-1) {
        vaultList[i] = vaultList[i+1];
        i++;
      }
      vaultList.length--;
      vaultCheck[_vault] = false;
      rewardPoolVault[vaultRewardPool[_vault]] = address(0);
    }

    function removeStrategy(address _strategy) external onlyGovernance validStrategy(_strategy) {
      uint i = 0;
      while (strategyList[i] != _strategy) {
        i++;
        require(i<strategyList.length, "Strategy not in strategyList");
      }
      while (i<strategyList.length-1) {
        strategyList[i] = strategyList[i+1];
        i++;
      }
      strategyList.length--;
      strategyCheck[_strategy] = false;
    }

    function removeRewardPool(address _rewardPool) external onlyGovernance validRewardPool(_rewardPool) {
      uint i = 0;
      while (rewardPoolList[i] != _rewardPool) {
        i++;
        require(i<rewardPoolList.length, "Reward Pool not in rewardPoolList");

      }
      while (i<rewardPoolList.length-1) {
        rewardPoolList[i] = rewardPoolList[i+1];
        i++;
      }
      rewardPoolList.length--;
      rewardPoolCheck[_rewardPool] = false;
      vaultRewardPool[rewardPoolVault[_rewardPool]] = address(0);
    }

    function removeCoreContract(address _coreContract) external onlyGovernance validCoreContract(_coreContract) {
      uint i = 0;
      while (coreContractList[i] != _coreContract) {
        i++;
        require(i<coreContractList.length, "Contract not in coreContractList");

      }
      while (i<coreContractList.length-1) {
        coreContractList[i] = coreContractList[i+1];
        i++;
      }
      coreContractList.length--;
      coreContractCheck[_coreContract] = false;
    }

    function getVaultList() public view returns (address[] memory){
      return vaultList;
    }

    function getStrategyList() public view returns (address[] memory){
      return strategyList;
    }

    function getRewardPoolList() public view returns (address[] memory){
      return rewardPoolList;
    }

    function getCoreContractList() public view returns (address[] memory){
      return coreContractList;
    }

    function isHarvestContract(address _contract) public view returns (bool){
      bool check = vaultCheck[_contract] || strategyCheck[_contract] || rewardPoolCheck[_contract] || coreContractCheck[_contract];
      return check;
    }

    function isVault(address _vault) public view returns (bool){
      return vaultCheck[_vault];
    }

    function isStrategy(address _strategy) public view returns (bool){
      return strategyCheck[_strategy];
    }

    function isRewardPool(address _rewardPool) public view returns (bool){
      return rewardPoolCheck[_rewardPool];
    }

    function isCoreContract(address _coreContract) public view returns (bool){
      return coreContractCheck[_coreContract];
    }

    function getVaultStrategy(address _vault) public view returns (address) {
      IVault vault = IVault(_vault);
      address strategy = vault.strategy();
      return strategy;
    }

    function getVaultRewardPool(address _vault) public view validVault(_vault) returns (address) {
      address rewardPool = vaultRewardPool[_vault];
      return rewardPool;
    }

    function getVaultUnderlying(address _vault) public view validVault(_vault) returns (address) {
      IVault vault = IVault(_vault);
      address underlying = vault.underlying();
      return underlying;
    }

    function getVaultSharePrice(address _vault) public view validVault(_vault) returns (uint256) {
      IVault vault = IVault(_vault);
      uint256 sharePrice = vault.getPricePerFullShare();
      return sharePrice;
    }

    /* function getVaultUnderlyingBalanceInVault(address _vault) public view validVault(_vault) returns (uint256) {
      IVault vault = IVault(_vault);
      uint256 underlyingBalanceInVault = vault.underlyingBalanceInVault();
      return underlyingBalanceInVault;
    }

    function getVaultUnderlyingBalanceWithInvestment(address _vault) public view validVault(_vault) returns (uint256) {
      IVault vault = IVault(_vault);
      uint256 underlyingBalanceWithInvestment = vault.underlyingBalanceWithInvestment();
      return underlyingBalanceWithInvestment;
    }

    function getVaultTotalSupply(address _vault) public view validVault(_vault) returns (uint256) {
      IERC20 vault = IERC20(_vault);
      uint256 totalSupply = vault.totalSupply();
      return totalSupply;
    }

    function getVaultFractionToInvest(address _vault) public view validVault(_vault) returns (uint256[2] memory) {
      IVault vault = IVault(_vault);
      uint256 vaultFractionToInvestNumerator = vault.vaultFractionToInvestNumerator();
      uint256 vaultFractionToInvestDenominator = vault.vaultFractionToInvestDenominator();
      return [vaultFractionToInvestNumerator, vaultFractionToInvestDenominator];
    } */

    function getVaultInfo(address _vault) public view validVault(_vault) returns (address,address,address,address,uint256) {
      address strategy = getVaultStrategy(_vault);
      address rewardPool = getVaultRewardPool(_vault);
      address underlying = getVaultUnderlying(_vault);
      uint256 sharePrice = getVaultSharePrice(_vault);
      return (_vault, strategy, rewardPool, underlying, sharePrice);
    }

    /* function getStrategyInvestedUnderlyingBalance(address _strategy) public view validStrategy(_strategy) returns (uint256) {
      IStrategy strategy = IStrategy(_strategy);
      uint256 investedUnderlyingBalance = strategy.investedUnderlyingBalance();
      return investedUnderlyingBalance;
    } */

    function getStrategyUnderlying(address _strategy) public view validStrategy(_strategy) returns (address) {
      IStrategy strategy = IStrategy(_strategy);
      address underlying = strategy.underlying();
      return underlying;
    }

    function getStrategyVault(address _strategy) public view validStrategy(_strategy) returns (address) {
      IStrategy strategy = IStrategy(_strategy);
      address vault = strategy.vault();
      return vault;
    }

    function getStrategyInfo(address _strategy) public view validStrategy(_strategy) returns (address,address,address) {
      address vault = getStrategyVault(_strategy);
      address underlying = getStrategyUnderlying(_strategy);
      return(_strategy, vault, underlying);
    }

    function getRewardPoolRewardPerTokenStored(address _rewardPool) public view validRewardPool(_rewardPool) returns (uint256) {
      IRewardPool rewardPool = IRewardPool(_rewardPool);
      uint256 rewardPerTokenStored = rewardPool.rewardPerTokenStored();
      return rewardPerTokenStored;
    }

    function getRewardPoolRewardRate(address _rewardPool) public view validRewardPool(_rewardPool) returns (uint256) {
      IRewardPool rewardPool = IRewardPool(_rewardPool);
      uint256 rewardRate = rewardPool.rewardRate();
      return rewardRate;
    }

    function getRewardPoolVault(address _rewardPool) public view validRewardPool(_rewardPool) returns (address) {
      address vault = rewardPoolVault[_rewardPool];
      return vault;
    }

    function getRewardPoolInfo(address _rewardPool) public view validRewardPool(_rewardPool) returns (address,address,uint256,uint256) {
      address vault = getRewardPoolVault(_rewardPool);
      uint256 rewardRate = getRewardPoolRewardRate(_rewardPool);
      uint256 rewardPerTokenStored = getRewardPoolRewardPerTokenStored(_rewardPool);
      return (_rewardPool,vault,rewardRate,rewardPerTokenStored);
    }

    // transfers token in the controller contract to the governance
    function salvage(address _token, uint256 _amount) external onlyGovernance {
        IERC20(_token).safeTransfer(governance(), _amount);
    }
}
