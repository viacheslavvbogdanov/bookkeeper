// SPDX-License-Identifier: MIT
pragma solidity >=0.6.2 <0.8.0;

import "@openzeppelin/contracts/utils/Address.sol";

library ArrayLib {
    using Address for address;

    string constant ZERO_ADDRESS = "Zero address";
    string constant NOT_IN_ARRAY = "Not in array";
    string constant ALREADY_IN_ARRAY = "Already in array";

    function inArray(address[] storage array, address _item) public view returns (bool) {
        uint len = array.length;
        for (uint i=0; i<len; i++) {
            if (array[i]==_item) return true;
        }
        return false;
    }

    function addUnique(address[] storage array, address _item) public {
        require(_item!=address(0), ZERO_ADDRESS);
        require(!inArray(array, _item), ALREADY_IN_ARRAY);

        array.push(_item);
    }

    function add(address[] storage array, address _item) public {
        require(_item!=address(0), ZERO_ADDRESS);
        array.push(_item);
    }

    function remove(address[] storage array, address _item, bool removeFirstOnly) public {
        require(inArray(array, _item), NOT_IN_ARRAY);
        uint last = array.length-1;
        for (uint i=0; i<=last; i++) {
            if (array[i]==_item) {
                array[i] = array[last]; // copy last address in array to removed element place
                array.pop();
                if (removeFirstOnly) return;
            }
        }
    }

    function removeAll(address[] storage array, address _item) public {
        remove(array, _item, false);
    }

    function removeFirst(address[] storage array, address _item) public {
        remove(array, _item, true);
    }

    function addArray(address[] storage array, address[] memory _items) public {
        uint len = _items.length;
        for (uint i=0; i<len; i++) {
            add(array, _items[i]);
        }
    }

    function addArrayUnique(address[] storage array, address[] memory _items) public {
        uint len = _items.length;
        for (uint i=0; i<len; i++) {
            addUnique(array, _items[i]);
        }
    }

    function removeArray(address[] storage array, address[] memory _items, bool removeFirstOnly) public {
        uint len = _items.length;
        for (uint i=0; i<len; i++) {
            remove(array, _items[i], removeFirstOnly);
        }
    }

    function removeArrayAll(address[] storage array, address[] memory _items) public {
        removeArray(array, _items, false);
    }

    function removeArrayFirst(address[] storage array, address[] memory _items) public {
        removeArray(array, _items, true);
    }

}
