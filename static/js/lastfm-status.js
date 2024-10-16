import { registerFunctionComponent } from "webact";

registerFunctionComponent(
  async function LastFMStatus() {
    const { html, css, postRender, $ } = this;

    html`
      <div>Currently listening to</div>
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
        padding: calc(var(--gr-em) / 3);
        background-color: var(--bg-box);
        box-shadow: 0 0 10px rgba(255, 255, 255, 0.4);
        border-bottom-left-radius: calc(var(--gr-em) / 2);
        transition: padding 200ms ease;
      }

      :host(:hover) {
        padding: calc(var(--gr-em) / 2);
      }

      :host(.scrobbling) {
        display: block;
      }

      :host > div:first-child {
        justify-content: center;
        opacity: 0;
        transition: opacity 200ms ease;
        margin-block-end: calc(var(--gr-em) / 2);
      }

      :host(:hover) > div:first-child {
        opacity: 1;
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
      const eventSource = new EventSource(
        "https://listen-in.deno.dev/enjikaka",
      );

      /** @type {HTMLImageElement} */
      const $img = $("img");
      /** @type {HTMLAnchorElement} */
      const $anchor = $("a");
      /** @type {HTMLSpanElement} */
      const $span = $("span");

      eventSource.addEventListener("scrobble", (e) => {
        const data = JSON.parse(e.data);

        if (!data) {
          $().classList.remove("scrobbling");
          return;
        }

        $img.src = data.image[0].url;
        $img.alt = data.title;

        $anchor.textContent = data.title;
        $anchor.href = `https://tidal.com/browse/track/${data.tidal}`;

        $span.textContent = data.artist;

        requestAnimationFrame(() => {
          $().classList.add("scrobbling");

          $currentImg.replaceWith($newImg);
          $currentAnchor.replaceWith($newImg);
          $currentSpan.replaceWith($newImg);
        });
      });
    });
  },
  { name: "lastfm-status" },
);
