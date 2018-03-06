import {expect} from "chai";
import {unlinkSync, writeFileSync} from "fs";
import {join} from "path";
import {createBaranch, renameBranch } from "../../src/git-drive/branch";
import {checkoutBranch} from "../../src/git-drive/checkout";
import {commit} from "../../src/git-drive/commit";
import {git} from "../../src/git-drive/core-git";
import {getWorkingDirectoryDiff} from "../../src/git-drive/diff";
import {getIndexChanges, IndexStatus} from "../../src/git-drive/diff-index";
import {getBranches} from "../../src/git-drive/for-each-ref";
import {getChangedFiles, getCommit, getCommits} from "../../src/git-drive/log";
import {reset, ResetMode} from "../../src/git-drive/reset";
import {getStatus, IStatusResult} from "../../src/git-drive/status";
import {Branch} from "../../src/model/branch";
import {Commit} from "../../src/model/commit";
import {DiffType} from "../../src/model/diff";
import {Repository} from "../../src/model/repository";
import {AppFileStatus} from "../../src/model/status";
import {DiffParser} from "../../src/util/diff-parser";

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
        // delete the file for the next test
        unlinkSync(join(repo.path, "testing.txt"));
    });

    it("checks out the correct branch", async () => {
        // check the current checkout info, basically test getCommits from log
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
        // do the actual checkout test
        const oneBranch = new Branch("one", null, commitObj);
        await checkoutBranch(repo, oneBranch);
        const statusRes = await getStatus(repo);
        expect(statusRes.currentBranch).to.equal("one");
        // re checkout branch two for the next test
        const twoBranch = new Branch("two", null, commitObj);
        await checkoutBranch(repo, twoBranch);
    });

    it("Makes a commit and mix resets it", async () => {
        writeFileSync(join(repo.path, "sndCommit.txt"), "Testing second commit");

        // check if the commit worked assuming that getCommits still works
        const commitWorked = await commit(repo, "Second commit", "This is a message");
        expect(commitWorked).to.equal(true);
        const commitObj = await getCommit(repo, "two");
        expect(commitObj.committer.name).to.equal("Yazeed Sabri");
        expect(commitObj.title).to.equal("Second commit");
        expect(commitObj.body).to.equal("This is a message\n");
        expect(commitObj.parentSHA).to.equal("253f546bc4f6398bb218d425e2f862df5aa65be4");

        // test the getChangedFiles from log for the new commit we made
        const files = await getChangedFiles(repo, commitObj.SHA);
        const file = files[0];
        expect(file.path).to.equal("sndCommit.txt");
        expect(file.status).to.equal(AppFileStatus.New);
        expect(file.commitish).to.equal(commitObj.SHA);

        // test soft reset along with getWorkingDirectoryDiff from diff
        // and getIndexChanges from diff-index
        const resetWorked = await reset(repo, commitObj.parentSHA, ResetMode.Soft);
        // ie. did not throw an error
        expect(resetWorked).to.equal(true);
        const statusRes = await getStatus(repo);
        const softResetFiles = statusRes.workingDirectory.files;
        expect(softResetFiles).to.have.lengthOf(1);
        const resetFile = softResetFiles[0];
        expect(resetFile.status).to.equal(AppFileStatus.New);
        // testing the command from diff
        const normalDiff = await getWorkingDirectoryDiff(repo, resetFile);
        expect(normalDiff.kind).to.equal(DiffType.Text);
        if (normalDiff.kind === DiffType.Text) {
            const parser = new DiffParser();
            expect(parser.parse(normalDiff.text).contents).to.equal("");
            expect(normalDiff.hunks[0].lines[1].text).to.equal("+Testing second commit");
        }
        // testing the diff-index command
        const indexDiff = await getIndexChanges(repo);
        expect(indexDiff.get("sndCommit.txt")).to.equal(IndexStatus.Added);

        // test mixed reset (default) along with the diff commands
        const resetMixed = await reset(repo, commitObj.parentSHA, ResetMode.Mixed);
        // ie. did not throw an error
        expect(resetMixed).to.equal(true);
        const statusMixed = await getStatus(repo);
        const mixedResetFiles = statusMixed.workingDirectory.files;
        expect(mixedResetFiles).to.have.lengthOf(1);
        const mixedResetFile = mixedResetFiles[0];
        expect(mixedResetFile.status).to.equal(AppFileStatus.New);
        const mixedDiff = await getWorkingDirectoryDiff(repo, mixedResetFile);
        expect(mixedDiff.kind).to.equal(DiffType.Text);
        if (mixedDiff.kind === DiffType.Text) {
            const parser = new DiffParser();
            expect(parser.parse(mixedDiff.text).contents).to.equal("");
            expect(mixedDiff.hunks[0].lines[1].text).to.equal("+Testing second commit");
        }
        // testing the diff-index command
        const indexMixDiff = await getIndexChanges(repo);
        expect(indexMixDiff.size).to.equal(0);
        // reset the repo to its original state
        await git(["reset", "--hard", "253f546bc4f639", "--"], repo.path);
        // and delete the file since it is not tracked git actually won't
        // overwrite it.
        unlinkSync(join(repo.path, "sndCommit.txt"));

    });
});
