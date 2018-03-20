import { normalize } from "path";
import { startRepo } from "../git-drive/app/start";
import { IWorkspaceBranch, User } from "../model/app/user";
import { Branch } from "../model/git/branch";
import { Commit } from "../model/git/commit";
import { CommitterID } from "../model/git/committer-id";
import { EnclosedVariant, IPublicVariant, PublicVariant, Variant } from "../model/POST";
import { getVal } from "../util/getVal";


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
    // another form would workObj["exist"] or in reality workObj[WorkSpace.name]
    workObj.exist = new Branch("sdfj", "sdafsad", new Commit("sfa", "sdfa", "sdfa",
    new CommitterID("sadf", "dsfa", new Date()), "dfsF", []));
    keyVal(workObj);
    function keyVal(obj: IWorkspaceBranch): void {
      const exist = getVal(obj, "exist");
      const dnd = getVal(obj, "dnd");
      if (!exist) {
        // tslint:disable-next-line:no-console
        console.log("exist is undefined");
      }
      if (!dnd) {
        // tslint:disable-next-line:no-console
        console.log("dnd dnd");
      }
    }

}
