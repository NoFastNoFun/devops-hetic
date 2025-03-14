
import chai, { expect } from 'chai';
import chaiAsPromised from 'chai-as-promised';
import { describe } from 'mocha';
import { RootDB } from '../../utility/RootDB';
import { UserController } from 'controllers/UserController';
import { DB } from 'utility/ORM/DB';

chai.use(chaiAsPromised);

describe("User CRUD", function () {
  
  before(async function() {
    // Vider la base de données de test
    await RootDB.Reset();
  });

  after(async function() {
    // Forcer la fermeture de la base de données
    await DB.Close();
  });

  it("Create a new user", async function () {
    const user = new UserController();
    const result = await user.createUser({
      familyName: "Glass",
      givenName: "Kevin",
      email: "kevin@nguni.fr",
      balance: 0
    });

    expect(result.id).to.equal(1);
  });

  it("Create the same user twice throws an exception", async function () {
    const user = new UserController();

    await expect(user.createUser({
      familyName: "Glass",
      givenName: "Kevin",
      email: "kevin@nguni.fr",
      balance: 0
    })).to.be.rejected;
      
  });

});