// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

contract BearFood {
    address public owner;
    mapping(address => uint256) public userBalances;
    mapping(uint256 => uint256) public foodPrices;
    mapping(uint256 => string) public foodNames;

    event FoodPurchased(address indexed buyer, uint256 foodId, uint256 price);
    event FoodPriceUpdated(uint256 foodId, uint256 newPrice);

    constructor() {
        owner = msg.sender;
        
        // Initialize food items
        foodPrices[1] = 5 ether;  // Banana
        foodPrices[2] = 6 ether;  // Apple
        foodPrices[3] = 4 ether;  // Carrot
        foodPrices[4] = 15 ether; // Honey

        foodNames[1] = "Banana";
        foodNames[2] = "Apple";
        foodNames[3] = "Carrot";
        foodNames[4] = "Honey";
    }

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    function purchaseFood(uint256 foodId) external payable {
        require(foodPrices[foodId] > 0, "Invalid food item");
        require(msg.value >= foodPrices[foodId], "Insufficient payment");

        // Process purchase
        userBalances[msg.sender] += msg.value;
        
        // Emit event
        emit FoodPurchased(msg.sender, foodId, foodPrices[foodId]);

        // Return excess payment if any
        uint256 excess = msg.value - foodPrices[foodId];
        if (excess > 0) {
            payable(msg.sender).transfer(excess);
        }
    }

    function updateFoodPrice(uint256 foodId, uint256 newPrice) external onlyOwner {
        require(foodPrices[foodId] > 0, "Invalid food item");
        foodPrices[foodId] = newPrice;
        emit FoodPriceUpdated(foodId, newPrice);
    }

    function getFoodPrice(uint256 foodId) external view returns (uint256) {
        require(foodPrices[foodId] > 0, "Invalid food item");
        return foodPrices[foodId];
    }

    function withdraw() external onlyOwner {
        uint256 balance = address(this).balance;
        require(balance > 0, "No balance to withdraw");
        payable(owner).transfer(balance);
    }
} 