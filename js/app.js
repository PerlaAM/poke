const pokemonColors = {
    red: '#ff00003F',
    blue: '#0000ff3F',
    yellow: '#ffff003F',
    purple: '#8000803F',
    green: '#0080003F',
    brown: '#a52a2a3F',
    pink: '#ffc0cb3F',
    black: '#0000003F',
    white: '#e1e1e13F',
    gray: '#8080803F',
}

const randomPokemon = (min, max) => {
    return Math.floor(Math.random() * (max - min)) + min;
}

const randomPoke = randomPokemon(1, 151);

const fetchData = async (id) => {
    try {
        let [pokeData, pokeSpecie] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`)
        ]);
        const data = await pokeData.json();
        const specie = await pokeSpecie.json();

        fillSectionHome(data, specie)
    }
    catch (error) {
        console.log(error);
    };
}

const fillSectionHome = (pokemon, specie) => {
    const homeElement = document.getElementById('home');
    const nameElement = document.getElementById('home-name');
    const imageElement = document.getElementById('home-image');
    const typeElement = document.getElementById('type');
    const identifierElement = document.getElementById('identifier');

    const image = pokemon?.sprites?.other?.dream_world?.front_default;
    const type = pokemon?.types;
    const color = specie?.color?.name;
    const types = type.map(type => {
        return type.type.name
    })

    nameElement.innerHTML = pokemon?.name;
    imageElement.style.backgroundImage = `url(${image})`;
    homeElement.style.backgroundColor = pokemonColors[color];
    typeElement.innerHTML = types.join(' | ');
    identifierElement.innerHTML = `#${pokemon?.id}`;
}

fetchData(randomPoke);
