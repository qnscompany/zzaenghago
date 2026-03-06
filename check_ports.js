const net = require('net');

const host = 'ivoylfnuwnmwkpytmqxa.supabase.co';
const ports = [5432, 6543, 80, 443, 8080];

async function checkPort(port) {
    return new Promise((resolve) => {
        const socket = new net.Socket();
        socket.setTimeout(3000);
        socket.on('connect', () => {
            console.log(`Port ${port} is OPEN on ${host}`);
            socket.destroy();
            resolve(true);
        });
        socket.on('timeout', () => {
            console.log(`Port ${port} is CLOSED (timeout) on ${host}`);
            socket.destroy();
            resolve(false);
        });
        socket.on('error', (err) => {
            console.log(`Port ${port} is CLOSED (${err.message}) on ${host}`);
            resolve(false);
        });
        socket.connect(port, host);
    });
}

async function run() {
    for (const port of ports) {
        await checkPort(port);
    }
}

run();
