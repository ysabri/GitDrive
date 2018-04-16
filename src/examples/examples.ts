import { outputFile } from "fs-extra";
import { join, normalize } from "path";
import { changeWS } from "../controller/state-updater";
import { createTopicSpace } from "../git-drive/app/add-topicspace";
import { createWorkSpace } from "../git-drive/app/add-workspace";
import { loadGRepo } from "../git-drive/app/load-repo";
import { startRepo } from "../git-drive/app/start";
import { sync } from "../git-drive/app/sync";
import { checkoutBranch } from "../git-drive/git/checkout";
import { GRepository } from "../model/app/g-repository";
import { User } from "../model/app/user";
import { EnclosedVariant, IPublicVariant, PublicVariant, Variant } from "../model/POST";
import { measure } from "../util/git-perf";


// show an example to start repo, this might pass as a test but not quite,
// the info to check is left for user.
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
  console.log(fourthWS[0].id());
  const fifthUser = new User("bob benson", "benson@bob.com", []);
  const sixthUser = new User("jack sparrow", "sparrow@jack.com", []);
  const seventhUser = new User("hp", "hp@hp.hp", []);
  try {
    const newTS = await measure("Create TS", () => createTopicSpace(fourthWS[0],
    [fifthUser, sixthUser, seventhUser], fourthWS[0].topicSpaces[0].workSpaces[0].tip, "Bug Fix"));
    // tslint:disable-next-line:no-console
    console.log(newTS[0].id());

    // checkout bob's branch, we know he is the first user in the TS we just created
    await checkoutBranch(newTS[0], newTS[1].workSpaces[0]);

    const afterSync = await measure("Running sync on bob benson's WS", () =>
      sync(newTS[0], newTS[1].workSpaces[0], fifthUser,
        "First commit on Bob benson's branch", "hopefully this doesn't show"));
    const syncRepo = await changeWS(newTS[0], newTS[1], afterSync);
    // notice how we call changeWS after each one, it is not done for us in sync
    // because sync has no knowledge of the TS it is operating in.
    const lastSync = await measure("Another sync on bob's branch", () =>
      sync(syncRepo, afterSync , fifthUser, "Second sync on bob's", ""));
    const secondSyncRepo = await changeWS(syncRepo, newTS[1], lastSync);

    // tslint:disable-next-line:no-console
    console.log(secondSyncRepo.id());
    // load the repo we just created, the printout from the console log after should
    // match the one prior
    const repoReadout = await measure("loading a Repo", () => loadGRepo(newTS[0].path));
    // tslint:disable-next-line:no-console
    console.log(repoReadout.id());
  } catch (err) {
    if (err) {
      // tslint:disable-next-line:no-console
      console.log(err);
    }
  }
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
