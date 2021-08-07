// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "@openzeppelin/contracts/utils/Address.sol";
import "@openzeppelin/contracts/proxy/Initializable.sol";

import "./Governable.sol";

contract ContractRegistry is Governable, Initializable {
    using Address for address;

    address[] public addresses;

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

    function inArray(address _address) public view returns (bool) {
        uint len = addresses.length;
        for (uint i=0; i<len; i++) {
            if (addresses[i]==_address) return true;
        }
        return false;
    }

    function add(address _address) public onlyGovernance {
        require(_address!=address(0));
        require(!inArray(_address), 'Already in list');

        addresses.push(_address);
        emit AddressAdded(_address);
    }

    function remove(address _address) public onlyGovernance {
        require(inArray(_address), 'Not in list');
        uint last = addresses.length-1;
        for (uint i=0; i<=last; i++) {
            if (addresses[i]==_address) {
                addresses[i] = addresses[last]; // copy last address in array to removed element place
                addresses.pop();
                emit AddressRemoved(_address);
                return;
            }
        }
    }

    function addArray(address[] memory _addresses) public onlyGovernance {
        uint len = _addresses.length;
        for (uint i=0; i<len; i++) {
            add(_addresses[i]);
        }
    }

    function removeArray(address[] memory _addresses) public onlyGovernance {
        uint len = _addresses.length;
        for (uint i=0; i<len; i++) {
            remove(_addresses[i]);
        }
    }

}
