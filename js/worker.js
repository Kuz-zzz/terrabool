importScripts("terms.js", "gates.js","dictionary.js");

// makeExpressionsBFS()
// Generates all possible expressions for a given term, combinations generated in breadth-first-like order.
// varCount: number of variables (2 to 4)
// maxDepth: maximum depth of the expression. i.e. the maximum number of terms
// term: the term to be expressed
// mask: a mask taking care of don't cares
// func: the function to be used. Must be an array with the name of the function and a dictionary with the function for each depth.
// function makeExpression(varCount,maxDepthepth,term,mask,func)
const identity = (varCount,term,mask,val,count,solutions) => {
    for(let gate of Gates){
        if ((gate.combine(val.map(a => a[1]),varCount) | mask) == term)
            solutions.push(val.map(a => a[0]).join(gate.symbol)); // valid expression found. add it to solutions
    }
}
function makeExpressionsBFS(varCount, maxDepth, term, mask, callback = identity) {
    const legalTerms = Terms[varCount];
    let queue = [...legalTerms].map((v, i) => ({ val: [v], idx: i, count: 1 })); // initialize the queue with the individual terms
    let solutions = [];

    while (queue.length > 0) {
        let { val, idx, count } = queue.shift(); // remove the first element from the queue

        callback(varCount,term,mask,val,count,solutions);

        if (count < maxDepth) {
            for (let i = idx + 1; i < legalTerms.length; i++) {
            let newStr = [...val, legalTerms[i]];
            queue.push({ val: newStr, idx: i, count: count + 1 }); // add the new substring to the end of the queue
            }
        }
    }

    return solutions.length > 0 ? solutions : undefined;
}

onmessage = e => {
    switch (e.data.action) {
        case "search":
            const maskedDictionary = Dictionary.map(a => [(a[0] | e.data.mask), a[1]]);
            if(maskedDictionary.find(a => a[0] == e.data.term) || e.data.varCount < 4){ // double search is only meant for 4 variables
                const results = makeExpressionsBFS(e.data.varCount,e.data.maxDepth,e.data.term,e.data.mask);
                postMessage({action:"result",results:results});
            }
            else{
                // find the two terms of the shortest combined complexity that, when XOR'ed together, give the searched term
                let pair = [], min = Infinity;
                for(let j of maskedDictionary){
                    const found = maskedDictionary.filter(a => a[0] == ((e.data.term^j[0])| e.data.mask));
                    for(let f of found){
                        if (f[1]+j[1] < min){
                            pair = [f[0],j[0]];
                            min = f[1]+j[1];
                        }
                    }
                }

                const results1 = makeExpressionsBFS(e.data.varCount,e.data.maxDepth,pair[0],e.data.mask);
                const results2 = makeExpressionsBFS(e.data.varCount,e.data.maxDepth,pair[1],e.data.mask);

                postMessage({action:"double",results1:results1,results2:results2});
            }
        break;
        case "test": // creates the lookup table from dictionary.js
            const testfunc = (varCount,term,mask,val,count,solutions) => {
                for(let gate of Gates){
                    const term = gate.combine(val.map(a => a[1]),varCount);
                    solutions[term] = solutions[term] ? [term, Math.min(solutions[term][1], count)] : [term,count];
                }
            }
            const results = makeExpressionsBFS(e.data.varCount,e.data.maxDepth,0,0,testfunc);
            postMessage({action:"test",results:results});
        break;
    }
}