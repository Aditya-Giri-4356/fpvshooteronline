import { Client } from '@colyseus/sdk';

const client = new Client('wss://fpvshooteronline.onrender.com');

async function run() {
  try {
    console.log("Connecting...");
    const room = await client.create('game_room', {
      roomCode: 'TEST',
      playerName: 'Bot',
      isHost: true,
    });
    console.log("Joined successfully!", room.sessionId);
    process.exit(0);
  } catch (e) {
    console.error("Failed to connect:");
    console.error(e);
    process.exit(1);
  }
}
run();
