import { createComponent, Router, parse, registerComponent } from "./lib/v5";
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
    state: { searchQuery: "" },
    methods: {
      route: (e) => {
        Router.routeTo(e);
      },
      search: (e) => {
        this.state.searchQuery = e.srcElement.value;
      },
    },
    render() {
      const pokemons = getPokedex().filter(({ name }) =>
        name.toLowerCase().includes(this.state.searchQuery.toLowerCase())
      );

      return parse.bind(this)(`
        <div>
          <h1 class="heading">Pokedex v5 - Router</h1>
          <div class="links">
            <a class="navlink" :click="route" href="/">Home</a>
            <a class="navlink" :click="route" href="/about">About</a>
          </div>
          <div class="filter">
            <input type ="text" class="search-input" :input="search" />
          </div>
          <span>Searching for: ${this.state.searchQuery}</span>
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

const About = () =>
  createComponent({
    methods: {
      route: (e) => {
        Router.routeTo(e);
      },
    },
    render() {
      return parse.bind(this)(`
        <div>
          <h1 class="heading">Pokedex v5 - Router</h1>
          <div class="links">
            <a class="navlink" :click="route" href="/">Home</a>
            <a class="navlink" :click="route" href="/about">About</a>
          </div>
          <span>Created with ♥ by Ankit Priyarup</span>
        </div>
      `);
    },
  });

Router.init([
  ["/", App],
  ["/about", About],
]);
