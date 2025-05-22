// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

/**
 * @title Simple NFT
 * @dev A simplified NFT implementation
 */
contract SimpleNFT {
    // Token name
    string public name;
    
    // Token symbol
    string public symbol;
    
    // Token ID counter
    uint256 private _tokenIdCounter;
    
    // Mapping from token ID to owner address
    mapping(uint256 => address) private _owners;
    
    // Mapping owner address to token count
    mapping(address => uint256) private _balances;
    
    // Mapping from token ID to approved address
    mapping(uint256 => address) private _tokenApprovals;
    
    // Mapping from owner to operator approvals
    mapping(address => mapping(address => bool)) private _operatorApprovals;
    
    // Events
    event Transfer(address indexed from, address indexed to, uint256 indexed tokenId);
    event Approval(address indexed owner, address indexed approved, uint256 indexed tokenId);
    event ApprovalForAll(address indexed owner, address indexed operator, bool approved);
    
    /**
     * @dev Initializes the contract by setting a name and a symbol
     */
    constructor(string memory _name, string memory _symbol) {
        name = _name;
        symbol = _symbol;
    }
    
    /**
     * @dev Returns the number of tokens owned by `owner`
     */
    function balanceOf(address owner) public view returns (uint256) {
        require(owner != address(0), "Balance query for zero address");
        return _balances[owner];
    }
    
    /**
     * @dev Returns the owner of the `tokenId`
     */
    function ownerOf(uint256 tokenId) public view returns (address) {
        address owner = _owners[tokenId];
        require(owner != address(0), "Owner query for nonexistent token");
        return owner;
    }
    
    /**
     * @dev Approves another address to transfer the given token ID
     */
    function approve(address to, uint256 tokenId) public {
        address owner = ownerOf(tokenId);
        require(to != owner, "Approval to current owner");
        require(
            msg.sender == owner || isApprovedForAll(owner, msg.sender),
            "Not token owner or approved for all"
        );
        
        _tokenApprovals[tokenId] = to;
        emit Approval(owner, to, tokenId);
    }
    
    /**
     * @dev Returns the approved address for a token ID
     */
    function getApproved(uint256 tokenId) public view returns (address) {
        require(_exists(tokenId), "Approved query for nonexistent token");
        return _tokenApprovals[tokenId];
    }
    
    /**
     * @dev Sets or unsets the approval of a given operator
     */
    function setApprovalForAll(address operator, bool approved) public {
        require(operator != msg.sender, "Approve to caller");
        _operatorApprovals[msg.sender][operator] = approved;
        emit ApprovalForAll(msg.sender, operator, approved);
    }
    
    /**
     * @dev Returns if the given operator is allowed to manage tokens of the given owner
     */
    function isApprovedForAll(address owner, address operator) public view returns (bool) {
        return _operatorApprovals[owner][operator];
    }
    
    /**
     * @dev Transfers the ownership of a token from one address to another address
     */
    function transferFrom(address from, address to, uint256 tokenId) public {
        require(_isApprovedOrOwner(msg.sender, tokenId), "Not owner or approved");
        _transfer(from, to, tokenId);
    }
    
    /**
     * @dev Safely mints a new token
     */
    function safeMint(address to) public {
        uint256 tokenId = _tokenIdCounter;
        _tokenIdCounter += 1;
        _mint(to, tokenId);
    }
    
    /**
     * @dev Returns whether `tokenId` exists
     */
    function _exists(uint256 tokenId) internal view returns (bool) {
        return _owners[tokenId] != address(0);
    }
    
    /**
     * @dev Returns whether `spender` is allowed to manage `tokenId`
     */
    function _isApprovedOrOwner(address spender, uint256 tokenId) internal view returns (bool) {
        require(_exists(tokenId), "Operator query for nonexistent token");
        address owner = ownerOf(tokenId);
        return (spender == owner || getApproved(tokenId) == spender || isApprovedForAll(owner, spender));
    }
    
    /**
     * @dev Mints `tokenId` and transfers it to `to`
     */
    function _mint(address to, uint256 tokenId) internal {
        require(to != address(0), "Mint to zero address");
        require(!_exists(tokenId), "Token already minted");
        
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(address(0), to, tokenId);
    }
    
    /**
     * @dev Transfers `tokenId` from `from` to `to`
     */
    function _transfer(address from, address to, uint256 tokenId) internal {
        require(ownerOf(tokenId) == from, "Transfer of token that is not owned");
        require(to != address(0), "Transfer to zero address");
        
        // Clear approvals
        _tokenApprovals[tokenId] = address(0);
        
        _balances[from] -= 1;
        _balances[to] += 1;
        _owners[tokenId] = to;
        
        emit Transfer(from, to, tokenId);
    }
} 