
import { StartServer, StopServer } from "server_manager";
import { Log } from "utility/logging/Log";
import { DB } from "utility/ORM/DB";

StartServer().then(
  (server) => {
    
    const shutdown = async () => {
      Log("Stopping server...");
      await StopServer(server);
      Log("Closing DB connections...");
      await DB.Close();
      Log("Ready to quit.");
    }    

    // For nodemon restarts
    process.once('SIGUSR2', async function () {
      await shutdown();
      process.kill(process.pid, 'SIGUSR2');
    });

    // For app termination
    process.on('SIGINT', async function () {
      await shutdown();
      process.exit(0);
    });

    // For Heroku app termination
    process.on('SIGTERM',  async function () {
      await shutdown();
      process.exit(0);
    });
  }
);