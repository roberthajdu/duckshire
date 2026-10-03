import { getSaveApi } from "@/server/game-server";

export const POST = (request: Request) => getSaveApi().syncDuck(request);
