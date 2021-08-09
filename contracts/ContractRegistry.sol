// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";

import "./Governable.sol";
import "./ArrayLib.sol";

contract ContractRegistry is Governable, Initializable {
    using Address for address;

    address[] public addresses;
    using ArrayLib for address[];

    event AddressAdded(address _address);
    event AddressRemoved(address _address);

    constructor()
    public Governable(msg.sender) {
        initialize();
    }

    function initialize()
    public onlyGovernance initializer {
        Governable.setGovernance(msg.sender);
    }

    function list() public view returns (address[] memory) {
        return addresses;
    }

    function add(address _address) public onlyGovernance {
        addresses.addUnique(_address);
    }

    function remove(address _address) public onlyGovernance {
        addresses.removeFirst(_address);
    }

    function addArray(address[] memory _addresses) public onlyGovernance {
        addresses.addArray(_addresses);
    }

    function removeArray(address[] memory _addresses) public onlyGovernance {
        addresses.removeArrayFirst(_addresses);
    }

}
