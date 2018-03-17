/**
 * TODO: Add test for large amount of branches
 * TODO: Add test for recognizing remote branch namespace
 */
import {expect} from "chai";
import {getBranches} from "git-drive/git/for-each-ref";
import {Branch} from "models/git/branch";
import {Repository} from "models/git/repository";
import * as Path from "path";

// this method is from mocha, it fine to call without importing cause
// mocha is in the global namespace, so is node for example.
describe("Testing the for-each-ref command", () => {
    let twoBranchesRepo: Repository;
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
        // this is an incomplete namespace, it should have refs
        branches = await getBranches(twoBranchesRepo, "heads");
        expect(branches).to.have.lengthOf(0);
    });
    it("matches branch namespace and name", async () => {
        const branches = await getBranches(twoBranchesRepo, "refs/heads/one");
        expect(branches).to.have.lengthOf(1);
        expect(branches[0].name).to.equal("one");
    });
});


