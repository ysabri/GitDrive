import { writeFileSync } from "fs";
import { join, normalize } from "path";
import { addTS, addWS, changeWS } from "../controller/state-updater";
import { createTopicSpace } from "../git-drive/app/add-topicspace";
import { createWorkSpace } from "../git-drive/app/add-workspace";
import { startRepo } from "../git-drive/app/start";
import { sync } from "../git-drive/app/sync";
import { checkoutBranch } from "../git-drive/git/checkout";
import { GRepository } from "../model/app/g-repository";
import { IWorkspaceBranch, User } from "../model/app/user";
import { Branch } from "../model/git/branch";
import { Commit } from "../model/git/commit";
import { CommitterID } from "../model/git/committer-id";
import { EnclosedVariant, IPublicVariant, PublicVariant, Variant } from "../model/POST";
import { measure } from "../util/git-perf";
import { getVal } from "../util/keyVal";

// show an example to start repo, this might pass as a test but not quite,
// the info to check is left for user.
export async function startEx(): Promise<void> {
  const users: User[] = [];
  let emptyWorkSpaceBranch: IWorkspaceBranch = {};
  users.push(new User("Yazeed Sabri", "ysabri@wisc.edu", emptyWorkSpaceBranch));
  emptyWorkSpaceBranch = {};
  users.push(new User("LL", "LL@wisc.edu", emptyWorkSpaceBranch));
  emptyWorkSpaceBranch = {};
  users.push(new User("GWiz", "GWiz@wisc.edu", emptyWorkSpaceBranch));
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
  writeFileSync(join(repo.path, "sync.txt"), "testFile");
  // notice how the same indexes map to the user to their workspace
  const topicSpace = repo.topicSpaces[0];
  const user = topicSpace.users[0];
  const workSpace = topicSpace.workSpaces[0];
  // should use getVal but I know the branch exists for a fact
  const branch = user.workSpaces[workSpace.name];
  // checkout the branch we want to commit at
  await checkoutBranch(repo, branch);

  const newWS = await measure("sync",
    () => sync(repo, topicSpace, workSpace, user, "First Sync Commit", "Yay this worked" ));
  // Add the change to a new repo object
  const newRepo = await changeWS(repo, topicSpace, newWS);
  // tslint:disable-next-line:no-console
  console.log(newRepo.id());

  emptyWorkSpaceBranch = {};
  const fourthUser = new User("cool guy", "coolGuy@newGuy.com", emptyWorkSpaceBranch);
  const fourthWS = await measure("Create WorkSpace",
      () => createWorkSpace(repo, fourthUser, topicSpace, newWS));
  // add the change to a new repo obj
  const newerRepo = await addWS(newRepo, topicSpace, fourthWS, fourthUser);
  // tslint:disable-next-line:no-console
  console.log(newerRepo.id());
  emptyWorkSpaceBranch = {};
  const fifthUser = new User("bob benson", "benson@bob.com", emptyWorkSpaceBranch);
  emptyWorkSpaceBranch = {};
  const sixthUser = new User("jack sparrow", "sparrow@jack.com", emptyWorkSpaceBranch);
  emptyWorkSpaceBranch = {};
  const seventhUser = new User("hp", "hp@hp.hp", emptyWorkSpaceBranch);
  let newTS;
  try {
    newTS = await measure("Create TS", () => createTopicSpace(repo,
    [fifthUser, sixthUser, seventhUser], newerRepo.topicSpaces[0].workSpaces[0].tip, "Bug Fix"));
  } catch (err) {
    if (err) {
      // tslint:disable-next-line:no-console
      console.log(err);
    }
  }
  if (newTS) {
    const newestRepo = await addTS(newerRepo, newTS);
    // tslint:disable-next-line:no-console
    console.log(newestRepo.id());
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

// show an example of the key value pair and using getVal
export async function keyValPair() {
    const workObj: IWorkspaceBranch = {};
    // another form would be workObj["exist"] or in reality workObj[WorkSpace.name]
    workObj.exist = new Branch("sdfj", "sdafsad", new Commit("sfa", "sdfa", "sdfa",
    new CommitterID("sadf", "dsfa", new Date()), "dfsF", []));
    const exist = getVal(workObj, "exist");
    const dnd = getVal(workObj, "dnd");
    if (!exist) {
      // tslint:disable-next-line:no-console
      console.log("exist is undefined");
    }
    if (!dnd) {
      // tslint:disable-next-line:no-console
      console.log("dnd dnd");
    }

}
