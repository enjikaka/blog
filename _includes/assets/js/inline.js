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
    <a target="_blank">
      <figure>
        <img alt="Book cover" />
      </figure>
      <strong></strong>
    </a>
  `;

  css`
    a {
      display: flex;
      flex-flow: column nowrap;
      width: 128px;
      font-size: 10pt;
      align-items: center;
      text-decoration: none;
      color: currentColor;
    }
    figure {
      margin: 0;
      margin-bottom: 0.5em;
    }
    img {
      width: 64px;
    }
    strong {
      text-align: center;
      hyphens: auto;
      width: 80%;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 78px;
    }
  `;

  postRender(async () => {
    const imgEl = $('img');
    const anchorEl = $('a');
    const strongEl = $('strong');

    const response = await fetch('https://proud-frog-82.deno.dev/' + isbn);
    const { title, image, identifier } = await response.json();

    imgEl.src = image.record;
    strongEl.textContent = title;
    anchorEl.href = identifier;
  });
}, { name: 'kb-book' });