export class HeartBeatManager {
  constructor(
    game,
    webSocket,
    checkMilliseconds = 3000,
    timeoutMilliseconds = 30000
  ) {
    this.game = game;
    this.webSocket = webSocket;
    this.checkMilliseconds = checkMilliseconds;
    this.timeoutMilliseconds = timeoutMilliseconds;
    this.heartBeatLastReceivedTime = new Date().getTime();

    this.checkIntervalID = setInterval(
      () => this.heartBeatCheck(),
      checkMilliseconds
    );

    this.webSocket.addEventListener("message", (event) => {
      try {
        let message = JSON.parse(event.data);
        if (message["type"] === "PING") {
          this.heartBeatReceived();
        }
      } catch (e) {}
    });

    this.webSocket.addEventListener("close", (event) =>
      clearInterval(this.checkIntervalID)
    );
  }

  heartBeatReceived() {
    console.log(`Heartbeat received`);
    this.heartBeatLastReceivedTime = new Date().getTime();
    // this.game.markPlayerAlive();
  }

  heartBeatCheck() {
    let now = new Date().getTime();
    if (now - this.heartBeatLastReceivedTime > this.timeoutMilliseconds) {
      // this.game.markPlayerDead();
      console.log(`${this.webSocket} is dead`);
    }
  }
}
