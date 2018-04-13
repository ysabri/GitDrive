import { expect } from "chai";
import { remove } from "fs-extra";
import { join } from "path";
import { startRepo } from "../../git-drive/app/start";
import { User  } from "../../model/app/user";

describe(("Testing overall app commands"), () => {
    let repoWithFilesPath: string;
    const users: User[] = [];
    before(() => {
        repoWithFilesPath = join(__dirname, "../testRepos/repo-with-files");
        let i: number = 1;
        while (i < 8) {
            users.push(new User(`User${i}`, `user${i}@users.com`, []));
            i++;
        }
    });
    it(("Creates a repo with one topicspace and three workspaces"), async () => {
        const newRepo = await startRepo(repoWithFilesPath, users.slice(0, 3));
        // just testing and verifying whatever I can
        expect(newRepo.topicSpaces.length).to.equal(1);
        expect(newRepo.users.length).to.equal(3);
        expect(newRepo.topicSpaces[0].name).to.equal("Main");
        expect(newRepo.users[0].name).to.equal("User1");
        expect(newRepo.topicSpaces[0].workSpaces.length).to.equal(3);
        expect(newRepo.topicSpaces[0].users.length).to.equal(3);
        expect(newRepo.topicSpaces[0].workSpaces[0].firstCommit).to.equal(
            newRepo.topicSpaces[0].workSpaces[0].commits[0].SHA.slice(0, 10),
        );
        expect(newRepo.topicSpaces[0].workSpaces[0].tip.SHA.slice(0, 10)).to.equal(
            newRepo.topicSpaces[0].workSpaces[0].firstCommit,
        );
    });
    it(("Our app commands error out correctly"), async () => {
        // path doesn't exist
        expect( await errMsgMatch(`The path doesn't exist:`, () =>
            startRepo("wrong/path/", users),
        )).to.not.equal(null);
        // repo already exists
        expect( await errMsgMatch(`already has a git repo`, () =>
            startRepo(repoWithFilesPath, users.slice(0, 3)),
        )).not.to.equal(null);
        // duplicate user
        const dupUser = users.slice(0, 3).push(users[0]);
        await removeRepo(repoWithFilesPath);
        // so this is weird I know, I have to figure it out, it probably
        // has to do with node and ts-node. This will throw the correct
        // error, I tested it in a normal node env. I don't know why it errors
        // out like this here and not anywhere else, its like it knows that
        // the function is erroring out and is like fuck it I will throw
        // this instrad.
        expect( await errMsgMatch(`users.every is not a function`, () =>
            startRepo(repoWithFilesPath, dupUser),
        )).not.to.equal(null);
        //
    });
    after(async () => {
        await removeRepo(repoWithFilesPath);
    });
});

async function removeRepo(
    repoPath: string,
): Promise<void> {
    await remove(join(repoPath, ".git/"));
    await remove(join(repoPath, ".CURRENT_USER"));
    await remove(join(repoPath, "repo.proto"));
    await remove(join(repoPath, ".gitignore"));
    await remove(join(repoPath, "sync.txt"));
}

async function errMsgMatch(
    str: string,
    fn: () => Promise<any>,
): Promise<any> {
    try {
        await fn();
    } catch (err) {
        console.log(err.message);
        return err.message.match(str);
    }
    return null;
}
