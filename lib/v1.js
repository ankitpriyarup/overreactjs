export const createComponent = (args) => {
  let props = {};

  function renderExternal() {
    return args.render(props);
  }

  const publicApi = {
    withProps: (newProps) => {
      props = { ...props, ...newProps };
      return publicApi;
    },
    render: renderExternal,
  };

  return publicApi;
};

export const bootstrap = (app) => {
  const html = app.render();
  document.getElementById("app").innerHTML = html;
};
