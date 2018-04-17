import { expect } from "chai";
import { outputFile, remove } from "fs-extra";
import { join } from "path";
import { changeWS } from "../../controller/state-updater";
import { createTopicSpace } from "../../git-drive/app/add-topicspace";
import { createWorkSpace } from "../../git-drive/app/add-workspace";
import { loadGRepo } from "../../git-drive/app/load-repo";
import { startRepo } from "../../git-drive/app/start";
import { sync } from "../../git-drive/app/sync";
import { checkoutBranch, getChangedFiles, getCommit, getStatus } from "../../git-drive/git";
import { GRepository } from "../../model/app/g-repository";
import { User } from "../../model/app/user";
import { readRepoInfo } from "../../util/metafile";
import { errMsgMatch, removeRepo } from "../helpers";

describe(("Testing overall app commands"), () => {
    let repoWithFilesPath: string;
    const users: User[] = [];
    let newRepo: GRepository;
    before(() => {
        repoWithFilesPath = join(__dirname, "../testRepos/repo-with-files");
        let i: number = 1;
        while (i < 8) {
            users.push(new User(`User${i}`, `user${i}@users.com`, []));
            i++;
        }
    });
    it("Creates a repo with one topicspace and three workspaces", async () => {
        newRepo = await startRepo(repoWithFilesPath, users.slice(0, 3));
        // just testing and verifying whatever I can
        await verifyRepo(newRepo, 3);
        // since we know branch "GG" is already checked-out
        const metaRepo = await readRepoInfo(newRepo);
        await verifyRepo(metaRepo, 3);
    });
    it("Syncs on User1's workspace", async () => {
        // getting things ready to test sync
        await checkoutBranch(newRepo, newRepo.topicSpaces[0].workSpaces[0]);
        await outputFile(join(repoWithFilesPath, "sync.txt"), "Dummy test file");

        const WS = await sync(newRepo, newRepo.topicSpaces[0].workSpaces[0],
            newRepo.users[0], "Testing sync out", "No need");
        // make sure we added the commit
        expect(WS.commits.length).to.equal(2);
        const WStip = await getCommit(newRepo, WS.name);
        // make sure we update the tip
        expect(WS.tip.SHA).to.equal(WStip.SHA);
        // make sure we got the ordering right
        expect(WS.commits[0].SHA.slice(0, 10)).to.equal(WS.firstCommit);
        // make sure the files got committed
        const filesChanged = await getChangedFiles(newRepo, WS.tip.SHA);
        // two files, repo.proto and sync.txt
        expect(filesChanged.length).to.equal(2);
        expect(filesChanged[0].path).to.equal("repo.proto");
        expect(filesChanged[1].path).to.equal("sync.txt");
        newRepo = await changeWS(newRepo, newRepo.topicSpaces[0], WS);
    });
    it("Sync errors out correctly", async () => {
        // wrong branch checked before performing sync
        expect( await errMsgMatch(`The current checked-out branch is not the one`, () =>
        sync(newRepo, newRepo.topicSpaces[0].workSpaces[1],
            newRepo.users[1], "Doesn't matter", ""),
        )).to.not.equal(null);
        // wrong user given for the workspace
        expect( await errMsgMatch(`Based on the tip commit, user:`, () =>
            sync(newRepo, newRepo.topicSpaces[0].workSpaces[0],
                newRepo.topicSpaces[0].users[1], "Doesn't matter", ""),
        )).to.not.equal(null);

    });
    it("Adds a new workspace to the existing topicspace", async () => {
        const addWS = await createWorkSpace(newRepo, users[3],
            newRepo.topicSpaces[0], newRepo.topicSpaces[0].workSpaces[0]);
        // set the updated repo
        newRepo = addWS[0];
        // check a bunch of things
        expect(newRepo.topicSpaces[0].workSpaces.length).to.equal(4);
        expect(newRepo.topicSpaces[0].workSpaces[3].tip.committer.name).to.equal(
            users[3].name,
        );
        expect(newRepo.topicSpaces[0].workSpaces[3].tip.committer.name).to.equal(
            newRepo.topicSpaces[0].users[3].name,
        );
        expect(newRepo.topicSpaces[0].workSpaces[3].originCommit).to.equal(
            newRepo.topicSpaces[0].workSpaces[0].tip.SHA,
        );
        // since again we know that the "GG" branch is checked-out already
        const metaRepo = await readRepoInfo(newRepo);
        await verifyRepo(metaRepo, 4);
    });
    it("Create workspace errors out correctly", async () => {
        // duplicate users
        expect( await errMsgMatch(`exists already in topicSpace:`, () =>
            createWorkSpace(newRepo, users[0], newRepo.topicSpaces[0],
                newRepo.topicSpaces[0].workSpaces[0]),
        )).to.not.equal(null);
    });
    it("Adds a new topicspace to the existing repo", async () => {
        const newTS = await createTopicSpace(newRepo, users.slice(4, 7),
            newRepo.topicSpaces[0].workSpaces[0].tip, "Bug Fix");
        newRepo = newTS[0];
        await verifyTwoTSRepo(newRepo);
        const metaRepo = await readRepoInfo(newRepo);
        await verifyTwoTSRepo(metaRepo);

    });
    it("Create topicspace erros out correctly", async () => {
        expect( await errMsgMatch(`The topicspace name: (.+) exists already in repo: `, () =>
            createTopicSpace(newRepo, users.slice(4, 7),
            newRepo.topicSpaces[0].workSpaces[0].tip, "Bug Fix"),
        )).to.not.equal(null);
        const dupUsers: User[] = users.slice(4, 7);
        dupUsers.push(users[6]);
        expect( await errMsgMatch(`Users must have unique names.` +
            ` The array passed has duplicate users`, () =>
            createTopicSpace(newRepo, dupUsers,
                newRepo.topicSpaces[0].workSpaces[0].tip, "Dup Users Test"),
        )).to.not.equal(null);
    });
    it("Loads a repo correctly ", async () => {
        // add two commits on bob's branch to test that load will include them.
        await checkoutBranch(newRepo, newRepo.topicSpaces[1].workSpaces[0]);
        const firstSync = await sync(newRepo, newRepo.topicSpaces[1].workSpaces[0],
            newRepo.topicSpaces[1].users[0], "First test sync on this WS", "");
        newRepo = await changeWS(newRepo, newRepo.topicSpaces[1], firstSync);
        const secondSync = await sync(newRepo, newRepo.topicSpaces[1].workSpaces[0],
            newRepo.topicSpaces[1].users[0], "Second test sync on this WS", "");
        newRepo = await changeWS(newRepo, newRepo.topicSpaces[1], secondSync);

        const loadedRepo = await loadGRepo(repoWithFilesPath);
        // verify the first TS
        expect(loadedRepo.topicSpaces.length).to.equal(2);
        expect(loadedRepo.users.length).to.equal(7);
        expect(loadedRepo.topicSpaces[0].name).to.equal("Main");
        expect(loadedRepo.users[0].name).to.equal("User1");
        expect(loadedRepo.topicSpaces[0].workSpaces.length).to.equal(4);
        expect(loadedRepo.topicSpaces[0].users.length).to.equal(4);
        // we use the second WS for these test since we commit on the first one
        expect(loadedRepo.topicSpaces[0].workSpaces[1].firstCommit).to.equal(
            loadedRepo.topicSpaces[0].workSpaces[1].commits[0].SHA.slice(0, 10),
        );
        expect(loadedRepo.topicSpaces[0].workSpaces[1].tip.SHA.slice(0, 10)).to.equal(
            loadedRepo.topicSpaces[0].workSpaces[1].firstCommit,
        );
        // Make sure the commit in User1's WS was add to the state
        expect(loadedRepo.topicSpaces[0].workSpaces[0].commits.length).to.equal(2);
        // verify the second TS
        expect(loadedRepo.topicSpaces[1].name).to.equal("Bug Fix");
        expect(loadedRepo.users[6].name).to.equal("User7");
        expect(loadedRepo.topicSpaces[1].workSpaces.length).to.equal(3);
        expect(loadedRepo.topicSpaces[1].users.length).to.equal(3);
        expect(loadedRepo.topicSpaces[1].workSpaces[1].firstCommit).to.equal(
            loadedRepo.topicSpaces[1].workSpaces[1].commits[0].SHA.slice(0, 10),
        );
        expect(loadedRepo.topicSpaces[1].workSpaces[1].tip.SHA.slice(0, 10)).to.equal(
            loadedRepo.topicSpaces[1].workSpaces[1].firstCommit,
        );
        // verify that commits on User5's WS were added to the state
        expect(loadedRepo.topicSpaces[1].workSpaces[0].commits.length).to.equal(3);
        // verify that the tip matches reality
        const status = await getCommit(loadedRepo,
            loadedRepo.topicSpaces[1].workSpaces[0].tip.SHA);
        expect(loadedRepo.topicSpaces[1].workSpaces[0].tip.SHA).to.equal(
            status.SHA,
        );
    });
    it("Load repo errors out correctly", async () => {
        expect( await errMsgMatch(`path: (.+) does not exist`, () =>
            loadGRepo("wrong/path"),
        )).to.not.equal(null);
        expect( await errMsgMatch(`path: (.+) is not a repo`, () =>
            loadGRepo(join(repoWithFilesPath, "../")),
        )).to.not.equal(null);
    });
    it("Start Repo errors out correctly", async () => {
        // path doesn't exist
        expect( await errMsgMatch(`The path doesn't exist:`, () =>
            startRepo("wrong/path/", users),
        )).to.not.equal(null);
        // repo already exists
        expect( await errMsgMatch(`already has a git repo`, () =>
            startRepo(repoWithFilesPath, users.slice(0, 3)),
        )).not.to.equal(null);
        // duplicate user
        const dupUser = users.slice(0, 3);
        dupUser.push(users[0]);
        await removeRepo(repoWithFilesPath);
        expect( await errMsgMatch(`Users must have unique names.` +
            ` The array passed has duplicate users`, () =>
            startRepo(repoWithFilesPath, dupUser),
        )).not.to.equal(null);
    });
    after(async () => {
        await removeRepo(repoWithFilesPath);
    });
});

async function verifyTwoTSRepo(
    repo: GRepository,
): Promise<void> {
    expect(repo.topicSpaces.length).to.equal(2);
    expect(repo.users.length).to.equal(7);
    expect(repo.topicSpaces[1].name).to.equal("Bug Fix");
    expect(repo.users[6].name).to.equal("User7");
    expect(repo.topicSpaces[1].workSpaces.length).to.equal(3);
    expect(repo.topicSpaces[1].users.length).to.equal(3);
    expect(repo.topicSpaces[1].workSpaces[1].firstCommit).to.equal(
        repo.topicSpaces[1].workSpaces[1].commits[0].SHA.slice(0, 10),
    );
    expect(repo.topicSpaces[1].workSpaces[1].tip.SHA.slice(0, 10)).to.equal(
        repo.topicSpaces[1].workSpaces[1].firstCommit,
    );
}

/** verify the a repo with one topicspace and three workspaces */
async function verifyRepo(
    repo: GRepository,
    wsLength: number,
): Promise<void> {
    expect(repo.topicSpaces.length).to.equal(1);
    expect(repo.users.length).to.equal(wsLength);
    expect(repo.topicSpaces[0].name).to.equal("Main");
    expect(repo.users[0].name).to.equal("User1");
    expect(repo.topicSpaces[0].workSpaces.length).to.equal(wsLength);
    expect(repo.topicSpaces[0].users.length).to.equal(wsLength);
    // we use the second WS for these test since we commit on the first one
    expect(repo.topicSpaces[0].workSpaces[1].firstCommit).to.equal(
        repo.topicSpaces[0].workSpaces[1].commits[0].SHA.slice(0, 10),
    );
    expect(repo.topicSpaces[0].workSpaces[1].tip.SHA.slice(0, 10)).to.equal(
        repo.topicSpaces[0].workSpaces[1].firstCommit,
    );
}

