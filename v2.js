import { createComponent, bootstrap } from "./lib/v2";
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

      return `
        <div class="card">
            <img class="card-img" src="${image}">
            <h1 onclick="$$.increase(event)" class="card-title">
                ${name} +${this.state.clicks}
            </h1>
            <span>${description}</span>
        </div>
    `;
    },
  });

const App = () =>
  createComponent({
    render() {
      const pokemons = getPokedex();

      return `
            <h1 class="heading">Pokedex v2 - State management</h1>
            ${pokemons
              .map((pokemon) => Card().withProps(pokemon).render())
              .join("")}
        `;
    },
  });

bootstrap(App());
