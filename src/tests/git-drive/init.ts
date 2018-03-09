import * as chai from "chai";
import {accessSync, constants } from "fs";
import init from "git-drive/git/init";
import {join} from "path";

let pathToCreateAt: string;

describe("Testing the init command", () => {
    // initialize the variable before all tests
    before(() => {
        pathToCreateAt = join(__dirname , "../testRepos");
    });
    // check if the tabFS.txt file exists, thus checking that the .git worked.
    it("creates the repo using template dir", async () => {
        // run the init
        await init(pathToCreateAt);
        // wrap the accessSync into a function because that is what the
        // chai.expect methods expects (lol).
        const accessSyncWrapper =  () => {
            // the F_OK constant is to check whether the file is visible to the
            // calling process, i.e it exists, this doesn't say anything about
            // the rwx permissions.
            accessSync(join(pathToCreateAt, ".git/tabFS.txt"),
                constants.F_OK);
        };
        // Not throwing an error means the file exists.
        chai.expect(accessSyncWrapper).to.not.throw();
    });
});
