/*************** GANTT CHART *****************/
function drawGantt(execution) {
    let gantt = "<h3>Gantt Chart</h3><div class='gantt-row'>";

    execution.forEach(e => {
        let cls = e.pid === "IDLE" ? "gantt-block idle" : "gantt-block process";
        gantt += `
            <div class="${cls}">
                ${e.pid}<br>${e.start}-${e.end}
            </div>
        `;
    });

    gantt += "</div>";
    document.getElementById("gantt").innerHTML = gantt;
}


/*************** TABLE *****************/
function drawTable(at, bt, ct) {
    let n = bt.length;
    let wt = [], tat = [];
    let avgWT = 0, avgTAT = 0;

    let table = `<h3>Process Table</h3>
    <table border="1" cellspacing="0" cellpadding="5">
    <tr>
        <th>Process</th>
        <th>AT</th>
        <th>BT</th>
        <th>CT</th>
        <th>TAT</th>
        <th>WT</th>
    </tr>`;

    for (let i = 0; i < n; i++) {
        tat[i] = ct[i] - at[i];
        wt[i] = tat[i] - bt[i];
        avgWT += wt[i];
        avgTAT += tat[i];

        table += `
        <tr>
            <td>P${i+1}</td>
            <td>${at[i]}</td>
            <td>${bt[i]}</td>
            <td>${ct[i]}</td>
            <td>${tat[i]}</td>
            <td>${wt[i]}</td>
        </tr>`;
    }

    table += `</table>
    <p><b>Average WT:</b> ${(avgWT/n).toFixed(2)}</p>
    <p><b>Average TAT:</b> ${(avgTAT/n).toFixed(2)}</p>`;

    document.getElementById("table").innerHTML = table;
}


/*************** MAIN SIMULATOR *****************/
function simulate() {
    let algo = document.getElementById("algo").value;

    let at = document.getElementById("arrival").value.split(',').map(Number);
    let bt = document.getElementById("burst").value.split(',').map(Number);
    let pr = document.getElementById("priority").value
        ? document.getElementById("priority").value.split(',').map(Number)
        : [];
    let tq = Number(document.getElementById("quantum").value);

    if (at.length !== bt.length) {
        alert("Arrival time and Burst time count mismatch");
        return;
    }

    if (algo === "fcfs") fcfs(at, bt);
    else if (algo === "sjf") sjf(at, bt);
    else if (algo === "srtf") srtf(at, bt);
    else if (algo === "rr") roundRobin(at, bt, tq);
    else if (algo === "pnp") priorityNP(at, bt, pr);
    else if (algo === "pp") priorityP(at, bt, pr);
}


/*************** FCFS *****************/
function fcfs(at, bt) {
    let n = bt.length;
    let p = at.map((v,i)=>({at:v, bt:bt[i], id:i}));
    p.sort((a,b)=>a.at-b.at);

    let time = 0, execution = [];
    let ct = Array(n).fill(0);

    for (let x of p) {
        if (time < x.at) {
            execution.push({pid:"IDLE", start:time, end:x.at});
            time = x.at;
        }
        execution.push({pid:`P${x.id+1}`, start:time, end:time+x.bt});
        time += x.bt;
        ct[x.id] = time;
    }

    drawGantt(execution);
    drawTable(at, bt, ct);
}


/*************** SJF (NON-PREEMPTIVE) *****************/
function sjf(at, bt) {
    let n = bt.length;
    let done = Array(n).fill(false);
    let ct = Array(n).fill(0);
    let time = 0, completed = 0;
    let execution = [];

    while (completed < n) {
        let idx = -1, minBT = Infinity;

        for (let i = 0; i < n; i++) {
            if (!done[i] && at[i] <= time && bt[i] < minBT) {
                minBT = bt[i];
                idx = i;
            }
        }

        if (idx === -1) {
            execution.push({pid:"IDLE", start:time, end:time+1});
            time++;
            continue;
        }

        execution.push({pid:`P${idx+1}`, start:time, end:time+bt[idx]});
        time += bt[idx];
        ct[idx] = time;
        done[idx] = true;
        completed++;
    }

    drawGantt(execution);
    drawTable(at, bt, ct);
}


/*************** SRTF *****************/
function srtf(at, bt) {
    let n = bt.length;
    let rt = [...bt];
    let ct = Array(n).fill(0);
    let time = 0, completed = 0;
    let execution = [];
    let last = "";

    while (completed < n) {
        let idx = -1, minRT = Infinity;

        for (let i = 0; i < n; i++) {
            if (at[i] <= time && rt[i] > 0 && rt[i] < minRT) {
                minRT = rt[i];
                idx = i;
            }
        }

        let pid = idx === -1 ? "IDLE" : `P${idx+1}`;

        if (execution.length === 0 || execution[execution.length-1].pid !== pid) {
            execution.push({pid, start:time, end:time+1});
        } else {
            execution[execution.length-1].end++;
        }

        time++;

        if (idx !== -1) {
            rt[idx]--;
            if (rt[idx] === 0) {
                ct[idx] = time;
                completed++;
            }
        }
    }

    drawGantt(execution);
    drawTable(at, bt, ct);
}


/*************** ROUND ROBIN *****************/
function roundRobin(at, bt, tq) {
    let n = bt.length;
    let rt = [...bt];
    let ct = Array(n).fill(0);
    let time = 0;
    let execution = [];
    let queue = [];
    let visited = Array(n).fill(false);

    while (true) {
        let done = true;

        for (let i = 0; i < n; i++) {
            if (!visited[i] && at[i] <= time) {
                queue.push(i);
                visited[i] = true;
            }
        }

        if (queue.length === 0) {
            if (visited.every(v=>v)) break;
            execution.push({pid:"IDLE", start:time, end:time+1});
            time++;
            continue;
        }

        let i = queue.shift();
        done = false;

        let exec = Math.min(tq, rt[i]);
        execution.push({pid:`P${i+1}`, start:time, end:time+exec});
        time += exec;
        rt[i] -= exec;

        for (let j = 0; j < n; j++) {
            if (!visited[j] && at[j] <= time) {
                queue.push(j);
                visited[j] = true;
            }
        }

        if (rt[i] > 0) queue.push(i);
        else ct[i] = time;
    }

    drawGantt(execution);
    drawTable(at, bt, ct);
}


/*************** PRIORITY (NON-PREEMPTIVE) *****************/
function priorityNP(at, bt, pr) {
    let n = bt.length;
    let done = Array(n).fill(false);
    let ct = Array(n).fill(0);
    let time = 0, completed = 0;
    let execution = [];

    while (completed < n) {
        let idx = -1, best = Infinity;

        for (let i = 0; i < n; i++) {
            if (!done[i] && at[i] <= time && pr[i] < best) {
                best = pr[i];
                idx = i;
            }
        }

        if (idx === -1) {
            execution.push({pid:"IDLE", start:time, end:time+1});
            time++;
            continue;
        }

        execution.push({pid:`P${idx+1}`, start:time, end:time+bt[idx]});
        time += bt[idx];
        ct[idx] = time;
        done[idx] = true;
        completed++;
    }

    drawGantt(execution);
    drawTable(at, bt, ct);
}


/*************** PRIORITY (PREEMPTIVE) *****************/
function priorityP(at, bt, pr) {
    let n = bt.length;
    let rt = [...bt];
    let ct = Array(n).fill(0);
    let time = 0, completed = 0;
    let execution = [];

    while (completed < n) {
        let idx = -1, best = Infinity;

        for (let i = 0; i < n; i++) {
            if (at[i] <= time && rt[i] > 0 && pr[i] < best) {
                best = pr[i];
                idx = i;
            }
        }

        let pid = idx === -1 ? "IDLE" : `P${idx+1}`;

        if (execution.length === 0 || execution[execution.length-1].pid !== pid) {
            execution.push({pid, start:time, end:time+1});
        } else {
            execution[execution.length-1].end++;
        }

        time++;

        if (idx !== -1) {
            rt[idx]--;
            if (rt[idx] === 0) {
                ct[idx] = time;
                completed++;
            }
        }
    }

    drawGantt(execution);
    drawTable(at, bt, ct);
}