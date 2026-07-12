export default {
  async fetch(request, env) {

    return new Response(
      JSON.stringify({
        message: "Discord connection OK!"
      }),
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

  }
}

