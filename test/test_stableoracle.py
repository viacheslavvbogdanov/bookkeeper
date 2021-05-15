import brownie.convert
import pytest
from brownie import *


@pytest.fixture(scope="module")
def e3p():
    name = "e3p"
    addr = "0x160CAed03795365F3A589f10C379FfA7d75d4E76"
    coins = web3.toHex((web3.keccak(text="coins(uint256)")))[:10]
    exchange = web3.toHex(
        (web3.keccak(text="get_dy_underlying(int128,int128,uint256)"))
    )[:10]

    yield {"name": name, "addr": addr, "coins": coins, "exchange": exchange}

@pytest.fixture()
def storage(Storage, accounts):
    accounts.default = accounts[0]
    yield Storage.deploy()



@pytest.fixture()
def busd():
    yield "0xe9e7CEA3DedcA5984780Bafc599bD69ADd087D56"


@pytest.fixture()
def usdc():
    yield "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d"


@pytest.fixture(scope="function")
def o(e3p, accounts, OracleBSC, storage):
    accounts.default = accounts[0]
    o = OracleBSC.deploy(storage.address)
    o.addStableSwapProvider(e3p["name"], e3p["addr"], e3p["coins"], e3p["exchange"])
    yield o


def test_correct_add(o, e3p):
    assert o.registry(e3p["name"])["name"] == e3p["name"]


def test_get_rate(o, e3p, busd, usdc):
    assert o.getRate(e3p["name"], busd, usdc)[0]
