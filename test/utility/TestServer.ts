import { Server } from 'http';
import { StartServer, StopServer } from '../../src/server_manager';

export class TestServer {

  private static _server: Server|undefined;

  public static async Start() {    
    if (process.env.START_HOST) {
      TestServer._server = await StartServer();
    }
  }

  public static async Stop() {
    await StopServer(TestServer._server);
  }

}