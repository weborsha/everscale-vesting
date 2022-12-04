pragma ton-solidity >= 0.57.0;
pragma AbiHeader expire;
pragma AbiHeader pubkey;

import "./interfaces/ITokenWallet.sol";

contract Vesting  {
    address addr_tontokenwallet;
    uint32 start_vesting;

    struct Founder {
        uint128 amount;
        uint128 amount_paid;
    }
    mapping (address=>Founder) public founders;

    constructor() public {
        require(tvm.pubkey() != 0, 101);
        require(msg.pubkey() == tvm.pubkey(), 102);
        tvm.accept();
    }

    modifier onlyOwner {
        require(msg.pubkey() == tvm.pubkey(), 102);
        tvm.accept();
        _;
    }

    // Set vesting config.
    function setVestingconfig(address _addr_tontokenwallet, uint32 _start_vesting) public onlyOwner {
        addr_tontokenwallet = _addr_tontokenwallet;
        start_vesting = _start_vesting;
    }

    // Add founder to database.
    function addFounder(address addr, uint128 amount) public onlyOwner {
        optional(Founder) info = founders.fetch(addr);
        if (!info.hasValue()) {
            founders[addr] = Founder(amount, 0);
        }
    }

    // Function for founder to claim tokens.
    function receiveTokens() view public {
        require(msg.sender != address(0),100);
        address addr = msg.sender;
        optional(Founder) info = founders.fetch(addr);
        if (info.hasValue()) {
            Founder i = info.get();
            if (i.amount > 0) {
                uint128 _amount;
                uint128 receive_amount;
                uint128 amount_rate = calculatePeriod();
                _amount = i.amount * 1000000000 * amount_rate / 15 ;
                receive_amount = _amount - i.amount_paid;
                tvm.accept();
                TvmCell empty;
                TvmCell body_s = tvm.encodeBody(ITokenWallet.transfer, receive_amount, addr, 0, addr, true, empty);
                addr_tontokenwallet.transfer(500000000, false, 0, body_s);

                i.amount_paid = receive_amount;
            }
        }
    }

    function calculatePeriod() inline private view returns (uint128) {
        uint128 _amount_rate;
        uint128 past_time;
        past_time = (now - start_vesting) * 10;
        _amount_rate = past_time / 2629743;
        //_amount_rate = past_time / 120;
        _amount_rate = _amount_rate / 10;
        return _amount_rate;
    }

}
