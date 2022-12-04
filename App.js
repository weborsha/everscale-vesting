import React, {Component} from "react";
import {Address, ProviderRpcClient, TvmException} from "everscale-inpage-provider";
import './App.css';

const ever = new ProviderRpcClient();

const DePoolAbi =
    {
        "ABI version": 2,
        "version": "2.2",
        "header": ["pubkey", "time", "expire"],
        "functions": [
            {
                "name": "constructor",
                "inputs": [
                ],
                "outputs": [
                ]
            },
            {
                "name": "addFounder",
                "inputs": [
                    {"name":"addr","type":"address"},
                    {"name":"amount","type":"uint256"}
                ],
                "outputs": [
                ]
            },
            {
                "name": "receiveTokens",
                "inputs": [
                ],
                "outputs": [
                ]
            },
            {
                "name": "founders",
                "inputs": [
                ],
                "outputs": [
                    {"components":[{"name":"amount","type":"uint256"},{"name":"amount_paid","type":"uint256"}],"name":"founders","type":"map(address,tuple)"}
                ]
            }
        ],
        "data": [
        ],
        "events": [
        ],
        "fields": [
            {"name":"_pubkey","type":"uint256"},
            {"name":"_timestamp","type":"uint64"},
            {"name":"_constructorFlag","type":"bool"},
            {"components":[{"name":"amount","type":"uint256"},{"name":"amount_paid","type":"uint256"}],"name":"founders","type":"map(address,tuple)"}
        ]
    }

export default class App extends Component {

    async claimTokens(event) {
        if (!(await ever.hasProvider())) {
            throw new Error('Extension is not installed');
        }

        const { accountInteraction } = await ever.requestPermissions({
            permissions: ['basic', 'accountInteraction'],
        });
        if (accountInteraction == null) {
            throw new Error('Insufficient permissions');
        }

        await ever.changeAccount();

        const selectedAddress = accountInteraction.address;
        const dePoolAddress = new Address('0:db48dac8fdc2c25be83d987280560cd34b35dc9334ab8a2bafef69e1340b6697');

        const dePool = new ever.Contract(DePoolAbi, dePoolAddress);

        const transaction = await dePool
            .methods.receiveTokens({}).send({
                from: selectedAddress,
                amount: '100000000',
                bounce: true,
            });
        console.log(transaction);

        try {
            const output = await dePool
            console.log(output);
        } catch (e) {
            if (e instanceof TvmException) {
                console.error(e.code);
            }
        }
    }
    render() {
        return (
            <div className="App">
                <div className="claim-tokens">
                    <button onClick={this.claimTokens}>Claim</button>
                </div>
            </div>
        );
    }
}
