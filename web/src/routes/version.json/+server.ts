import { json } from "@sveltejs/kit";
import { getCommit, getBranch, getRemote, getVersion } from "@imput/version-info";

export async function GET() {
    try {
        return json({
            commit: await getCommit().catch(() => undefined),
            branch: await getBranch().catch(() => undefined),
            remote: await getRemote().catch(() => undefined),
            version: await getVersion().catch(() => undefined)
        });
    } catch (error) {
        // Fallback if version-info fails completely
        return json({
            commit: undefined,
            branch: undefined,
            remote: undefined,
            version: undefined
        });
    }
}

export const prerender = true;
