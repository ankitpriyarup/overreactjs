import {
  h as _h,
  init,
  classModule,
  styleModule,
  propsModule,
  eventListenersModule,
  toVNode,
} from "snabbdom";

const _patch = init([
  classModule,
  propsModule,
  styleModule,
  eventListenersModule,
]);

export const createComponent = (args) => {
  let props = {};
  let state = {};
  let prevNode = null;
  let currentNode = null;

  function createState(stateObj = {}) {
    return new Proxy(stateObj, {
      set: (target, key, value) => {
        target[key] = value;
        prevNode = currentNode;
        currentNode = renderExternal();
        _patch(prevNode, currentNode);
        return true;
      },
    });
  }

  function renderExternal() {
    const getBoundMethods = () =>
      Object.fromEntries(
        Object.entries(args.methods ?? {}).map(([k, v]) => [
          k,
          v.bind({ state, props }),
        ])
      );

    return args.render.bind({ state, props, ...getBoundMethods() })();
  }

  state = createState(args.state);

  const publicApi = {
    withProps: (newProps) => {
      props = { ...props, ...newProps };
      return publicApi;
    },
    render: renderExternal,
    state,
    setCurrentNode(node) {
      currentNode = node;
    },
  };

  return publicApi;
};

global.h = (tagName, attrs, ...children) => {
  if (typeof tagName === "function") {
    const component = tagName().withProps(attrs);
    const html = component.render();
    component.setCurrentNode(html);
    return html;
  }

  return _h(tagName, computeAttrs(attrs ?? {}), children);
};

export const bootstrap = (App, data = {}) => {
  _patch(document.getElementById("app"), h(App, data));
};

export function parse(htmlString) {
  const temp = document.createElement('div');
  temp.innerHTML = htmlString;

  const processElement = (element) => {
    const tagName = element.tagName.toLowerCase();
    const attributes = {};
    const children = [];

    for (const attr of element.attributes) {
      let attrName = attr.name;
      let attrValue = attr.value;
      if (attrName === 'class') {
        attrName = 'className';
      }
      if (attrName === ':click') {
        attrName = 'onclick';
        attrValue = (e) => this[attr.value].bind(this)(e);
      }
      attributes[attrName] = attrValue;
    }

    for (const child of element.children) {
      children.push(processElement(child));
    }

    if (element.children.length === 0 && element.textContent) {
      children.push(element.textContent);
    }

    return h(tagName, attributes, ...children);
  }

  return processElement.bind(this)(temp.children[0]);
}

const _REGISTERED_COMPONENTS = new Map();
const _REGISTERED_STYLE = new Map();
class CustomElement extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const tagName = this.tagName.toLowerCase();
    const component = _REGISTERED_COMPONENTS.get(tagName);
    if (!component) {
      throw new Error(`Invalid component ${tagName} not found!`);
    }
    const shadow = this.attachShadow({ mode: 'closed' });
    shadow.appendChild(document.createElement('div'));
    const style = document.createElement("style");
    style.textContent = _REGISTERED_STYLE.get(tagName) ?? '';
    shadow.appendChild(style);
    const props = JSON.parse(this.props);
    _patch(shadow.childNodes[0], h(component, props ?? {}));
  }
}

export function registerComponent(fn, componentName, style) {
  if (_REGISTERED_COMPONENTS.has(componentName)) {
    throw new Error(`Component with name ${componentName} is already registerd!`);
  }
  _REGISTERED_COMPONENTS.set(componentName, fn);
  _REGISTERED_STYLE.set(componentName, style);
  customElements.define(componentName, CustomElement);
}

const computeAttrs = (attrs) =>
  Object.keys(attrs).reduce(
    (acc, key) => {
      const attrMapper = {
        className: (state, classNames) => ({
          ...state,
          class: {
            ...state.class,
            ...classNames
              .split(" ")
              .reduce((acc, className) => ({ ...acc, [className]: true }), {}),
          },
        }),
        onClick: (state, click) => ({
          ...state,
          on: { ...state.on, click },
        }),
        onKeyUp: (state, keyup) => ({
          ...state,
          on: { ...state.on, keyup },
        }),
      };

      const nextState = attrMapper[key]
        ? attrMapper[key](acc, attrs[key])
        : { ...acc, props: { ...acc.props, [key]: attrs[key] } };

      return nextState;
    },
    { class: {}, on: {}, props: {} }
  );
