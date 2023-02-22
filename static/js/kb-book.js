import { registerFunctionComponent } from 'webact';

registerFunctionComponent(async function KbBook () {
  const { html, css, postRender, $ } = this;

  html`
    <figure>
      <slot name="image"></slot>
    </figure>
    <strong>
      <slot name="name"></slot>
    </strong>
  `;

  css`
    :host {
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
    strong {
      text-align: center;
      hyphens: auto;
      width: 80%;
      overflow: hidden;
      text-overflow: ellipsis;
      height: 78px;
    }
  `;
}, { name: 'kb-book' });