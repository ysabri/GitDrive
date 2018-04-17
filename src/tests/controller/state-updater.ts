import { expect } from "chai";
import { join } from "path";
import * as stateUpdater from "../../controller/state-updater";
import { createTopicSpace } from "../../git-drive/app/add-topicspace";
import { createWorkSpace } from "../../git-drive/app/add-workspace";
import { startRepo } from "../../git-drive/app/start";
import { GRepository } from "../../model/app/g-repository";
import { User } from "../../model/app/user";


describe("Mutate the state correctly", async () => {
    let repo: GRepository;
    const users: User[] = [];
    before(async () => {
        let i = 0;
        while (i < 8) {
            users.push(new User(`User${i}`, `user${i}@users.com`, []));
            i++;
        }
        repo = await startRepo(join(__dirname, "../testRepos/repo-with-files"),
            users.slice(0, 3));

        const newWS = await createWorkSpace(repo, users[3], repo.topicSpaces[0],
            repo.topicSpaces[0].workSpaces[0]);
        repo = newWS[0];

        const newTS = await createTopicSpace(repo, users.slice(4, 7),
            repo.topicSpaces[0].workSpaces[0].tip, "Bug Fix");
        repo = newTS[0];

    });
    it("");
});
