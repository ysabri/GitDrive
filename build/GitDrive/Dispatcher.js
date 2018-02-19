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
 * Wrapper around the dugite exec process in order to extended if desired.
 * The function will always return a result even if the git process failed
 * to execute.
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
        const execResult = yield dugite_1.GitProcess.exec(args, cwd, cmdOptions);
        // const exitCode = execResult.exitCode;
        // tslint:disable-next-line:no-console
        console.log(execResult);
        return execResult;
    });
}
exports.git = git;
//# sourceMappingURL=dispatcher.js.map