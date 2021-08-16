// SPDX-License-Identifier: MIT
pragma solidity 0.6.12;

import "./ArrayLib.sol";

contract ArrayLibTest  {

    using ArrayLib for address[];
    using ArrayLib for uint256[];

    address[] public addresses;
    uint256[] public numbers;

    function listAddresses() public view returns (address[] memory) {
        return addresses;
    }

    function addAddress(address _address) public {
        addresses.addUnique(_address);
    }

    function removeAddress(address _address) public {
        addresses.removeFirst(_address);
    }

    function addAddressArray(address[] memory _addresses) public {
        addresses.addArrayUnique(_addresses);
    }

    function removeAddressArray(address[] memory _addresses) public {
        addresses.removeArrayFirst(_addresses);
    }

    // numbers

    function listNumbers() public view returns (uint[] memory) {
        return numbers;
    }

    function addNumber(uint _number) public {
        numbers.addUnique(_number);
    }

    function removeNumber(uint _number) public {
        numbers.removeFirst(_number);
    }

    function addNumberArray(uint[] memory _numbers) public {
        numbers.addArrayUnique(_numbers);
    }

    function removeNumberArray(uint[] memory _numbers) public {
        numbers.removeArrayFirst(_numbers);
    }

}
