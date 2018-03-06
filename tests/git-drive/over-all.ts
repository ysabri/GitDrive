import {expect} from "chai";
import {unlinkSync, writeFileSync} from "fs";
import {join} from "path";
import {createBaranch, renameBranch } from "../../src/git-drive/branch";
import {checkoutBranch} from "../../src/git-drive/checkout";
import {commit} from "../../src/git-drive/commit";
import {git} from "../../src/git-drive/core-git";
import {getBranches} from "../../src/git-drive/for-each-ref";
import {getChangedFiles, getCommit, getCommits} from "../../src/git-drive/log";
import {reset, ResetMode} from "../../src/git-drive/reset";
import {getStatus, IStatusResult} from "../../src/git-drive/status";
import {Branch} from "../../src/model/branch";
import {Commit} from "../../src/model/commit";
import {Repository} from "../../src/model/repository";
import {AppFileStatus} from "../../src/model/status";

describe("Testing overall commands", () => {
    let repo;
    let twoBranchesPath;
    before (() => {
        twoBranchesPath = join(__dirname, "../testRepos/twoBranches/");
        repo = new Repository(twoBranchesPath, ["Yazeed Sabri"]);
    });

    it("status returns the right branch and no changes", async () => {
        const statusRes = await getStatus(repo);

        expect(statusRes.currentBranch).to.equal("two");
        expect(statusRes.currentTip).to.equal("253f546bc4f6398bb218d425e2f862df5aa65be4");
        expect(statusRes.currentUpstreamBranch).to.equal(undefined);
        expect(statusRes.workingDirectory.files.length).to.equal(0);

    });

    it("status reflects changes correctly", async () => {
        writeFileSync(join(repo.path, "testing.txt"), "Testing 1 2 3");

        const statusRes = await getStatus(repo);
        const files = statusRes.workingDirectory.files;
        expect(files.length).to.equal(1);

        const file = files[0];
        expect(file.path).to.equal("testing.txt");
        expect(file.status).to.equal(AppFileStatus.New);

        unlinkSync(join(repo.path, "testing.txt"));
    });

    it("checks out the correct branch", async () => {
        const commits = await getCommits(repo, "HEAD", 1);
        const commitObj = commits[0];
        expect(commitObj.SHA).to.equal("253f546bc4f6398bb218d425e2f862df5aa65be4");
        expect(commitObj.title).to.equal("First commit");
        expect(commitObj.body).to.equal("");
        expect(commitObj.parentSHA).to.equal("");
        expect(commitObj.committer.name).equal("Yazeed Sabri");
        let identity = await commitObj.identity("253f546bc4f6398bb218d425e2f862df5aa65be4");
        expect(identity).to.equal(true);
        identity = await commitObj.identity("353f546bc4f6398bb218d425e2f862df5aa65be4");
        expect(identity).to.equal(false);

        const oneBranch = new Branch("one", null, commitObj);
        await checkoutBranch(repo, oneBranch);
        const statusRes = await getStatus(repo);
        expect(statusRes.currentBranch).to.equal("one");

        const twoBranch = new Branch("two", null, commitObj);
        await checkoutBranch(repo, twoBranch);
    });

    it("Makes a commit and mix resets it", async () => {
        writeFileSync(join(repo.path, "sndCommit.txt"), "Testing second commit");
        const commitWorked = await commit(repo, "Second commit", "This is a message");
        expect(commitWorked).to.equal(true);
        const commitObj = await getCommit(repo, "two");
        expect(commitObj.committer.name).to.equal("Yazeed Sabri");
        expect(commitObj.title).to.equal("Second commit");
        expect(commitObj.body).to.equal("This is a message\n");
        expect(commitObj.parentSHA).to.equal("253f546bc4f6398bb218d425e2f862df5aa65be4");

        const files = await getChangedFiles(repo, commitObj.SHA);
        let file = files[0];
        expect(file.path).to.equal("sndCommit.txt");
        expect(file.status).to.equal(AppFileStatus.New);
        expect(file.commitish).to.equal(commitObj.SHA);

        const resetWorked = await reset(repo, commitObj.parentSHA, ResetMode.Soft);
        // ie. did not throw an error
        expect(resetWorked).to.equal(true);
        const statusRes = await getStatus(repo);
        const mixedResetFiles = statusRes.workingDirectory.files;
        expect(mixedResetFiles).to.have.lengthOf(1);
        file = files[0];
        expect(file.status).to.equal(AppFileStatus.New);

    });
});
