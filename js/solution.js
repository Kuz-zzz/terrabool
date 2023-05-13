const worker = new Worker("js/worker.js");
const error = document.getElementById("error");
const result = document.getElementById("result");
const loader = document.getElementById("loader");
let results;
function calculate(){
    // Data validation
    let term = document.getElementById("term").value;
    let var_count, max_d = 4;
    switch (term.length) {
        case 4:
            var_count = 2;
            break;
        case 8:
            var_count = 3;
            break;
        case 16:
            var_count = 4;
            max_d = 5;
            break;
        default:
            error.style.display = "block";
            error.innerHTML = "Invalid value length"; 
            return;
    }
    if(!term.match(/^[01a-z]+$/)){
        error.style.display = "block";
        error.innerHTML = "Use only 0 and 1";
        return;
    }
    
    result.innerHTML = "";
    error.style.display = "none";
    // end of data validation

    // separate don't cares from the term, reformat as integers.
    let mask = parseInt(term.replace(/[1a-z]/g,a => (a=='1')?'0':'1'),2);
    term = parseInt(term.replace(/[a-z]/g,"1"),2);

    worker.postMessage({
        action: 'search',
        var_count: var_count,
        max_d: max_d,
        term: term,
        mask: mask
    });

    loader.style.display = "inline-block";
}

function startTest(depth){
    worker.postMessage({
        action: 'test',
        depth: depth
    });
}

worker.onmessage = e => {
    switch (e.data[0]) {
        case "result":
            loader.style.display = "none";
            solutions = e.data[1];
            console.table(solutions);// keep this log for anyone who wants to see the other candidates

            if(solutions.length > 0){
                min = Math.min(...solutions.map(a => a[1]));
                solutions = solutions.filter(term => term[1] === min).sort((a,b)=>a[0].length-b[0].length)[0][0];

                result.innerHTML = solutions;
                break;
            }

            result.innerHTML = `You should not be able to see this message. Please report this as a bug.`;
        break;

        case "double":
            loader.style.display = "none";
            solutions = e.data[1];
            solutions2 = e.data[2];
            console.table(solutions);
            console.table(solutions2);

            if(solutions.length > 0 && solutions2.length > 0){
                min = Math.min(...solutions.map(a => a[1]));
                min2 = Math.min(...solutions2.map(a => a[1]));
                solutions = solutions.filter(term => term[1] === min).sort((a,b)=>a[0].length-b[0].length)[0][0];
                solutions2 = solutions2.filter(term => term[1] === min2).sort((a,b)=>a[0].length-b[0].length)[0][0];

                result.innerHTML = `{${solutions}} ⊻<br>{${solutions2}}`;
                break;
            }
    
            result.innerHTML = `You should not be able to see this message. Please report this as a bug.`;
        break;

        case "test":
            results = e.data[1];
            // console.log(results.reduce((a,b)=>a+b));
            console.log(results);
        break;
    }
}