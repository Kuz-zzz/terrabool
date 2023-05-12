importScripts("terms.js", "gates.js","dictionary.js");

// makeExpression()
// Prepares variables used globally by makeExpressionRec(). Returns a string with the expression, or undefined if no expression was found.
// var_count: number of variables (2 to 4)
// max_depth: maximum depth of the expression. i.e. the maximum number of terms
// term: the term to be expressed
// mask: a mask taking care of don't cares
// func: the function to be used. Must be an array with the name of the function and a dictionary with the function for each depth.
function makeExpression(var_count,max_depth,term,mask,func){
    const legal_terms = terms.filter(t=>t[0]==var_count);
    let solutions = [];

    // makeExpressionRec()
    // Recursive function that assembles combinations of legal terms, saves the combinations that match the search term.
    // depth: current depth (how many lamps are needed ingame)
    // composite: array with current binary combination
    // text: current printable expression
    // terms: array with the remaining terms
    function makeExpressionRec(depth = 1, composite = [], text = [], terms = legal_terms){
        if(depth > max_depth) return;
        for(let t of terms){
            composite[depth-1] = t[2];
            text[depth-1] = t[1];
            // if function found, remember it and continue searching in smaller depths for more succinct functions.
            if((func[1][depth](composite,var_count) | mask) == term) {
                // BUG: artefacts from bigger depths "(¬a⊻b⊻c⊻d)" are kept.
                composite.splice(depth,composite.length); 
                text.splice(depth,text.length);

                solutions.push([
                    text.join(` ${func[0]} `),
                    depth
                ]);
                max_depth = depth;
                
            }
            else makeExpressionRec(depth + 1, composite, text, terms.slice(1));
        }
    }
    makeExpressionRec();
    // return the shortest function
    if(solutions.length > 0){
        let min = Math.min(...solutions.map(a => a[1]));
        return solutions.filter(term => term[1] === min).sort((a,b)=>a[0].length-b[0].length)[0];
    }
    return;
}
let results;
function testExpression(var_count,max_depth,func){
    const legal_terms = terms.filter(t=>t[0]==var_count);
    function makeExpressionRec(depth = 1, composite = [], terms = legal_terms){
        if(depth > max_depth) return;
        for(let t of terms){
            composite[depth-1] = t[2];
            const term = func[1][depth](composite,var_count);
            results[term] = results[term] ? Math.min(results[term], depth) : depth;
            makeExpressionRec(depth + 1, composite, terms.slice(1));
        }
    }
    makeExpressionRec();
}

onmessage = e => {
    // solutions array structure (length 0 if no solution was found, length 4 if all gates had a solution): 
    // [[shortest XNOR, depth], [shortest XOR, depth], [shortest AND, depth], [shortest OR, depth]]
    let solutions = [], solutions2 = [];
    switch (e.data.action) {
        case "search":
            const masked_dictionary = dictionary.map(a => [(a[0] | e.data.mask), a[1]]);
            if(masked_dictionary.find(a => a[0] == e.data.term) || e.data.var_count < 4){ // double search is only meant for 4 variables
                for(let func of gates){
                    if(tmp = makeExpression(e.data.var_count,e.data.max_d,e.data.term,e.data.mask,func)){
                        solutions.push(tmp);
                    }
                }
                postMessage(["result",solutions]);
            }
            else{
                // find the two terms of the shortest combined complexity that, when XOR'ed together, give the searched term
                let pair = [], min = Infinity;
                for(let j of masked_dictionary){
                    const found = masked_dictionary.filter(a => a[0] == ((e.data.term^j[0])| e.data.mask));
                    for(let f of found){
                        if (f[1]+j[1] < min){
                            pair = [f[0],j[0]];
                            min = f[1]+j[1];
                        }
                    }
                }

                // get the valid expressions for that pair of terms.
                for(let func of gates){
                    if(tmp = makeExpression(e.data.var_count,e.data.max_d,pair[0],e.data.mask,func)){
                        solutions.push(tmp);
                    }
                    if(tmp = makeExpression(e.data.var_count,e.data.max_d,pair[1],e.data.mask,func)){
                        solutions2.push(tmp);
                    }
                }
                postMessage(["double",solutions,solutions2]);
            }
        break;
        case "test":
            results = Array(65536).fill(0);
            for(let func of gates){
                testExpression(4,e.data.depth,func);
            }
            postMessage(["test",results]);
        break;
    }
}