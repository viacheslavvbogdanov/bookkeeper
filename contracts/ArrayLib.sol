// SPDX-License-Identifier: MIT
pragma solidity >=0.6.12 <0.8.0;

library ArrayLib {

    string constant NOT_IN_ARRAY     = "Not in array";
    string constant ALREADY_IN_ARRAY = "Already in array";

    // address array

    function inArray(address[] storage array, address _item)
    internal view returns (bool) {
        uint len = array.length;
        for (uint i=0; i<len; i++) {
            if (array[i]==_item) return true;
        }
        return false;
    }

    function addUnique(address[] storage array, address _item)
    internal {
        require(!inArray(array, _item), ALREADY_IN_ARRAY);
        array.push(_item);
    }

    function removeFirst(address[] storage array, address _item)
    internal {
        require(inArray(array, _item), NOT_IN_ARRAY);
        uint last = array.length-1;
        for (uint i=0; i<=last; i++) {
            if (array[i]==_item) {
                array[i] = array[last]; // copy last address in array to removed element place
                array.pop();
                return;
            }
        }
    }

    function addArrayUnique(address[] storage array, address[] memory _items)
    internal {
        uint len = _items.length;
        for (uint i=0; i<len; i++) {
            addUnique(array, _items[i]);
        }
    }

    function removeArrayFirst(address[] storage array, address[] memory _items)
    internal {
        uint len = _items.length;
        for (uint i=0; i<len; i++) {
            removeFirst(array, _items[i]);
        }
    }

    // uint256

    function inArray(uint256[] storage array, uint256 _item)
    internal view returns (bool) {
        uint len = array.length;
        for (uint i=0; i<len; i++) {
            if (array[i]==_item) return true;
        }
        return false;
    }

    function addUnique(uint256[] storage array, uint256 _item)
    internal {
        require(!inArray(array, _item), ALREADY_IN_ARRAY);
        array.push(_item);
    }

    function removeFirst(uint256[] storage array, uint256 _item)
    internal {
        require(inArray(array, _item), NOT_IN_ARRAY);
        uint last = array.length-1;
        for (uint i=0; i<=last; i++) {
            if (array[i]==_item) {
                array[i] = array[last]; // copy last uint256 in array to removed element place
                array.pop();
                return;
            }
        }
    }

    function addArrayUnique(uint256[] storage array, uint256[] memory _items)
    internal {
        uint len = _items.length;
        for (uint i=0; i<len; i++) {
            addUnique(array, _items[i]);
        }
    }

    function removeArrayFirst(uint256[] storage array, uint256[] memory _items)
    internal {
        uint len = _items.length;
        for (uint i=0; i<len; i++) {
            removeFirst(array, _items[i]);
        }
    }

}
