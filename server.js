const express = require('express');
const { exec } = require('child_process');
const path = require('path');
const app = express();
const PORT = 3000;

app.use(express.json());
app.get('/', (req, res) => res.sendFile(path.join(__dirname, 'index.html')));

app.post('/create-server', (req, res) => {
    const r = req.body;
    const online = r.onlineMode === "true" ? "TRUE" : "FALSE";
    const cmd = `docker run -d --name ${r.name || "ApexPixel"} -p ${r.port || "25565"}:25565 -e EULA=TRUE -e ONLINE_MODE=${online} -e TYPE=${r.type || "PAPER"} -e VERSION=${r.version || "LATEST"} -e MEMORY=${r.ram || "4G"} -e SILENT_RCON=true --restart always itzg/minecraft-server`;

    exec(cmd, (err) => {
        if (err) {
            exec关键 (`docker start ${req.body.name || "ApexPixel"}`);
        }
        res.json({ success: true });
    });
});

app.post('/stop-server', (req, res) => {
    exec(`docker stop ${req.body.name || "ApexPixel"}`, () => res.json({ success: true }));
});

app.get('/get-logs', (req, res) => {
    exec(`docker logs --tail 30 ${req.query.name || "ApexPixel"}`, (err, stdout) => {
        res.json({ logs: err ? "Aether Host Core offline..." : stdout });
    });
});

app.post('/send-command', (req, res) => {
    exec(`docker exec ${req.body.name || "ApexPixel"} rcon-cli ${req.body.cmd}`, (err, stdout) => {
        res.json({ reply: err ? "Server offline." : stdout });
    });
});

app.get('/list-players', (req, res) => {
    exec(`docker exec ${req.query.name || "ApexPixel"} rcon-cli list`, (err, stdout) => {
        if (err) return res.json({ online: 0, max: 20, list: [] });
        const m = stdout.match(/There are (\d+) of a max (\d+) players online: (.*)/);
        if (m) return res.json({ online: parseInt(m[1]), max: parseInt(m[2]), list: m[3].split(', ').filter(Boolean) });
        res.json({ online: 0, max: 20, list: [] });
    });
});

app.listen(PORT, () => console.log(`Aether Node Engine Active on Port ${PORT}`));
