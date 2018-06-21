import { outputFile } from "fs-extra";
import { join, normalize } from "path";
import { createTopicSpace } from "../git-drive/app/add-topicspace";
import { createWorkSpace } from "../git-drive/app/add-workspace";
import { download } from "../git-drive/app/download";
import { loadGRepo } from "../git-drive/app/load-repo";
import { startRepo } from "../git-drive/app/start";
import { sync } from "../git-drive/app/sync";
import { changeWS, removeWS } from "../git-drive/controller/state-updater";
import { commit, deleteBranch } from "../git-drive/git";
import { checkoutBranch } from "../git-drive/git/checkout";
import { GRepository, User } from "../model/app";
import { Account } from "../model/app/github-account";
import {
  EnclosedVariant,
  IPublicVariant,
  PublicVariant,
  Variant,
} from "../model/POST";
// import { removeRepo } from "../tests/helpers";
import { writeRepoInfo } from "../util";
import { measure } from "../util/git-perf";
import {
  API,
  AuthorizationResponseKind,
  createAuthorization,
  fetchUser,
  IAPICommit,
  IAPIRefStatus,
  IAPIRepository,
  IAPIUser,
} from "../util/github-api";
/**
 * An example to show authentication and Github related commands. "github-api"
 * file still has way more methods to show, I picked the important ones for us.
 * This has to be run from the renderer process, since uuid in createAuthorization
 * relies on the window object to be there.
 */
export async function letsOauth(): Promise<void> {
  const username = "GitDriveTestUser";
  const password = "Gitdriveisawesome";
  // const email = "hacoor2@hotmail.com";
  const endPoint = "https://api.github.com";
  const repoName = "TestRepo";
  const res = await createAuthorization(endPoint,
    username, password, null);
  // tslint:disable-next-line:no-console
  console.log(res);
  let user: Account;
  let api: API;
  if (res.kind === AuthorizationResponseKind.Authorized) {
    user = await fetchUser(endPoint, res.token);
    // tslint:disable-next-line:no-console
    console.log(user);
    api = new API(endPoint, res.token);
  } else {
    throw new Error("User didn't get authorized");
  }
  const repo: IAPIRepository | null  = await api.fetchRepository(username, repoName);
  if (repo === null) {
    throw new Error("failed to fetch TestRepo");
  }
  // tslint:disable-next-line:no-console
  console.log(repo);
  const account: IAPIUser = await api.fetchAccount();
  // tslint:disable-next-line:no-console
  console.log(account);
  const refMaster: IAPIRefStatus = await api.fetchCombinedRefStatus(username,
    repo.name, "master");
  // tslint:disable-next-line:no-console
  console.log(refMaster);
  const firstCommit: IAPICommit | null  = await api.fetchCommit(username,
    repoName, "cc4790cbfa99c9e9ce72d6198990b4830eee9b57");
  // tslint:disable-next-line:no-console
  console.log(firstCommit);
  const pollInterval: number | null = await api.getFetchPollInterval(username, repoName);
  // tslint:disable-next-line:no-console
  console.log(pollInterval);

  return;
}

// show an example to start repo with three users, then create a new workspace,
// then create a new topicspace with three more users, write and retrieve the
// repo from disk. We commit three times, one in the Main topicspace, the rest
// in the new topicspace. We do that to make sure the final load gets the most
// recent state out to the user.
export async function startEx(): Promise<void> {
  const users: User[] = [];
  users.push(new User("Yazeed Sabri", "ysabri@wisc.edu", []));
  users.push(new User("LL", "LL@wisc.edu", []));
  users.push(new User("GWiz", "GWiz@wisc.edu", []));
  let repo: GRepository;
  try {
    repo = await measure("Start Repo",
      () => startRepo(normalize("C:\\Users\\hacoo\\Desktop\\repo-with-files"), users));

    // tslint:disable-next-line:no-console
    console.log(repo.id());
  } catch (err) {
    // tslint:disable-next-line:no-console
    console.log("The startRepo promise got rejected with: " + err);
    return undefined;
  }
  await outputFile(join(repo.path, "sync.txt"), "testFile");
  // notice how the same indexes map to the user to their workspace
  let topicSpace = repo.topicSpaces[0];
  let user = topicSpace.users[0];
  let workSpace = topicSpace.workSpaces[0];
  // should use getVal but I know the branch exists for a fact
  // const branch = user.workSpaces[workSpace.name];
  // checkout the branch we want to commit at
  await checkoutBranch(repo, workSpace);

  const newWS = await measure("sync",
    () => sync(repo, workSpace, user, "First Sync Commit", "Yay this worked" ));
  // Add the change to a new repo object
  const newRepo = await changeWS(repo, topicSpace, newWS);
  // tslint:disable-next-line:no-console
  console.log(newRepo.id());
  topicSpace = newRepo.topicSpaces[0];
  user = topicSpace.users[0];
  workSpace = topicSpace.workSpaces[0];
  const fourthUser = new User("cool guy", "coolGuy@newGuy.com", []);
  const fourthWS = await measure("Create WorkSpace",
      () => createWorkSpace(newRepo, fourthUser, topicSpace, workSpace));
  // add the change to a new repo obj
  // tslint:disable-next-line:no-console
  console.log(fourthWS.repo.id());
  const fifthUser = new User("bob benson", "benson@bob.com", []);
  const sixthUser = new User("jack sparrow", "sparrow@jack.com", []);
  const seventhUser = new User("hp", "hp@hp.hp", []);
  try {
    const newTS = await measure("Create TS", () => createTopicSpace(fourthWS.repo,
    [fifthUser, sixthUser, seventhUser], fourthWS.repo.topicSpaces[0].workSpaces[0].tip, "Bug Fix"));
    // tslint:disable-next-line:no-console
    console.log(newTS.repo.id());

    // checkout bob's branch, we know he is the first user in the TS we just created
    await checkoutBranch(newTS.repo, newTS.topicspace.workSpaces[0]);

    const afterSync = await measure("Running sync on bob benson's WS", () =>
      sync(newTS.repo, newTS.topicspace.workSpaces[0], fifthUser,
        "First commit on Bob benson's branch", "hopefully this doesn't show"));
    const syncRepo = await changeWS(newTS.repo, newTS.topicspace, afterSync);
    // notice how we call changeWS after each one, it is not done for us in sync
    // because sync has no knowledge of the TS it is operating in.
    const lastSync = await measure("Another sync on bob's branch", () =>
      sync(syncRepo, afterSync , fifthUser, "Second sync on bob's", ""));
    const secondSyncRepo = await changeWS(syncRepo, newTS.topicspace, lastSync);

    // tslint:disable-next-line:no-console
    console.log(secondSyncRepo.id());
    // load the repo we just created, the printout from the console log after should
    // match the one prior
    const repoReadout = await measure("loading a Repo", () => loadGRepo(newTS.repo.path));
    // tslint:disable-next-line:no-console
    console.log(repoReadout.id());
  } catch (err) {
    if (err) {
      // tslint:disable-next-line:no-console
      console.log(err);
    }
  }
  // await removeRepo(normalize("C:\\Users\\hacoo\\Desktop\\repo-with-files"));
}

export async function cloneSecondRepo(): Promise<void> {
  const path = await normalize("C:\\Users\\hacoo\\Desktop\\second-repo-with-files");
  await download(path, "https://github.com/ysabri/repo-with-files.git");
}

export async function removeWSfromSecondRepo(): Promise<void> {
  const path = await normalize("C:\\Users\\hacoo\\Desktop\\repo-with-files");
  const repo: GRepository = await loadGRepo(path);
  await createWorkSpace(repo, new User("added user", "addemail@FromBob.com", []),
    repo.topicSpaces[1], repo.topicSpaces[1].workSpaces[0]);

  const secondPath = await normalize("C:\\Users\\hacoo\\Desktop\\second-repo-with-files");
  const secondRepo = await loadGRepo(secondPath);
  const newRepo = await removeWS(secondRepo, secondRepo.topicSpaces[1],
    secondRepo.topicSpaces[1].workSpaces[0]);
  await deleteBranch(newRepo, newRepo.topicSpaces[1].workSpaces[0]);
  await checkoutBranch(newRepo, newRepo.metaBranch);
  await writeRepoInfo(newRepo);
  await commit(newRepo, "Meta-User", "NA", "Meta Commit", "");
  // tslint:disable-next-line:no-console
  console.log(newRepo.id());
}

// Show an example of how to use the Variant types
export async function variant() {
    const x: IPublicVariant = {stability: PublicVariant.MockupModel, type: "Public"};
    const y: Variant = {stability: EnclosedVariant.InternalVariant, type: "Enclosed"};
    testing(x);
    testing(y);

    function testing(generalType: Variant): void {
      if (generalType.type === "Public") {
        // tslint:disable-next-line:no-console
        console.log("Public was passed");
      } else {
        // tslint:disable-next-line:no-console
        console.log("Private was passed");
      }
    }
}

// // show an example of the key value pair and using getVal
// export async function keyValPair() {
//     const workObj: IWorkspaceBranch = {};
//     // another form would be workObj["exist"] or in reality workObj[WorkSpace.name]
//     workObj.exist = new Branch("sdfj", "sdafsad", new Commit("sfa", "sdfa", "sdfa",
//     new CommitterID("sadf", "dsfa", new Date()), "dfsF", []));
//     const exist = getVal(workObj, "exist");
//     const dnd = getVal(workObj, "dnd");
//     if (!exist) {
//       // tslint:disable-next-line:no-console
//       console.log("exist is undefined");
//     }
//     if (!dnd) {
//       // tslint:disable-next-line:no-console
//       console.log("dnd dnd");
//     }

// }
