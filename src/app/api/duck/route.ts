import { getSaveApi } from "@/server/game-server";

export const GET = (request: Request) => getSaveApi().getDuck(request);
export const POST = (request: Request) => getSaveApi().createDuck(request);
