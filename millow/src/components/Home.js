import { ethers } from 'ethers';
import { useEffect, useState } from 'react';

import close from '../assets/close.svg';

const Home = ({ home, provider, account, escrow, togglePop }) => {
    const [hasBought, setHasBought] = useState(false);
    const [hasLended, setHasLended] = useState(false);
    const [hasInspected, setHasInspected] = useState(false);
    const [hasSold, setHasSold] = useState(false);

    const [buyer, setBuyer] = useState('');
    const [lender, setLender] = useState('');
    const [inspector, setInspector] = useState('');
    const [seller, setSeller] = useState('');
    const [owner, setOwner] = useState('');

    const fetchDetails = async () => {
        const buyer = await escrow.buyers(home.id);
        setBuyer(buyer);
        const hasBought = await escrow.approval(home.id, buyer);
        setHasBought(hasBought);
        
        const lender = await escrow.lenders;
        setLender(lender);
        const hasLended = await escrow.approval(home.id, lender);
        setHasLended(hasLended);

        const inspector = await escrow.inspectors;
        setInspector(inspector);
        const hasInspected = await escrow.inspectionPassed(home.id);
        setHasInspected(hasInspected);

        const seller = await escrow.sellers;
        setSeller(seller);
        const hasSold = await escrow.approval(home.id, seller);
        setHasSold(hasSold);

    }

    const fetchOwner = async () => {
        if(await escrow.isListed(home.id)) return;

        const owner = await escrow.buyer(home.id);
        setOwner(owner);
    }

    const inspectHandler = async () => {
        const signer = await provider.getSigner();

        let transaction = await escrow.connect(signer).updateInspectionStatus(home.id, true);
        await transaction.wait();

        setHasInspected(true);
    }

    const lendHandler = async () => {
        const signer = await provider.getSigner();

        //Lender approves
        let transaction = await escrow.connect(signer).approveSale(home.id);
        await transaction.wait();

        //Lender sends funds to contract
        const leadAmount = (await escrow.purchasePrice(home.id) - await escrow.escrowAmount(home.id));
        await signer.sendTransaction({ to: escrow.address, value: leadAmount.toString(), gasLimit: 60000 });;
        
        setHasLended(true);
    }

    const sellHandler = async () => {
        const signer = await provider.getSigner();

        //Seller approves
        let transaction = await escrow.connect(signer).approveSale(home.id);
        await transaction.wait();

        //Seller finalize...
        transaction = await escrow.connect(signer).finalizeSale(home.id);
        await transaction.wait();
        
        setHasSold(true);
    }

    const buyHandler = async () => {
        const escrowAmount = await escrow.escrowAmount(home.id);
        const signer = await provider.getSigner();

        //Buyer deposit earnest
        let transaction = await escrow.connect(signer).depositEarnest(home.id, { value: escrowAmount });
        await transaction.wait();

        //Buy approves
        transaction = await escrow.connect(signer).approveSale(home.id);
        await transaction.wait();

        setHasBought(true);
    }

    useEffect(() => {
        fetchDetails();
        fetchOwner();
    }, [hasSold]);

    return (
        <div className="home">
            <div className='home__details'>
                <div className='home__image'>
                    <img src={home.image} alt='Home' />
                </div>
                <div className='home__overview'>
                    <h1>{home.name}</h1>
                    <p>
                        <strong>{home.attributes[2].value}</strong> bds  |
                        <strong>{home.attributes[3].value}</strong> ba   |
                        <strong>{home.attributes[4].value}</strong> sqft |
                    </p>
                    <p>{home.address}</p>
                    <h2>{home.attributes[0].value} ETH</h2>
                    
                    {owner ? (
                        <div className='home__owned'>
                            Owned by {owner.slice(0,6)}...{owner.slice(-4)}
                        </div>
                    ): (
                        <div>
                        {(account === inspector) ? (
                            <button className='home__buy' onClick={inspectHandler} disabled={hasInspected}>
                                Approve Inspection
                            </button>
                        ): (account === lender) ? (
                            <button className='home__buy' onClick={lendHandler} disabled={hasLended}>
                                Approve & Lend
                            </button>
                        ): (account === seller) ? (
                            <button className='home__buy' onClick={sellHandler} disabled={hasSold}>
                                Approve & Sell
                            </button>
                        ): (
                            <button className='home__buy' onClick={buyHandler} disabled={hasBought}>
                                Buy
                            </button>
                        )}
                            <button className='home__contact'>
                                Contact Agent
                            </button>
                        </div>
                    )}

                    <hr/>

                    <h2>Overview</h2>

                    <p>
                        {home.description}
                    </p>

                    <hr/>

                    <h2>Facts and Features</h2>

                    <ul>
                        {
                            home.attributes.map((attributes, index) => (
                                <li key={index}>
                                    <strong>{attributes.trait_type}</strong> : {attributes.value}
                                </li>
                            ))
                        }
                    </ul>
                </div>
                <button 
                    className='home__close'
                    onClick={togglePop}
                >
                    <img src={close} alt='Close' />
                </button>
            </div>
        </div>
    );
}

export default Home;
