// Special negation function, since js stores 32 bit integers, but we need 4/8/16 bits.
function negate(term,var_count){
    return ~term & ((1 << (2 ** var_count)) - 1);
}

// Terraria gate logic. 
// Some functions need a variable count argument for negation.
// XOR and XNOR needs special treatment, and is converted to a normalform with the least operations (performance increase in doing that is probably negligible)
const Gates = [
    ["⨀",{
        1:(t)=> t[0],
        2:(t,v_c)=>negate(t[0]^t[1] , v_c),
        3:(t,v_c)=>negate((t[0] & t[1] & t[2]) ^ t[0] ^ t[1] ^ t[2] , v_c),
        4:(t,v_c)=>negate(
            (t[0] & t[1] & t[2]) ^ 
            (t[0] & t[1] & t[3]) ^ 
            (t[0] & t[2] & t[3]) ^ 
            (t[1] & t[2] & t[3]) ^ 
            t[0] ^ t[1] ^ t[2] ^ t[3]
        ,v_c),
        5:(t,v_c)=>negate(
            (t[0] & t[1] & t[2]) ^ 
            (t[0] & t[1] & t[3]) ^ 
            (t[0] & t[1] & t[4]) ^ 
            (t[0] & t[2] & t[3]) ^ 
            (t[0] & t[2] & t[4]) ^ 
            (t[0] & t[3] & t[4]) ^ 
            (t[1] & t[2] & t[3]) ^ 
            (t[1] & t[2] & t[4]) ^ 
            (t[1] & t[3] & t[4]) ^ 
            (t[2] & t[3] & t[4]) ^ 
            (t[0] & t[1] & t[2] & t[3] & t[4]) ^ 
            t[0] ^ t[1] ^ t[2] ^ t[3] ^ t[4]
        ,v_c),
        6:(t,v_c)=>negate(
            (t[0] & t[1] & t[2]) ^ 
            (t[0] & t[1] & t[3]) ^ 
            (t[0] & t[1] & t[4]) ^ 
            (t[0] & t[1] & t[5]) ^ 
            (t[0] & t[2] & t[3]) ^ 
            (t[0] & t[2] & t[4]) ^ 
            (t[0] & t[2] & t[5]) ^ 
            (t[0] & t[3] & t[4]) ^ 
            (t[0] & t[3] & t[5]) ^ 
            (t[0] & t[4] & t[5]) ^ 
            (t[1] & t[2] & t[3]) ^ 
            (t[1] & t[2] & t[4]) ^ 
            (t[1] & t[2] & t[5]) ^ 
            (t[1] & t[3] & t[4]) ^ 
            (t[1] & t[3] & t[5]) ^ 
            (t[1] & t[4] & t[5]) ^ 
            (t[2] & t[3] & t[4]) ^ 
            (t[2] & t[3] & t[5]) ^ 
            (t[2] & t[4] & t[5]) ^ 
            (t[3] & t[4] & t[5]) ^
            (t[0] & t[1] & t[2] & t[3] & t[4]) ^ 
            (t[0] & t[1] & t[2] & t[3] & t[5]) ^
            (t[0] & t[1] & t[2] & t[4] & t[5]) ^
            (t[0] & t[1] & t[3] & t[4] & t[5]) ^
            (t[0] & t[2] & t[3] & t[4] & t[5]) ^
            (t[1] & t[2] & t[3] & t[4] & t[5]) ^ 
            t[0] ^ t[1] ^ t[2] ^ t[3] ^ t[4] ^ t[5]
        ,v_c),
    }],
    ["⊕",{
        1:(t)=> t[0],
        2:(t)=> t[0]^t[1],
        3:(t)=> (t[0] & t[1] & t[2]) ^ t[0] ^ t[1] ^ t[2],
        4:(t)=>
            (t[0] & t[1] & t[2]) ^ 
            (t[0] & t[1] & t[3]) ^ 
            (t[0] & t[2] & t[3]) ^ 
            (t[1] & t[2] & t[3]) ^ 
            t[0] ^ t[1] ^ t[2] ^ t[3],
        5:(t)=>
            (t[0] & t[1] & t[2]) ^ 
            (t[0] & t[1] & t[3]) ^ 
            (t[0] & t[1] & t[4]) ^ 
            (t[0] & t[2] & t[3]) ^ 
            (t[0] & t[2] & t[4]) ^ 
            (t[0] & t[3] & t[4]) ^ 
            (t[1] & t[2] & t[3]) ^ 
            (t[1] & t[2] & t[4]) ^ 
            (t[1] & t[3] & t[4]) ^ 
            (t[2] & t[3] & t[4]) ^ 
            (t[0] & t[1] & t[2] & t[3] & t[4]) ^ 
            t[0] ^ t[1] ^ t[2] ^ t[3] ^ t[4],
        6:(t)=>
            (t[0] & t[1] & t[2]) ^ 
            (t[0] & t[1] & t[3]) ^ 
            (t[0] & t[1] & t[4]) ^ 
            (t[0] & t[1] & t[5]) ^ 
            (t[0] & t[2] & t[3]) ^ 
            (t[0] & t[2] & t[4]) ^ 
            (t[0] & t[2] & t[5]) ^ 
            (t[0] & t[3] & t[4]) ^ 
            (t[0] & t[3] & t[5]) ^ 
            (t[0] & t[4] & t[5]) ^ 
            (t[1] & t[2] & t[3]) ^ 
            (t[1] & t[2] & t[4]) ^ 
            (t[1] & t[2] & t[5]) ^ 
            (t[1] & t[3] & t[4]) ^ 
            (t[1] & t[3] & t[5]) ^ 
            (t[1] & t[4] & t[5]) ^ 
            (t[2] & t[3] & t[4]) ^ 
            (t[2] & t[3] & t[5]) ^ 
            (t[2] & t[4] & t[5]) ^ 
            (t[3] & t[4] & t[5]) ^
            (t[0] & t[1] & t[2] & t[3] & t[4]) ^ 
            (t[0] & t[1] & t[2] & t[3] & t[5]) ^
            (t[0] & t[1] & t[2] & t[4] & t[5]) ^
            (t[0] & t[1] & t[3] & t[4] & t[5]) ^
            (t[0] & t[2] & t[3] & t[4] & t[5]) ^
            (t[1] & t[2] & t[3] & t[4] & t[5]) ^ 
            t[0] ^ t[1] ^ t[2] ^ t[3] ^ t[4] ^ t[5],
    }],
    ["∧", {
        1:(t)=>t[0],
        2:(t)=>t[0]&t[1],
        3:(t)=>t[0]&t[1]&t[2],
        4:(t)=>t[0]&t[1]&t[2]&t[3],
        5:(t)=>t[0]&t[1]&t[2]&t[3]&t[4],
        6:(t)=>t[0]&t[1]&t[2]&t[3]&t[4]&t[5],
    }],
    ["∨", { // after introducing constants to the terms table, the OR function should be redundant and removed. Need to test this.
        1:(t)=>t[0],
        2:(t)=>t[0]|t[1],
        3:(t)=>t[0]|t[1]|t[2],
        4:(t)=>t[0]|t[1]|t[2]|t[3],
        5:(t)=>t[0]|t[1]|t[2]|t[3]|t[4],
        6:(t)=>t[0]|t[1]|t[2]|t[3]|t[4]|t[5],
    }],
];