function simulateDisk() {
    let algo = document.getElementById("diskAlgo").value;
    let req = document.getElementById("requests").value.split(',').map(Number);
    let head = Number(document.getElementById("head").value);
    let size = Number(document.getElementById("diskSize").value);
    let dir = document.getElementById("direction").value;

    let sequence = [];

    if (algo === "fcfs") sequence = fcfsDisk(req, head);
    else if (algo === "sstf") sequence = sstf(req, head);
    else if (algo === "scan") sequence = scan(req, head, size, dir);
    else if (algo === "cscan") sequence = cscan(req, head, size, dir);

    drawDisk(sequence);
    drawDiskGraph(sequence, size);   // 🔥 graph call
}


/* ---------- FCFS ---------- */
function fcfsDisk(req, head) {
    return [head, ...req];
}


/* ---------- SSTF ---------- */
function sstf(req, head) {
    let pending = [...req];
    let seq = [head];

    while (pending.length) {
        pending.sort((a,b)=>Math.abs(a-head)-Math.abs(b-head));
        head = pending.shift();
        seq.push(head);
    }
    return seq;
}


/* ---------- SCAN ---------- */
function scan(req, head, size, dir) {
    let left = req.filter(r => r < head).sort((a,b)=>b-a);
    let right = req.filter(r => r >= head).sort((a,b)=>a-b);
    let seq = [head];

    if (dir === "left") {
        seq.push(...left, 0, ...right);
    } else {
        seq.push(...right, size-1, ...left);
    }
    return seq;
}


/* ---------- C-SCAN ---------- */
function cscan(req, head, size, dir) {
    let left = req.filter(r => r < head).sort((a,b)=>a-b);
    let right = req.filter(r => r >= head).sort((a,b)=>a-b);
    let seq = [head];

    if (dir === "left") {
        seq.push(...left.reverse(), 0, size-1, ...right.reverse());
    } else {
        seq.push(...right, size-1, 0, ...left);
    }
    return seq;
}


/* ---------- TEXT + BAR VISUALIZATION ---------- */
function drawDisk(seq) {
    let total = 0;
    for (let i = 1; i < seq.length; i++) {
        total += Math.abs(seq[i] - seq[i-1]);
    }

    let html = `
        <h3>Seek Sequence</h3>
        <p>${seq.join(" → ")}</p>
        <p><b>Total Seek Time:</b> ${total}</p>
        <div class="disk-bar">
    `;

    seq.forEach((s,i) => {
        html += `<div class="disk-step ${i===0 ? "disk-head" : ""}">${s}</div>`;
    });

    html += "</div><div id='diskGraph'></div>";
    document.getElementById("output").innerHTML = html;
}


/* ---------- GRAPH VISUALIZATION ---------- */
function drawDiskGraph(seq, diskSize) {
    let graphDiv = document.getElementById("diskGraph");
    graphDiv.innerHTML = `
        <h3>Disk Head Movement Graph</h3>
        <div class="disk-graph"></div>
    `;

    let graph = graphDiv.querySelector(".disk-graph");
    let width = graph.clientWidth;
    let height = graph.clientHeight;

    let points = seq.map((v, i) => ({
        x: (v / diskSize) * width,
        y: height - (i / seq.length) * height
    }));

    for (let i = 0; i < points.length; i++) {
        let dot = document.createElement("div");
        dot.className = "disk-point";
        dot.style.left = points[i].x + "px";
        dot.style.top = points[i].y + "px";
        graph.appendChild(dot);

        if (i > 0) {
            let dx = points[i].x - points[i-1].x;
            let dy = points[i].y - points[i-1].y;
            let length = Math.sqrt(dx*dx + dy*dy);
            let angle = Math.atan2(dy, dx) * 180 / Math.PI;

            let line = document.createElement("div");
            line.className = "disk-line";
            line.style.width = length + "px";
            line.style.left = points[i-1].x + "px";
            line.style.top = points[i-1].y + "px";
            line.style.transform = `rotate(${angle}deg)`;
            graph.appendChild(line);
        }
    }
}