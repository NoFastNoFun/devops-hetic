import axios from 'axios';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { RootDB } from '../../utility/RootDB';
import { TestServer } from '../../utility/TestServer';
import { DB } from 'utility/ORM/DB';

chai.use(chaiAsPromised);

describe("User CRUD", function () {
  
  before(async function() {
    // Vider la base de données de test
    await RootDB.Reset();
    // Lancer le serveur
    await TestServer.Start();
  });

  after(async function() {
    // Forcer la fermeture de la base de données
    await DB.Close();
    // Arreter le serveur
    await TestServer.Stop();    
  });

  it("Create a new user", async function () {
    const result = await axios.put(process.env.API_HOST + '/user', 
      {
        familyName: "Glass",
        givenName: "Kevin",
        email: "kevin@nguni.fr",
        balance: 0
      }, 
      {
        headers: {
          Authorization: "Bearer INSERT HERE"
        }
      }
    );

    chai.expect(result.status).to.equal(200);
    chai.expect(result.data.id).to.equal(1);    
  });

  it("Create the same user twice returns an error", async function () {

    const response = await axios.put(process.env.API_HOST + '/user', 
      {
        familyName: "Glass",
        givenName: "Kevin",
        email: "kevin@nguni.fr",
        balance: 0
      }, 
      {        
        headers: {
          Authorization: "Bearer INSERT HERE"
        },
        validateStatus: (status) => { return true }
      }
    );

    chai.expect(response.status).to.equal(400);
    chai.expect(response.data.structured).to.equal('sql/failed');
        

  });

 
});