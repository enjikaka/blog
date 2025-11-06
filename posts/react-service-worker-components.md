---
title: 'React Service Worker Components'
date: 2025-02-06
author: Jeremy Karlsson
summary: Your Service Worker as the Server for React Server components
tags:
  - javascript
  - react
---

[React Server Components](https://react.dev/reference/rsc/server-components) are kind of hot off the press. How they work is, unless you dive into some [the RFC](https://github.com/reactjs/rfcs/blob/main/text/0188-server-components.md), still a bit unknown. Let's do a quick wrap up...

## Short explainer

### What happens on the server?

The server renders the React component before sending them to the client. Instead of serving traditional HTML, RSC instead sends a special JSON-like format that describes the component structure. These components can fetch data and use backend-only logic like accessing databases. This lightweight description is sent to the client. Imagine a "User Profile" component that fetches user data. Instead of sending JS to fetch the data in the browser, the server fetches the data, renders the component and sends only the ready-to-use content to the client.

Here's some concrete code. This would be your server side React component:

```jsx
// This is a React Server Component (RSC)
async function UserProfile() {
  const user = await fetch("https://jsonplaceholder.typicode.com/users/1").then(res => res.json());

  return (
    <div>
      <h2>{user.name}</h2>
      <p>Email: {user.email}</p>
    </div>
  );
}

export default UserProfile;
```

After the server has executed the component it would send the following payload to the client:

```json
{
  "id": "rsc1",
  "type": "div",
  "props": {
    "children": [
      {
        "id": "rsc2",
        "type": "h2",
        "props": { "children": "Leanne Graham" }
      },
      {
        "id": "rsc3",
        "type": "p",
        "props": { "children": "Email: Sincere@april.biz" }
      }
    ]
  }
}
```

### What happens on the client?

The client receives the pre-processed structure from the server and React takes care of deserializing the response and rendering the native elements and Client Components.

## Taking it into the Service Worker

According to the docs RSCs may be [used without a server](https://react.dev/reference/rsc/server-components#server-components-without-a-server) compiling down to HTML, while the [server version](https://react.dev/reference/rsc/server-components#server-components-with-a-server) streams a UI description in JSON. 

Streaming HTML is a perfect job for a Service Worker, that intercepts and rewrites responses to your requests! This means we can implement RSCs in a service worker.

### How to render React Server Components in a Service Worker

React exports a method on the `react-dom` package called [`renderToReadableStream`](https://react.dev/reference/react-dom/server/renderToReadableStream). This renders a React tree as HTML.

That means we simply need a React tree and a route handler which responds with the result of `renderToReadableStream`.

Here's a small service worker doing that:

```js
import React from 'react';
import { renderToReadableStream } from 'react-dom/server';
import { App } from './App.server.js';

self.addEventListener('fetch', (event) => {
  console.log(`Handling fetch event for ${event.request.url}`);

  const url = new URL(event.request.url);

  if (url.pathname === '/rsc') {
    event.respondWith(handleRSCRequest());
  }
});

async function handleRSCRequest() {
  try {
    const stream = await renderToReadableStream(<App message="Hello from RSC via Service Worker!" />);

    return new Response(stream, {
      headers: { 'Content-Type': 'text/html; charset=utf-8' },
    });
  } catch (error) {
    console.error('Error rendering RSC:', error);
    return new Response('Internal Server Error', { status: 500 });
  }
}
```

We're registering a `/rsc` route which the service worker will respond to. We're calling `renderToReadableStream` with a React component and sending the stream as ther response. Quite simple!

### Hooking the client into the Service Worker response

I mentioned earlier that React handles the client-side rendering still. `react-dom` also exposes a method for our client side code called [`hydrateRoot`](https://react.dev/reference/react-dom/client/hydrateRoot). It takes care of displaying HTML from React on the server. Whipping that up is fairly easy too:

```js
import { hydrateRoot } from 'react-dom/client';

async function fetchAndHydrateRSC() {
  try {
    const response = await fetch('/rsc', {
      headers: { Accept: 'text/html' },
    });

    const html = await response.text();

    const container = document.getElementById('root');
    container.innerHTML = html;

    hydrateRoot(container, null);
  } catch (error) {
    console.error('Error fetching or hydrating RSC:', error);
  }
}

if ('serviceWorker' in navigator) {
  navigator.serviceWorker.register('sw.js').then(() => {
    console.log('Service Worker Registered');
    fetchAndHydrateRSC();

    if (!navigator.serviceWorker.controller) {
      window.location.reload();
    }
  });
}
```

Here we're waiting for the service worker to register - such that it can respond to our request - and then calling the endpoint which we created, and passing the response straight to `hydrateRoot`.

## Ending notes

It might sound weird to render React - or any UI/HTML for that matter - in a Service Worker. But as a matter of fact it's quite a good pattern for performance. Similar to render/UI threads in mobile app development, it lets you offload stuff from the main thread to keep that one going smooth. After all, JavaScript is single threaded by default. So introducing workers helps in the run time performance. Animations will not be interrupted and freezing UI is easier to avoid.

We also live in a day and age where even the [thin clients](https://en.wikipedia.org/wiki/Thin_client) are [thicc](https://www.urbandictionary.com/define.php?term=thicc). Why not utilize that?

The source code for my experiment with RSCs in SW is available on my GitHub: [github.com/enjikaka/react-service-worker-components](https://github.com/enjikaka/react-service-worker-components)

Another fun experiment with rendering in Service Workers is joining JSON data from an API with web components and sending the response to the browser. I created [a simple demo app](https://github.com/enjikaka/tidal-sdk-demo-app) using the TIDAL Open API using this technique.

I hope I've encouraged you to go play more with service workers. Have fun.
