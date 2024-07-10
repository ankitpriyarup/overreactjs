import { createComponent, bootstrap } from "./lib/v1";
import { getPokedex } from "./pokedex";

const Card = createComponent({
  render(props) {
    const name = props.name;
    const description = props.description;
    const image = props.img;

    return `
        <div class="card">
            <img class="card-img" src="${image}">
            <h1>${name}</h1>
            <span>${description}</span>
        </div>
    `;
  },
});

const App = createComponent({
  render() {
    const pokemons = getPokedex();

    return `
            <h1 class="heading">Pokedex v1 - Prop handling</h1>
            ${pokemons
              .map((pokemon) => Card.withProps(pokemon).render())
              .join("")}
        `;
  },
});

bootstrap(App);
