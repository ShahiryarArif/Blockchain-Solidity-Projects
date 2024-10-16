const { expect } = require('chai');
const { ethers } = require('hardhat');

const tokens = (n) => {
    return ethers.utils.parseUnits(n.toString(), 'ether')
}

describe('Escrow', () => {
    let buyer, seller, inspector, lender;
    let realEstate, escrow;

    beforeEach(async () => {
        // Setup accounts
        [buyer, seller, inspector, lender] = await ethers.getSigners();

        // Deploy the RealEstate contract
        const RealEstate = await ethers.getContractFactory('RealEstate');
        realEstate = await RealEstate.deploy();

        // Mint
        let transaction = await realEstate.connect(seller).mintNFT('https://blush-broad-shrew-862.mypinata.cloud/ipfs/QmWGWaqYKFBfawy4bLCvKzKzd8yyujZZRAJWKBBddk5F9u');
        await transaction.wait();

        // Deploy the Escrow contract
        const Escrow = await ethers.getContractFactory('Escrow');
        escrow = await Escrow.deploy(lender.address, inspector.address, realEstate.address, seller.address);
    })

    describe('deployment', () => {
        it('Returns NFT address', async () => {
            const result = await escrow.nftAddress();
            expect(result).to.equal(realEstate.address);
        })

        it('Returns seller address', async () => {
            const result = await escrow.seller();
            expect(result).to.equal(seller.address);
        })

        it('Returns lender address', async () => {
            const result = await escrow.lender();
            expect(result).to.equal(lender.address);
        })

        it('Returns inspector address', async () => {
            const result = await escrow.inspector();
            expect(result).to.equal(inspector.address);
        })
    })
})