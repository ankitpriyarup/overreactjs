import { createComponent, bootstrap } from "./lib/v3";
import { getPokedex } from "./pokedex";

const Card = () =>
  createComponent({
    state: { clicks: 0 },
    methods: {
      increase(e) {
        e.stopPropagation();
        this.state.clicks++;
      },
    },
    render() {
      const name = this.props.name;
      const description = this.props.description;
      const image = this.props.img;

      return h(
        "div",
        { className: "card" },
        h("img", { className: "card-img", src: image }),
        h(
          "h1",
          { className: "card-title", onclick: (e) => this.increase(e) },
          `${name} +${this.state.clicks}`
        ),
        h("span", {}, description)
      );
    },
  });

const App = () =>
  createComponent({
    render() {
      const pokemons = getPokedex();

      return h(
        "div",
        {},
        h(
          "h1",
          { className: "heading" },
          "Pokedex v3 - Virtual DOM & Hydration"
        ),
        ...pokemons.map((props) => h(Card, props))
      );
    },
  });

bootstrap(App);
