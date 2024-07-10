import { createComponent, bootstrap, parse, registerComponent } from "./lib/v4";
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

      return parse.bind(this)(`
        <div class="card">
            <img class="card-img" src="${image}">
            <h1 :click="increase" class="card-title">
                ${name} +${this.state.clicks}
            </h1>
            <span>${description}</span>
        </div>
      `);
    },
  });
registerComponent(
  Card,
  "pkmn-card",
  `.card {
    height: 100px;
    align-content: center;
    margin: 16px;
  }
  .card-img {
    float: left;
    margin-right: 16px;
    height: 100px;
  }
  .card-title {
    cursor: pointer;
    user-select: none;
  }`
);

const App = () =>
  createComponent({
    render() {
      const pokemons = getPokedex();

      return parse.bind(this)(`
        <div>
          <h1 class="heading">Pokedex v4 - DOM Parser, Web Components & View Encapsulation</h1>
          ${pokemons
            .map(
              (pkmn) =>
                `<pkmn-card props='${JSON.stringify(pkmn)}'></pkmn-card>>`
            )
            .join("")}
        </div>
      `);
    },
  });

bootstrap(App);
