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

    
    // Names for all contracts, also used for valid check (check for non-empty string)
    mapping (address => string) private vaultName;
    mapping (address => string) private rewardPoolName;
    mapping (address => string) private strategyName;
    mapping (address => string) private coreContractName;

    // Contract relationship mappings
    mapping (address => address) private vaultRewardPoolLink;
    mapping (address => address) private rewardPoolVaultLink;
    mapping (address => address) private vaultStrategyLink;
    mapping (address => address) private strategyVaultLink;

    // MetaData mappings for all tracked contracts
    mapping (address => uint256) private createdOnBlock;
    mapping (address => uint256) private startOnBlock;

    // Arrays for iteration of tracked contracts
    address[] private vaultList;
    address[] private strategyList;
    address[] private rewardPoolList;
    address[] private coreContractList;

    modifier validVault(address _vault){
        require(isValidVault(_vault), "vault does not exist");
        _;
    }
    modifier validStrategy(address _strategy){
        require(isValidStrategy(_strategy), "strategy does not exist");
        _;
    }
    modifier validRewardPool(address _rewardPool){
        require(isValidRewardPool(_rewardPool), "reward pool does not exist");
        _;
    }
    modifier validCoreContract(address _coreContract){
        require(isValidCoreContract(_coreContract), "core contract does not exist");
        _;
    }

    event VaultAdded(address vault, address strategy, address rewardPool);
    event RewardPoolChanged(address vault, address newRewardPool, address oldRewardPool);
    event StrategyChanged(address vault, address newStrategy, address oldStrategy);

    // TODO: Decide if we want this contract to be upgradeable, if so get rid of ctor
    constructor(address _storage)
    Governable(_storage) public {}

    //I did not find a consistent on-chain link between Vaults and Reward Pools, so it seems they would have to be added in pairs to keep track of the linkage.
    function addVaultAndRewardPool(address _vault, string _vaultName, address _rewardPool, string _rewardPoolName, string _strategyName) external onlyGovernance {
        require(_vault != address(0), "new vault shouldn't be empty");
        require(!vaultCheck[_vault], "vault already exists");
        require(_rewardPool != address(0), "new reward pool shouldn't be empty");
        require(_vaultName != "" && _rewardPoolName != "", "vault and rewardPool names must not be empty");
        require(IVault(_vault).strategy() != address(0), "vault strategy must be set");

        IVault vault = IVault(_vault);
        address strategyAddress = vault.strategy();

        vaultName[_vault] = _vaultName;
        vaultList.push(_vault);
        vaultRewardPoolLink[_vault] = _rewardPool;
        vaultStrategyLink[_vault] = strategyAddress;

        rewardPoolName[_rewardPool] = rewardPoolName;
        rewardPoolList.push(_rewardPool);
        rewardPoolVaultLink[_rewardPool] = _vault;

        strategyName[strategyAddress] = _strategyName;
        strategyList.push(strategyAddress);
        strategyVaultLink[strategyAddress] = _vault;

        emit VaultAdded(_vault, strategyAddress, _rewardPool);
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
      return vaultName[_vault] != "";
    }

    function isStrategy(address _strategy) public view returns (bool){
      return strategyName[_strategy] != "";
    }

    function isRewardPool(address _rewardPool) public view returns (bool){
      return rewardPoolName[_rewardPool] != "";
    }

    function isCoreContract(address _coreContract) public view returns (bool){
      return coreContractName[_coreContract] != "";
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

    function getRewardPoolVault(address _rewardPool) public view validRewardPool(_rewardPool) returns (address) {
      address vault = rewardPoolVault[_rewardPool];
      return vault;
    }

    function getVaultUnderlying(address _vault) public view validVault(_vault) returns (address) {
      IVault vault = IVault(_vault);
      address underlying = vault.underlying();
      return underlying;
    }

    function getVaultInfo(address _vault) public view validVault(_vault) returns (address,address,address,address,uint256) {
      address strategy = getVaultStrategy(_vault);
      address rewardPool = getVaultRewardPool(_vault);
      address underlying = getVaultUnderlying(_vault);
      uint256 sharePrice = getVaultSharePrice(_vault);
      return (_vault, strategy, rewardPool, underlying, sharePrice);
    }

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
}
