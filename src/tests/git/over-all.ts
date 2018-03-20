import {expect} from "chai";
import {unlinkSync, writeFileSync} from "fs";
import {join} from "path";
import {createBaranch, renameBranch } from "../../git-drive/git/branch";
import {checkoutBranch} from "../../git-drive/git/checkout";
import {commit} from "../../git-drive/git/commit";
import {git} from "../../git-drive/git/core-git";
import {getCommitDiff, getWorkingDirectoryDiff} from "../../git-drive/git/diff";
import {getIndexChanges, IndexStatus} from "../../git-drive/git/diff-index";
import {getBranches} from "../../git-drive/git/for-each-ref";
import {getChangedFiles, getCommit, getCommits} from "../../git-drive/git/log";
import {reset, ResetMode} from "../../git-drive/git/reset";
import {getStatus, IStatusResult} from "../../git-drive/git/status";
import {Branch} from "../../model/git/branch";
import {Commit} from "../../model/git/commit";
import {DiffType} from "../../model/git/diff";
import {Repository} from "../../model/git/repository";
import {AppFileStatus} from "../../model/git/status";
import {DiffParser} from "../../util/diff-parser";

describe("Testing overall commands", () => {
    let repo: Repository;
    let twoBranchesPath;
    const parser = new DiffParser();
    before (() => {
        twoBranchesPath = join(__dirname, "../testRepos/twoBranches/");
        repo = new Repository(twoBranchesPath);
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
        const commitWorked = await commit(repo, "Yazeed Sabri",
                                    "sabri.yazeed@gmail.com",
                                    "Second commit",
                                    "This is a message");
        expect(commitWorked).to.equal(true);
        const commitObj = await getCommit(repo, "two");
        expect(commitObj!.committer.name).to.equal("Yazeed Sabri");
        expect(commitObj!.title).to.equal("Second commit");
        expect(commitObj!.body).to.equal("This is a message\n");
        expect(commitObj!.parentSHA).to.equal("253f546bc4f6398bb218d425e2f862df5aa65be4");

        // test the getChangedFiles from log for the new commit we made
        const files = await getChangedFiles(repo, commitObj!.SHA);
        const file = files[0];
        expect(file.path).to.equal("sndCommit.txt");
        expect(file.status).to.equal(AppFileStatus.New);
        expect(file.commitish).to.equal(commitObj!.SHA);

        // test soft reset along with getWorkingDirectoryDiff from diff
        // and getIndexChanges from diff-index
        const resetWorked = await reset(repo, commitObj!.parentSHA, ResetMode.Soft);
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
            expect(parser.parse(normalDiff.text).contents).to.equal("");
            expect(normalDiff.hunks[0].lines[1].text).to.equal("+Testing second commit");
        }
        // testing the diff-index command
        const indexDiff = await getIndexChanges(repo);
        expect(indexDiff.get("sndCommit.txt")).to.equal(IndexStatus.Added);

        // test mixed reset (default) along with the diff commands
        const resetMixed = await reset(repo, commitObj!.parentSHA, ResetMode.Mixed);
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

    it("Cteates new branches and renames them", async () => {
        const branch = await createBaranch(repo, "three", "HEAD");
        expect(branch!.name).to.equal("three");
        const refs = await getBranches(repo);
        expect(refs).to.have.lengthOf(3);
        const filterRes: Branch | undefined = refs.find((br) => br.name === "three");
        const statusRes = await getStatus(repo);
        expect(filterRes!.tip.SHA).to.equal(statusRes.currentTip);
        expect(statusRes.currentTip).to.equal(branch!.tip.SHA);
        await git(["branch", "-d", "three"], repo.path);
        // cool guy test over here: So this tests a promise that is expected to
        // throw and exists gracefully. Took some tinkering but it works as
        // expected, meaning that if the promise does not throw the test fails.
        let caught: boolean = true;
        try {
            await renameBranch(repo, branch!, "threee");
        } catch {
            caught = false;
        }
        expect(caught).to.equal(false);

    });

    it("gets a diff from a commit", async () => {
        const files = await getChangedFiles(repo, "253f546bc4f6398bb218d425e2f862df5aa65be4");
        const commitDiff = await getCommitDiff(repo, files[0], "253f546bc4f6398bb218d425e2f862df5aa65be4");
        if (commitDiff.kind === DiffType.Text) {
            const parsed = parser.parse(commitDiff.text);
            expect(parsed.header.split("\n")[1].substr(1)).to.equal("dummy file for first commit");

        }
    });
});
