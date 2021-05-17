import brownie
from brownie import web3
import pytest
from rich.console import Console

console = Console()


@pytest.fixture(scope="module")
def e3p():
    addr = "0x160CAed03795365F3A589f10C379FfA7d75d4E76"
    coins = web3.toHex((web3.keccak(text="coins(uint256)")))[:10]
    exchange = web3.toHex(
        (web3.keccak(text="get_dy_underlying(int128,int128,uint256)"))
    )[:10]

    yield {"addr": addr, "coins": coins, "exchange": exchange}


@pytest.fixture(scope="module")
def belt4p():
    addr = "0xAEA4f7dcd172997947809CE6F12018a6D5c1E8b6"
    coins = web3.toHex((web3.keccak(text="underlying_coins(int128)")))[:10]
    exchange = web3.toHex(
        (web3.keccak(text="get_dy_underlying(int128,int128,uint256)"))
    )[:10]

    yield {"addr": addr, "coins": coins, "exchange": exchange}


@pytest.fixture(scope="module")
def nerve():
    addr = "0x1B3771a66ee31180906972580adE9b81AFc5fCDc"
    coins = web3.toHex((web3.keccak(text="getToken(uint8)")))[:10]
    exchange = web3.toHex(
        (web3.keccak(text="calculateSwap(uint8,uint8,uint256)"))
    )[:10]

    yield {"addr": addr, "coins": coins, "exchange": exchange}


@pytest.fixture(scope='module')
def acs4p():
    addr = "0xb3F0C9ea1F05e312093Fdb031E789A756659B0AC"
    coins = web3.toHex((web3.keccak(text="coins(uint256)")))[:10]
    exchange = web3.toHex(
        (web3.keccak(text="get_dy(int128,int128,uint256)"))
    )[:10]

    yield {"addr": addr, "coins": coins, "exchange": exchange}


@pytest.fixture(scope="module")
def dopple():
    addr = "0x5162f992EDF7101637446ecCcD5943A9dcC63A8A"
    coins = web3.toHex((web3.keccak(text="getToken(uint8)")))[:10]
    exchange = web3.toHex(
        (web3.keccak(text="calculateSwap(uint8,uint8,uint256)"))
    )[:10]

    yield {"addr": addr, "coins": coins, "exchange": exchange}


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


@pytest.fixture()
def dai():
    yield '0x1AF3F329e8BE154074D8769D1FFa4eE058B1DBc3'


@pytest.fixture()
def coins_3ps(e3p, interface):
    c = interface.e3p(e3p['addr'])
    yield [c.coins(0), c.coins(1), c.coins(2)]


@pytest.fixture()
def coins_belt(belt4p, interface):
    c = interface.belt(belt4p['addr'])
    yield [c.underlying_coins(0), c.underlying_coins(1), c.underlying_coins(2), c.underlying_coins(3)]


@pytest.fixture()
def coins_acs4p(acs4p, interface):
    c = interface.e3p(acs4p['addr'])
    yield [c.coins(0), c.coins(1), c.coins(2), c.coins(3)]


@pytest.fixture()
def coins_nerve(nerve, interface):
    c = interface.nerve(nerve['addr'])
    yield [c.getToken(0), c.getToken(1), c.getToken(2)]


@pytest.fixture()
def coins_dopple(dopple, interface):
    c = interface.nerve(dopple['addr'])
    yield [c.getToken(0), c.getToken(1), c.getToken(2), c.getToken(3)]


@pytest.fixture(scope="function")
def o(e3p, belt4p, acs4p, nerve, dopple, accounts, OracleBSC, storage):
    accounts.default = accounts[0]
    o = OracleBSC.deploy(storage.address)
    for i in [e3p, belt4p, acs4p, nerve, dopple]:
        o.addStableSwapProvider(i["addr"], i["coins"], i["exchange"])
    yield o


def test_add_to_registry(o, e3p, belt4p, acs4p, dopple, nerve):
    for i in [e3p, belt4p, acs4p, dopple, nerve]:
        assert o.registry(i["addr"])["addr"] == i["addr"]
    assert len(o.getStableSwapProviders()) == 5


def test_get_coins(o, e3p):
    a = o.getCoins(e3p['addr'])
    print(a)


def test_get_prices(o, coins_3ps, coins_belt, coins_acs4p, coins_nerve, coins_dopple, dopple, nerve, acs4p, e3p, belt4p,
                    interface):
    for coins, c, name in [[coins_3ps, interface.e3p(e3p['addr']), 'Ellipsis3Pool'],
                           [coins_belt, interface.belt(belt4p['addr']), 'Belt4Pool'],
                           [coins_acs4p, interface.e3p(acs4p['addr']), 'ACS4Pool'],
                           [coins_nerve, interface.nerve(nerve['addr']), 'Nerve'],
                           [coins_dopple, interface.nerve(dopple['addr']), 'Dopple']]:

        console.print(f'\n')
        console.rule(f'{name}')
        for f in coins:
            coins_ = coins.copy()
            coins_.remove(f)
            for s in coins_:
                _f = interface.BEP20(f)
                _s = interface.BEP20(s)
                key0 = coins.index(f)
                key1 = coins.index(s)
                _fs = _f.symbol()
                _ss = _s.symbol()

                amount = 10 ** _f.decimals()

                if name == 'Ellipsis3Pool' or name == 'Belt4Pool':
                    check = c.get_dy_underlying(key0, key1, amount)
                elif name == 'ACS4Pool':
                    check = c.get_dy(key0, key1, amount)
                elif name == 'Nerve' or name == 'Dopple':
                    check = c.calculateSwap(key0, key1, amount)

                result = o.getPriceStables(c.address, f, s)
                console.print(
                    f'Getting rates for {_fs} / {_ss}... {check / 1e18:.8f}(should) == {result[1] / 1e18:.8f}(is)')
                assert check == result[1]
                assert result[0]


def test_get_prices_not_all_parameters(o, usdc, busd, e3p):
    price = o.getPriceStables(e3p['addr'], usdc, busd)[1]
    assert o.getPriceStables(e3p['addr'], usdc)[1] == price
    assert o.getPriceStables(usdc)[1] == price


def test_revert_wrong_coin(o, dai):
    with brownie.reverts("couldn't find tokens in this exchange"):
        o.getPriceStables(dai)


def test_change_default_provider(o, belt4p):
    assert o.changeDefaultProvider(belt4p['addr'])
    assert o.defaultProvider() == belt4p['addr']


def test_change_default_second_token(o, usdc):
    assert o.changeDefaultSecondToken(usdc)
    assert o.defaultSecondToken() == usdc
