// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";

import "./Governable.sol";
import "./AddressArray.sol";

contract ContractRegistry is Governable, Initializable {
    using Address for address;

    AddressArray private addresses;

    constructor()
    public Governable(msg.sender) {
        initialize();
    }

    function initialize()
    public onlyGovernance initializer {
        Governable.setGovernance(msg.sender);
    }

    function list() external view returns (address[] memory) {
        return addresses.list();
    }

    function add(address _address) external onlyGovernance {
        addresses.add(_address);
    }

    function remove(address _address) external onlyGovernance {
        addresses.remove(_address);
    }

    function addMany(address[] memory _addresses) external onlyGovernance {
        addresses.addMany(_addresses);
    }

    function removeMany(address[] memory _addresses) external onlyGovernance {
        addresses.removeMany(_addresses);
    }

}
