import { registerFunctionComponent } from 'https://unpkg.com/webact';

if (window.netlifyIdentity) {
  window.netlifyIdentity.on("init", user => {
    if (!user) {
      window.netlifyIdentity.on("login", () => {
        document.location.href = "/admin/";
      });
    }
  });
}

registerFunctionComponent(async function KbBook ({ isbn }) {
  const { html, css, postRender, $ } = this;

  html`
    <figure>
      <img alt="Book cover" />
    </figure>
    <strong></strong>
  `;

  css`
    :host {
      display: flex;
      flex-flow: column nowrap;
      width: 128px;
      font-size: 10pt;
      align-items: center;
    }
    figure {
      margin: 0;
      margin-bottom: 0.5em;
    }
    img {
      width: 64px;
    }
    strong,
    span {
      text-align: center;
    }
    small {
      font-size: 8pt;
    }
  `;

  postRender(async () => {
    const imgEl = $('img');
    const strongEl = $('strong');

    const response = await fetch('https://proud-frog-82.deno.dev/' + isbn);
    const { title, image } = await response.json();

    imgEl.src = image.record;
    strongEl.textContent = title;
  });
}, { name: 'kb-book' });