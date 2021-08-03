// SPDX-License-Identifier: MIT
pragma solidity >=0.6.0 <0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";

contract AddressArray {
    using Address for address;

    address[] public addresses;

    event AddressAdded(address _address);
    event AddressRemoved(address _address);

    function list() public view returns (address[] memory) {
        return addresses;
    }

    function inArray(address _address) public view returns (bool) {
        for (uint i=addresses.length-1; i>=0; i--)
            if (addresses[i]==_address) return true;
        return false;
    }

    function add(address _address) public {
        require(_address!=address(0));
        if (!inArray(_address)) {
            addresses.push(_address);
            AddressAdded(_address);
        }
    }

    function remove(address _address) public{
        uint last = addresses.length-1;
        for (uint i=last; i>=0; i--)
            if (addresses[i]==_address) {
                addresses[i] = addresses[last]; // copy last address in array to removed element place
                addresses.pop();
                AddressRemoved(_address);
            }
    }

    function addMany(address[] memory _addresses) public {
        for (uint i=_addresses.length-1; i>=0; i--)
            add(_addresses[i]);
    }

    function removeMany(address[] memory _addresses) public {
        for (uint i=_addresses.length-1; i>=0; i--)
            remove(_addresses[i]);
    }
}
