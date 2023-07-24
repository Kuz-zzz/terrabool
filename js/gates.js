// Special negation function, since js stores 32 bit integers, but we need 4/8/16 bits.
function negate(term,var_count){
    return ~term & ((1 << (2 ** var_count)) - 1);
}

// Terraria gate logic. 
function Xor(numbers){
    let result = 0;
    for (let i = 0; i < 32; i++) {
        let bitCount = 0;

        for (const number of numbers) {
        bitCount += (number >> i) & 1;
        }
        if (bitCount == 1)
            result |= 1 << i;
    }
    return result;
}

const Gates = [
    {   
        symbol:"⨀",
        combine: (numbers,vcount) => negate(Xor(numbers),vcount)
    },
    {   
        symbol:"⊕", 
        combine: (numbers) => Xor(numbers)
    },
    {   
        symbol:"∧",
        combine: (numbers) => numbers.reduce((a, b) => a & b)
    },
    {   
        symbol:"∨",
        combine: (numbers) => numbers.reduce((a, b) => a | b)
    },
];