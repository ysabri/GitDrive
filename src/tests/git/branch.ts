import {expect} from "chai";
import {createBaranch, renameBranch } from "git-drive/git/branch";
import {git} from "git-drive/git/core-git";
import {getBranches} from "git-drive/git/for-each-ref";
import { Repository } from "models/git/repository";
import {join} from "path";
// import { Commit } from "../../src/model/commit";

describe("Testing the branch command", () => {


    it("Creates a branch", () => {
        const commitSHA = "253f546bc4f6398bb218d425e2f862df5aa65be4";
        const twoBranchesPath = join(__dirname, "../testRepos/twoBranches/");
        const twoBranchesRepo = new Repository(twoBranchesPath, ["Yazeed Sabri"]);
        // const commit = new Commit(commitSHA,)
    });
});


