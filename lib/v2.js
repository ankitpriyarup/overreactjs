const _registeredComponents = new Set([]);

export const createComponent = (args) => {
  let componentId = getRandomNumber(Number.MAX_SAFE_INTEGER);
  while (_registeredComponents.has(componentId)) {
    componentId = getRandomNumber(Number.MAX_SAFE_INTEGER);
  }
  _registeredComponents.add(componentId);
  componentId = `comp_${componentId}`;

  let props = {};
  let state = {};

  function createState(stateObj = {}) {
    return new Proxy(stateObj, {
      set: (target, key, value) => {
        target[key] = value;
        renderExternal();
        return true;
      },
    });
  }

  function renderExternal() {
    let html = args.render.bind({ state, props })();
    let root = document.getElementById(componentId);
    html = `<div id="${componentId}">${html.replaceAll('$$', componentId)}</div>`;
    if (root) root.innerHTML = html;
    return html;
  }

  state = createState(args.state);

  const publicApi = {
    withProps: (newProps) => {
      props = { ...props, ...newProps };
      return publicApi;
    },
    render: renderExternal,
    state,
    ...args.methods,
  };

  window[componentId] = publicApi;

  return publicApi;
};

export const bootstrap = (app) => {
  const html = app.render();
  document.getElementById("app").innerHTML = html;
};

function getRandomNumber(limit) {
  return Math.floor(Math.random() * limit);
}