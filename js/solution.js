const worker = new Worker("js/worker.js");
const error = document.getElementById("error");
const result = document.getElementById("result");
const loader = document.getElementById("loader");
const a_download = document.getElementById("download");
const input_term = document.getElementById("term");

function calculate(){
    // Data validation
    let term = input_term.value;
    let varCount, maxDepth = 4;
    switch (term.length) {
        case 4:
            varCount = 2;
            break;
        case 8:
            varCount = 3;
            break;
        case 16:
            varCount = 4;
            maxDepth = 5;
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
    // end of data validation

    result.innerHTML = "";
    error.style.display = "none";
    a_download.style.display = "none";
    loader.style.display = "inline-block";

    // separate don't cares from the term, reformat as integers.
    let mask = parseInt(term.replace(/[1a-z]/g,a => (a=='1')?'0':'1'),2);
    term = parseInt(term.replace(/[a-z]/g,"1"),2);

    worker.postMessage({
        action: 'search',
        varCount: varCount,
        maxDepth: maxDepth,
        term: term,
        mask: mask
    });
}
var start;
function startTest(varCount,maxDepth){
    start = Date.now();
    worker.postMessage({
        action: 'test',
        varCount: varCount,
        maxDepth: maxDepth
    });
}

worker.onmessage = e => {
    switch (e.data.action) {
        case "result":
            loader.style.display = "none";

            if(e.data.results){
                let csvContent = "data:text/csv;charset=utf-8,\uFEFF" + e.data.results.join("\n");
                let encodedUri = encodeURI(csvContent);
                a_download.setAttribute("href", encodedUri);
                a_download.setAttribute("download", input_term.value + ".csv");
                a_download.style.display = "inline-block";

                result.innerHTML = e.data.results.join("<br>");
            }else{
                result.innerHTML = `Something went wrong. Please report this as a bug.`;
            }
        break;

        case "double":
            loader.style.display = "none";

            if(e.data.results1 && e.data.results2){
                let array = [e.data.results1,e.data.results2];
                array = array[0].map((_, colIndex) => array.map(row => row[colIndex])); // transpose
                let csvContent = "data:text/csv;charset=utf-8,\uFEFF" 
                + array.map(a => a.join(",")).join("\n");

                let encodedUri = encodeURI(csvContent);
                a_download.setAttribute("href", encodedUri);
                a_download.setAttribute("download", input_term.value + ".csv");
                a_download.style.display = "inline-block";

                result.innerHTML = `<div class="double">
                    <div>${e.data.results1.join("<br>")}</div>
                    <div>${e.data.results2.join("<br>")}</div>
                </div>`;
            }else{
                result.innerHTML = `Something went wrong. Please report this as a bug.`;
            }
        break;

        case "test":
        let timeTaken = Date.now() - start;
        console.log(Math.round(timeTaken/1000) + " seconds");
            console.log(e.data.results.filter(a => a != null));
        break;
    }
}