// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

/**
 * @title PredictionMarket
 * @dev A simple prediction market contract where users can buy shares in market outcomes
 */
contract PredictionMarket is Ownable {
    // Market structure
    struct Market {
        string question;
        string optionA;
        string optionB;
        uint256 endTime;
        uint8 outcome; // 0 = unresolved, 1 = optionA won, 2 = optionB won
        uint256 totalOptionAShares;
        uint256 totalOptionBShares;
        bool resolved;
    }

    // Mapping from market ID to Market struct
    mapping(uint256 => Market) public markets;
    
    // Total number of markets
    uint256 public marketCount;
    
    // ERC20 token used for purchasing shares (e.g., USDC on Sonic mainnet)
    IERC20 public token;
    
    // Protocol fee: 10% (1000 = 10%, stored as basis points)
    uint256 public constant PROTOCOL_FEE_BPS = 1000; // 10%
    
    // Admin wallet address for receiving protocol fees
    address public constant ADMIN_WALLET = 0xBd01d1D9C9F7475641092A6387FFE9f07237a2E3;
    
    // Mapping from market ID => user address => (optionA shares, optionB shares)
    mapping(uint256 => mapping(address => uint256[2])) public shares;
    
    // Events
    event MarketCreated(uint256 indexed marketId, string question, string optionA, string optionB, uint256 endTime);
    event SharesPurchased(uint256 indexed marketId, address indexed buyer, bool isOptionA, uint256 amount);
    event MarketResolved(uint256 indexed marketId, uint8 outcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed winner, uint256 amount);

    /**
     * @param _token Address of the ERC20 token contract (e.g., USDC)
     *               On Sonic mainnet: 0x29219dd400f2Bf60E5a23d13Be72B486D4038894
     */
    constructor(address _token) Ownable(msg.sender) {
        token = IERC20(_token);
    }

    /**
     * @dev Create a new prediction market
     * @param _question The market question
     * @param _optionA First option
     * @param _optionB Second option
     * @param _endTime Unix timestamp when market closes
     */
    function createMarket(
        string memory _question,
        string memory _optionA,
        string memory _optionB,
        uint256 _endTime
    ) public onlyOwner {
        require(_endTime > block.timestamp, "End time must be in the future");
        
        markets[marketCount] = Market({
            question: _question,
            optionA: _optionA,
            optionB: _optionB,
            endTime: _endTime,
            outcome: 0,
            totalOptionAShares: 0,
            totalOptionBShares: 0,
            resolved: false
        });
        
        emit MarketCreated(marketCount, _question, _optionA, _optionB, _endTime);
        marketCount++;
    }

    /**
     * @dev Get market information
     * @param _marketId The market ID
     * @return question, optionA, optionB, endTime, outcome, totalOptionAShares, totalOptionBShares, resolved
     */
    function getMarketInfo(uint256 _marketId) 
        public 
        view 
        returns (
            string memory,
            string memory,
            string memory,
            uint256,
            uint8,
            uint256,
            uint256,
            bool
        ) 
    {
        Market memory market = markets[_marketId];
        return (
            market.question,
            market.optionA,
            market.optionB,
            market.endTime,
            market.outcome,
            market.totalOptionAShares,
            market.totalOptionBShares,
            market.resolved
        );
    }

    /**
     * @dev Buy shares for a market
     * @param _marketId The market ID
     * @param _isOptionA True to buy option A shares, false for option B
     * @param _amount Amount of tokens to spend (1 token = 1 share)
     */
    function buyShares(uint256 _marketId, bool _isOptionA, uint256 _amount) public {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Market is resolved");
        require(block.timestamp < market.endTime, "Market has ended");
        require(_amount > 0, "Amount must be greater than 0");
        
        // Transfer tokens from user to contract
        require(token.transferFrom(msg.sender, address(this), _amount), "Token transfer failed");
        
        // Update shares
        if (_isOptionA) {
            market.totalOptionAShares += _amount;
            shares[_marketId][msg.sender][0] += _amount;
        } else {
            market.totalOptionBShares += _amount;
            shares[_marketId][msg.sender][1] += _amount;
        }
        
        emit SharesPurchased(_marketId, msg.sender, _isOptionA, _amount);
    }

    /**
     * @dev Resolve a market (only owner)
     * @param _marketId The market ID
     * @param _outcome 1 for optionA, 2 for optionB
     * @notice Owner can resolve markets early before expiration
     */
    function resolveMarket(uint256 _marketId, uint8 _outcome) public onlyOwner {
        Market storage market = markets[_marketId];
        require(!market.resolved, "Market already resolved");
        require(_outcome == 1 || _outcome == 2, "Invalid outcome");
        
        market.outcome = _outcome;
        market.resolved = true;
        
        emit MarketResolved(_marketId, _outcome);
    }

    /**
     * @dev Claim winnings from a resolved market
     * @param _marketId The market ID
     * @notice 10% protocol fee is deducted and sent to admin wallet
     */
    function claimWinnings(uint256 _marketId) public {
        Market storage market = markets[_marketId];
        require(market.resolved, "Market not resolved");
        require(market.outcome != 0, "Market outcome not set");
        
        uint256[2] memory userShares = shares[_marketId][msg.sender];
        uint256 winningShares = market.outcome == 1 ? userShares[0] : userShares[1];
        require(winningShares > 0, "No winning shares");
        
        // Calculate winnings: proportional share of total pool
        uint256 totalShares = market.outcome == 1 ? market.totalOptionAShares : market.totalOptionBShares;
        uint256 totalPool = market.totalOptionAShares + market.totalOptionBShares;
        uint256 grossWinnings = (totalPool * winningShares) / totalShares;
        
        // Calculate protocol fee (10%)
        uint256 protocolFee = (grossWinnings * PROTOCOL_FEE_BPS) / 10000;
        uint256 netWinnings = grossWinnings - protocolFee;
        
        // Reset user shares to prevent double claiming
        if (market.outcome == 1) {
            shares[_marketId][msg.sender][0] = 0;
        } else {
            shares[_marketId][msg.sender][1] = 0;
        }
        
        // Transfer net winnings to user
        require(token.transfer(msg.sender, netWinnings), "Token transfer failed");
        
        // Transfer protocol fee to admin wallet
        if (protocolFee > 0) {
            require(token.transfer(ADMIN_WALLET, protocolFee), "Fee transfer failed");
        }
        
        emit WinningsClaimed(_marketId, msg.sender, netWinnings);
    }

    /**
     * @dev Get user's share balance for a market
     * @param _marketId The market ID
     * @param _user The user address
     * @return optionAShares, optionBShares
     */
    function getSharesBalance(uint256 _marketId, address _user) 
        public 
        view 
        returns (uint256, uint256) 
    {
        return (shares[_marketId][_user][0], shares[_marketId][_user][1]);
    }
}

