import {
  h as _h,
  init,
  classModule,
  styleModule,
  propsModule,
  eventListenersModule,
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
