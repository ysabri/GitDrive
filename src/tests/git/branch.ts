import {expect} from "chai";
import {join} from "path";
import {createBaranch, renameBranch } from "../../git-drive/git/branch";
import {git} from "../../git-drive/git/core-git";
import {getBranches} from "../../git-drive/git/for-each-ref";
import { Repository } from "../../model/git/repository";
// import { Commit } from "../../src/model/commit";

describe("Testing the branch command", () => {


    it("Creates a branch", () => {
        const commitSHA = "253f546bc4f6398bb218d425e2f862df5aa65be4";
        const twoBranchesPath = join(__dirname, "../testRepos/twoBranches/");
        const twoBranchesRepo = new Repository(twoBranchesPath);
        // const commit = new Commit(commitSHA,)
    });
});


