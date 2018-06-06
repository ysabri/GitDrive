// import { assert, expect } from "chai";
// import { Account } from "../../model/app/github-account";
// import { AuthorizationResponseKind, createAuthorization, fetchUser, API } from "../../util/github-api";


// describe("Testing OAuth integration", () => {
//     const endpoint = "https://api.github.com";
//     const username = "GitDriveTestUser";
//     const password = "Gitdriveisawesome";
//     const email = "hacoor2@hotmail.com";
//     let token: string;
//     let user: Account;
//     let api: API;
//     it("Authenticates the user given username and passoword", async () => {
//         const res = await createAuthorization(endpoint,
//             username, password , null);
//         if (res.kind === AuthorizationResponseKind.Authorized) {
//             token = res.token;
//             api = new API(endpoint, token);
//         } else {
//             // fail the test, user was not authorized
//             assert.fail("The user did not get authenticated");
//         }
//     });
//     it("Fetches the user correctly", async () => {
//         user = await fetchUser(endpoint, token);
//         expect(user.name).to.equal(username);
//         expect(user.endpoint).to.equal(endpoint);
//         expect(user.emails.length).to.equal(2);
//         expect(user.emails[0]).to.equal(email);
//     });
//     it("Fetch down the test repo", async () => {
//         const repo = await api.fetchRepository(username, "TestRepo");
//         console.log(repo);
//     });
// });

