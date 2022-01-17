export { GameRoom } from "./GameRoom";

// eslint-disable-next-line import/no-anonymous-default-export
export default {
  async fetch(request, env) {
    let url = new URL(request.url);
    let path = url.pathname.slice(1).split("/");

    switch (path[0]) {
      case ".functions":
        return handleApiRequest(path.slice(1), request, env);
      default:
        return new Response("Not Found", { status: 404 });
    }
  },
};

async function handleApiRequest(path, request, env) {
  switch (path[0]) {
    case "room": {
      if (!path[1]) {
        if (request.method === "POST") {
          let id = env.rooms.newUniqueId();
          return new Response(id.toString(), {
            headers: { "Access-Control-Allow-Origin": "*" },
          });
        } else {
          return new Response("Method not allowed", { status: 405 });
        }
      }
      let name = path[1];
      let id;
      if (name.match(/^[0-9a-f]{64}$/)) {
        id = env.rooms.idFromString(name);
      } else if (name.length <= 32) {
        id = env.rooms.idFromName(name);
      } else {
        return new Response("Name too long", { status: 404 });
      }
      let roomObject = env.rooms.get(id);
      let newUrl = new URL(request.url);
      newUrl.pathname = "/" + path.slice(2).join("/");
      return roomObject.fetch(newUrl, request);
    }
    default:
      return new Response("Not found", { status: 404 });
  }
}
