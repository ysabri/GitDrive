import {expect} from "chai";
import * as Path from "path";
import {getBranches} from "../../src/git-drive/for-each-ref";
import {Branch} from "../../src/model/branch";
import {Repository} from "../../src/model/repository";

// this method is from mocha, it find to call without importing cause
// mocha is in the global namespace, so is node for example.
describe("Testing the for-each-ref command", () => {
    let twoBranchesRepo;
    before(() => {
        twoBranchesRepo = new Repository(Path.join
            (__dirname, "../testRepos/twoBranches/"), ["Yazeed Sabri"]);
    });
    it("returns all branches when given no namespace", async () => {
        const branches = await getBranches(twoBranchesRepo);
        expect(branches).to.have.lengthOf(2);
        expect(branches[0].name).to.equal("one");
        expect(branches[1].name).to.equal("two");
    });
    it("returns no branches for wrong and empty namespaces", async () => {
        let branches = await getBranches(twoBranchesRepo, "");
        expect(branches).to.have.lengthOf(0);
        branches = await getBranches(twoBranchesRepo, "heads");
        // tslint:disable-next-line:no-console
        console.log(branches);
    });
    it("matches branch namespace and name", async () => {
        const branches = await getBranches(twoBranchesRepo, "refs/heads/one");
        expect(branches).to.have.lengthOf(1);
        expect(branches[0].name).to.equal("one");
    });
});


