function simulateBanker() {

    let allocation = document.getElementById("allocation").value
        .split(",")
        .map(row => row.trim().split(" ").map(Number));

    let max = document.getElementById("max").value
        .split(",")
        .map(row => row.trim().split(" ").map(Number));

    let available = document.getElementById("available").value
        .trim().split(" ").map(Number);

    let n = allocation.length;        // processes
    let m = available.length;         // resources

    // Need = Max - Allocation
    let need = Array.from({length:n}, ()=>Array(m).fill(0));
    for (let i = 0; i < n; i++) {
        for (let j = 0; j < m; j++) {
            need[i][j] = max[i][j] - allocation[i][j];
        }
    }

    let finish = Array(n).fill(false);
    let safeSeq = [];
    let work = [...available];

    while (safeSeq.length < n) {
        let found = false;

        for (let i = 0; i < n; i++) {
            if (!finish[i]) {
                let canRun = true;
                for (let j = 0; j < m; j++) {
                    if (need[i][j] > work[j]) {
                        canRun = false;
                        break;
                    }
                }

                if (canRun) {
                    for (let j = 0; j < m; j++)
                        work[j] += allocation[i][j];

                    finish[i] = true;
                    safeSeq.push("P" + i);
                    found = true;
                }
            }
        }

        if (!found) break;
    }

    displayResult(finish, safeSeq, allocation, max, need, available);
}


/* ---------- OUTPUT ---------- */
function displayResult(finish, safeSeq, allocation, max, need, available) {

    let html = "<h3>Banker's Algorithm Result</h3>";

    html += "<table><tr><th>Process</th><th>Allocation</th><th>Max</th><th>Need</th></tr>";

    for (let i = 0; i < allocation.length; i++) {
        html += `
        <tr>
            <td>P${i}</td>
            <td>${allocation[i].join(" ")}</td>
            <td>${max[i].join(" ")}</td>
            <td>${need[i].join(" ")}</td>
        </tr>`;
    }

    html += "</table><br>";

    if (finish.every(x => x)) {
        html += `<p style="color:#00ffcc;font-weight:bold;">
                 ✅ System is in SAFE STATE</p>`;
        html += `<p><b>Safe Sequence:</b> ${safeSeq.join(" → ")}</p>`;
    } else {
        html += `<p style="color:#ff4b2b;font-weight:bold;">
                 ❌ System is in UNSAFE STATE (Deadlock possible)</p>`;
    }

    document.getElementById("output").innerHTML = html;
}