const { expect } = require("chai")
const { ethers } = require("hardhat")

const DAI = "0x6B175474E89094C44Da98b954EedeAC495271d0F"
// const USDC = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"
//const WTH = "0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2"
const WTH = "0xA0b86991c6218b36c1d19D4a2e9Eb0cE3606eB48"

const DAI_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"
const WTH_WHALE = "0x2FAF487A4414Fe77e2327F0bf4AE2a264a776AD2"

describe("LiquidityExamples", () => {
  let liquidityExamples
  let accounts
  let dai
  let wth

  before(async () => {
    accounts = await ethers.getSigners(1)

    const LiquidityExamples = await ethers.getContractFactory(
      "LiquidityExamples"
    )
    liquidityExamples = await LiquidityExamples.deploy()
    await liquidityExamples.deployed()

    dai = await ethers.getContractAt("IERC20", DAI)
    wth = await ethers.getContractAt("IERC20", WTH)

    // Unlock DAI and USDC whales
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [DAI_WHALE],
    })
    await network.provider.request({
      method: "hardhat_impersonateAccount",
      params: [WTH_WHALE],
    })

    const daiWhale = await ethers.getSigner(DAI_WHALE)
    const usdcWhale = await ethers.getSigner(WTH_WHALE)

    // Send DAI and USDC to accounts[0]
    const daiAmount = 1000n * 10n ** 18n
    const ethAmount = 1000n * 10n ** 6n

    expect(await dai.balanceOf(daiWhale.address)).to.gte(daiAmount)
    expect(await wth.balanceOf(usdcWhale.address)).to.gte(ethAmount)

    await dai.connect(daiWhale).transfer(accounts[0].address, daiAmount)
    await wth.connect(usdcWhale).transfer(accounts[0].address, ethAmount)
    console.log(ethAmount);
  })

  it("mintNewPosition", async () => {
    const daiAmount = 100n * 10n ** 18n
    const ethAmount = 100n * 10n ** 6n

    await dai
      .connect(accounts[0])
      .transfer(liquidityExamples.address, daiAmount)
    await wth
      .connect(accounts[0])
      .transfer(liquidityExamples.address, ethAmount)

    await liquidityExamples.mintNewPosition()

    console.log(
      "DAI balance after add liquidity",
      await dai.balanceOf(accounts[0].address)
    )
    console.log(
      "ETH balance after add liquidity",
      await wth.balanceOf(accounts[0].address)
    )
  })

  it.skip("increaseLiquidityCurrentRange", async () => {
    const daiAmount = 20n * 10n ** 18n
    const ethAmount = 20n * 10n ** 6n

    await dai.connect(accounts[0]).approve(liquidityExamples.address, daiAmount)
    await wth
      .connect(accounts[0])
      .approve(liquidityExamples.address, ethAmount)

    await liquidityExamples.increaseLiquidityCurrentRange(daiAmount, ethAmount)
  })

  it("decreaseLiquidity", async () => {
    const tokenId = await liquidityExamples.tokenId()
    const liquidity = await liquidityExamples.getLiquidity(tokenId)

    await liquidityExamples.decreaseLiquidity(liquidity)

    console.log("--- decrease liquidity ---")
    console.log(`liquidity ${liquidity}`)
    console.log(`dai ${await dai.balanceOf(liquidityExamples.address)}`)
    console.log(`ETH ${await wth.balanceOf(liquidityExamples.address)}`)
  })

  it("collectAllFees", async () => {
    await liquidityExamples.collectAllFees()

    console.log("--- collect fees ---")
    console.log(`dai ${await dai.balanceOf(liquidityExamples.address)}`)
    console.log(`ETH ${await wth.balanceOf(liquidityExamples.address)}`)
  })
})
