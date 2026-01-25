function toggleCategory() {
    let cat = document.getElementById("category").value;
    document.getElementById("allocation").style.display =
        cat === "allocation" ? "block" : "none";
    document.getElementById("paging").style.display =
        cat === "paging" ? "block" : "none";
}




function simulateMemory() {
    let cat = document.getElementById("category").value;

    if (cat === "allocation") memoryAllocation();
    else pageReplacement();
}






function memoryAllocation() {
    let algo = document.getElementById("allocAlgo").value;
    let blocks = document.getElementById("blocks").value.split(',').map(Number);
    let processes = document.getElementById("processes").value.split(',').map(Number);

    let originalBlocks = [...blocks];
    let allocation = Array(processes.length).fill(-1);

    for (let i = 0; i < processes.length; i++) {
        let idx = -1;

        for (let j = 0; j < blocks.length; j++) {
            if (blocks[j] >= processes[i]) {
                if (
                    idx === -1 ||
                    (algo === "bf" && blocks[j] < blocks[idx]) ||
                    (algo === "wf" && blocks[j] > blocks[idx])
                ) idx = j;

                if (algo === "ff") break;
            }
        }

        if (idx !== -1) {
            allocation[i] = idx;
            blocks[idx] -= processes[i];
        }
    }

    /* ----- TABLE ----- */
    let html = "<h3>Allocation Table</h3><table border='1'><tr><th>Process</th><th>Size</th><th>Block</th></tr>";
    for (let i = 0; i < processes.length; i++) {
        html += `<tr>
            <td>P${i+1}</td>
            <td>${processes[i]}</td>
            <td>${allocation[i] === -1 ? "Not Allocated" : allocation[i]+1}</td>
        </tr>`;
    }
    html += "</table>";

    /* ----- VISUAL BLOCKS ----- */
    html += "<h3>Memory Blocks</h3><div class='memory-container'>";

    for (let i = 0; i < originalBlocks.length; i++) {
        let used = originalBlocks[i] - blocks[i];
        html += `
        <div class="memory-block">
            <div class="block-used">Used: ${used}</div>
            <div class="block-free">Free: ${blocks[i]}</div>
        </div>`;
    }

    html += "</div>";
    document.getElementById("output").innerHTML = html;
}





function pageReplacement() {
    let algo = document.getElementById("pageAlgo").value;
    let pages = document.getElementById("pages").value.split(',').map(Number);
    let frames = Number(document.getElementById("frames").value);

    let frame = Array(frames).fill("-");
    let fault = 0;
    let html = "<h3>Page Replacement</h3>";

    html += "<table class='frame-table'><tr><th>Page</th>";
    for (let i = 0; i < frames; i++) html += `<th>F${i+1}</th>`;
    html += "</tr>";

    for (let i = 0; i < pages.length; i++) {
        let hit = frame.includes(pages[i]);

        if (!hit) {
            fault++;
            let idx = 0;

            if (frame.includes("-")) idx = frame.indexOf("-");
            else if (algo === "fifo") idx = i % frames;
            else if (algo === "lru") {
                let used = frame.map(p => {
                    for (let j = i-1; j >= 0; j--)
                        if (pages[j] === p) return j;
                    return -1;
                });
                idx = used.indexOf(Math.min(...used));
            }
            else if (algo === "opt") {
                let future = frame.map(p => {
                    for (let j = i+1; j < pages.length; j++)
                        if (pages[j] === p) return j;
                    return Infinity;
                });
                idx = future.indexOf(Math.max(...future));
            }

            frame[idx] = pages[i];
        }

        html += `<tr class="${hit ? "page-hit" : "page-fault"}">
            <td>${pages[i]}</td>
            ${frame.map(f => `<td>${f}</td>`).join("")}
        </tr>`;
    }

    html += "</table>";
    html += `<p><b>Total Page Faults:</b> ${fault}</p>`;

    document.getElementById("output").innerHTML = html;
}