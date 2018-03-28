import { clone } from "../git";

export async function download(
    path: string,
    url: string,
): Promise<void> {


    await clone(url, path);
}
