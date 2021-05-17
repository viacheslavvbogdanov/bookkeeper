from brownie import *
import time


def e3p():
    addr = "0x160CAed03795365F3A589f10C379FfA7d75d4E76"
    coins = web3.toHex((web3.keccak(text="coins(uint256)")))[:10]
    exchange = web3.toHex(
        (web3.keccak(text="get_dy_underlying(int128,int128,uint256)"))
    )[:10]

    return {"addr": addr, "coins": coins, "exchange": exchange}


def belt4p():
    addr = "0xAEA4f7dcd172997947809CE6F12018a6D5c1E8b6"
    coins = web3.toHex((web3.keccak(text="underlying_coins(int128)")))[:10]
    exchange = web3.toHex(
        (web3.keccak(text="get_dy_underlying(int128,int128,uint256)"))
    )[:10]

    return {"addr": addr, "coins": coins, "exchange": exchange}


def nerve():
    addr = "0x1B3771a66ee31180906972580adE9b81AFc5fCDc"
    coins = web3.toHex((web3.keccak(text="getToken(uint8)")))[:10]
    exchange = web3.toHex(
        (web3.keccak(text="calculateSwap(uint8,uint8,uint256)"))
    )[:10]

    return {"addr": addr, "coins": coins, "exchange": exchange}


def acs4p():
    addr = "0xb3F0C9ea1F05e312093Fdb031E789A756659B0AC"
    coins = web3.toHex((web3.keccak(text="coins(uint256)")))[:10]
    exchange = web3.toHex(
        (web3.keccak(text="get_dy(int128,int128,uint256)"))
    )[:10]

    return {"addr": addr, "coins": coins, "exchange": exchange}


def dopple():
    addr = "0x5162f992EDF7101637446ecCcD5943A9dcC63A8A"
    coins = web3.toHex((web3.keccak(text="getToken(uint8)")))[:10]
    exchange = web3.toHex(
        (web3.keccak(text="calculateSwap(uint8,uint8,uint256)"))
    )[:10]

    return {"addr": addr, "coins": coins, "exchange": exchange}


def main():
    me = accounts.load('boobies')
    accounts.default = me
    s = Storage.deploy(publish_source=True)
    o = OracleBSC.deploy(s.address, publish_source=True)
    time.sleep(60)
    for i in [e3p(), belt4p(), acs4p(), nerve(), dopple()]:
        o.addStableSwapProvider(i["addr"], i["coins"], i["exchange"])
    print(o.address)
