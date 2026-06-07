import * as net from 'net';

export async function checkPort(port: number, host: string = '127.0.0.1'): Promise<boolean> {
  // Returns true if port is available (connection refused)
  // Returns false if in use (connection successful)
  return new Promise((resolve) => {
    const socket = new net.Socket();
    socket.setTimeout(1000);

    socket.once('connect', () => {
      // Something is listening! So port is NOT free.
      socket.destroy();
      resolve(false);
    });

    socket.once('timeout', () => {
      // Timeout means something might be dropping packets, assume NOT free
      socket.destroy();
      resolve(false);
    });

    socket.once('error', (err: any) => {
      if (err.code === 'ECONNREFUSED') {
        // Nothing is listening, port is FREE!
        resolve(true);
      } else {
        // Some other error, assume not free just to be safe
        resolve(false);
      }
    });

    socket.connect(port, host);
  });
}
