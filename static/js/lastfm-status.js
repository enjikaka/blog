import { registerFunctionComponent } from "webact";

registerFunctionComponent(
  async function LastFMStatus() {
    const { html, css, postRender, $ } = this;

    html`
      <div>
        <img />
        <div id="meta">
          <a></a>
          <span></span>
        </div>
      </div>
    `;

    css`
      :host {
        display: none;
      }

      :host(.scrobbling) {
        display: block;
      }

      :host > div {
        display: flex;
        align-items: center;
        gap: calc(var(--gr-em) / 2);
        font-size: 8pt;
      }

      #meta {
        display: flex;
        flex-flow: column nowrap;
      }

      a {
        font-weight: bold;
        color: currentColor;
        text-decoration: none;
      }

      a:hover {
        text-decoration: underline;
      }

      figure {
        margin: 0;
        font-size: calc(var(--gr-em) * 2);
      }

      img {
        border-radius: calc(var(--gr-em) / 2);
      }
    `;

    postRender(() => {
      /** @type {EventSource | null}   */
      let eventSource = null;

      const $host = $();

      /** @type {HTMLImageElement} */
      const $img = $("img");
      /** @type {HTMLAnchorElement} */
      const $anchor = $("a");
      /** @type {HTMLSpanElement} */
      const $span = $("span");

      /** @type {string | null} */
      let lastRenderedId = null;

      /**
       * 
       * @param {string} id 
       * @param {{ image: { url: string }[], title: string, tidal: string, artist: string }} data 
       * @returns 
       */
      const updateStatus = (id, data) => {
        if (id === lastRenderedId) return;

        $img.src = data.image[0].url;
        $img.alt = data.title;

        $anchor.textContent = data.title;
        $anchor.href = `https://tidal.com/browse/track/${data.tidal}`;

        $span.textContent = data.artist;

        $host.classList.add("scrobbling");
        lastRenderedId = id;
      };

      const lastSSEMessage = sessionStorage.getItem("last-sse-message");

      if (lastSSEMessage) {
        console.log('Restoring last SSE message from sessionStorage:', lastSSEMessage);
        const { id, data } = JSON.parse(lastSSEMessage);

        updateStatus(id, data);
      }

      eventSource = new EventSource(
        "https://listen-in.deno.dev/enjikaka",
      )

      eventSource.addEventListener("scrobble", (e) => {
        const id = e.lastEventId;
        const data = JSON.parse(e.data);

        if (id === lastRenderedId) return;

        if (!data) {
          $host.classList.remove("scrobbling");
          return;
        }

        sessionStorage.setItem("last-sse-message", JSON.stringify({ id, data }));
        updateStatus(id, data);
      });
    });
  },
  { name: "lastfm-status" },
);
