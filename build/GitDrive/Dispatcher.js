"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const dugite_1 = require("dugite");
/**
 * Defining our own error to include more information about the cause of
 * the errors. Not used for now, it will be once the error handlers are
 * implemented.
 */
class GError extends Error {
    constructor(errorMsg, args) {
        // this assumes that the errorMsg is defined for now, this has to
        // to either be callable from another class or get parsed through a
        // a function that will guarantee its value to be defined
        super(errorMsg || "An Error was called based on exist status != 0");
        this.name = "internalGitError";
        this.args = args;
    }
    toString() {
        return super.toString() + " " + this.args.toString();
    }
}
exports.GError = GError;
/**
 * Wrapper around dugite exec process in order to extended on it if desired.
 * The function will fulfil the promise with GResult that will contain any git
 * related errors. Or will reject when the git executable fails to launch,
 * in which case the thrown Error will have a string `code` property. See
 * * `dugite/errors.ts` for some of the known error codes.
 *
 * @param args          The arguments to pass to the git process.
 * @param cwd           The current working directory path for the command
 *                      being executed (this will not be needed for all the
 *                      commands).
 * @param ExecOptions   A bunch of environment, stdin, std  encoding, buffer
 *                      size, callback after spawn options for the when the
 *                      git process gets executed.
 */
function git(args, cwd, ExecOptions) {
    return __awaiter(this, void 0, void 0, function* () {
        const cmdOptions = Object.assign({}, ExecOptions);
        // await un-warps the promise here returning the object
        const execPromise = yield dugite_1.GitProcess.exec(args, cwd, cmdOptions);
        return execPromise;
    });
}
exports.git = git;
//# sourceMappingURL=dispatcher.js.map