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
        let [pokeData, pokeSpecie, pokeList] = await Promise.all([
            fetch(`https://pokeapi.co/api/v2/pokemon/${id}`),
            fetch(`https://pokeapi.co/api/v2/pokemon-species/${id}/`),
            fetch(`https://pokeapi.co/api/v2/pokemon/?limit=9&offset=${randomPoke}`)
        ]);
        const data = await pokeData.json();
        const specie = await pokeSpecie.json();
        const list = await pokeList.json();

        getEvolutionData(specie, id, data);
        getExplorerData(list);
        fillSectionHome(data, specie);

    }
    catch (error) {
        const errorElement = document.getElementById("error");
        errorElement.style.display = "block";

        console.log(error);
    };
}
let newEvolution = {};

const getEvolutionData = async (evolution, currentId, pokemon) => {
    let firstSpecieId = 0;
    let secondSpecieId = 0;

    await fetch(evolution.evolution_chain.url)
        .then(response => response.json())
        .then(data => {
            const chain = data?.chain?.evolves_to;
            const firstSpecieName = chain[0]?.species?.name || chain.species?.name;
            firstSpecieId = Number(chain[0]?.species?.url.match(/\d+/g)[1]);
            const secondSpecieName = chain[0]?.evolves_to[0]?.species?.name;
            secondSpecieId = Number(chain[0]?.evolves_to[0]?.species?.url.match(/\d+/g)[1]);

            newEvolution = [{
                id: isNaN(firstSpecieId) ? firstSpecieId = 0 : firstSpecieId,
                name: firstSpecieName
            },
            {
                id: isNaN(secondSpecieId) ? secondSpecieId = 0 : secondSpecieId,
                name: secondSpecieName,
            }]
            if (currentId != firstSpecieId && currentId != secondSpecieId && pokemon.name != firstSpecieName && pokemon.name != secondSpecieName) {
                newEvolution = [
                    {
                        id: currentId,
                        name: pokemon?.name,
                        image: pokemon?.sprites?.other?.dream_world?.front_default,

                    },
                    {
                        id: firstSpecieId,
                        name: firstSpecieName,
                        image: null
                    },
                    {
                        id: secondSpecieId,
                        name: secondSpecieName,
                        image: null
                    }
                ]
            }
        })

    if (firstSpecieId !== 0) {

        await fetch(`https://pokeapi.co/api/v2/pokemon/${firstSpecieId}`)
            .then(response => response.json())
            .then(evolution => {
                let pokemonEvolution = newEvolution.find(element =>
                    element.id === firstSpecieId
                )
                pokemonEvolution.image = evolution?.sprites?.other?.dream_world?.front_default
            });
    }

    if (secondSpecieId !== 0 && secondSpecieId !== NaN) {
        await fetch(`https://pokeapi.co/api/v2/pokemon/${secondSpecieId}`)
            .then(response => response.json())
            .then(evolution => {
                let pokemonEvolution = newEvolution.find(element =>
                    element.id === secondSpecieId
                )
                pokemonEvolution.image = evolution?.sprites?.other?.dream_world?.front_default
                pokemonEvolution.types = evolution?.types
            });
    }

    if (newEvolution.length > 1) {
        fillSectionEvolution(newEvolution);
    }
}

const getExplorerData = (list) => {
    let array = list.results
    let ids = array.map(id => {
        return id.url.match(/\d+/g)[1]
    })
    let emptyArray = [];

    ids.map(id => {
        fetch(`https://pokeapi.co/api/v2/pokemon/${id}`)
            .then(response => response.json())
            .then(data => {
                emptyArray.push(data)
                fillSectionExplorer(emptyArray)
            })
    });
}

const fillSectionHome = (pokemon, specie) => {
    const homeElement = document.getElementById('home');
    const nameElement = document.getElementById('home-name');
    const imageElement = document.getElementById('home-image');
    const typeElement = document.getElementById('type');
    const identifierElement = document.getElementById('identifier');

    const image = pokemon?.sprites?.other?.dream_world?.front_default;
    const types = pokemon?.types;
    const type = types.map(type => {
        return type.type.name
    })
    const color = specie?.color?.name;

    nameElement.innerHTML = pokemon?.name;
    imageElement.style.backgroundImage = `url(${image})`;
    homeElement.style.backgroundColor = pokemonColors[color];
    typeElement.innerHTML = type.join(' | ');
    identifierElement.innerHTML = `#${pokemon?.id}`;
}

const fillSectionEvolution = (evolution) => {
    const evolutionSectionElement = document.getElementById('evolution-section');

    if (evolution.length === 0) {
        evolutionSectionElement.style.display = 'none';
    } else {
        evolution.map((data) => {
            let element = this.document.createElement('div');
            element.className = "content-cards";

            if (data.id !== 0) {
                element.innerHTML = `<div class="large-card" onclick="fetchReset(${data?.id})">
                <div class="card-img-box">
                    <img src="${data?.image}" alt="" />
                </div>
                <div class="card-body">
                    <div class="card-data-box margin-bottom-1">
                        <p id="identifier-evolution" class="label">NUMBER</p>
                        <p class="card-text font-blue font-weight-300">#${data?.id}</p>
                    </div>
                    <div class="card-data-box">
                        <p class="label">NAME</p>
                        <p class="card-text font-dark-blue font-weight-300">${data?.name}</p>
                    </div>
                </div>
            </div>`
            }
            const evolutionElement = document.getElementById('evolution');
            evolutionElement.appendChild(element)
        })
    }
}

const fillSectionExplorer = (list) => {
    const explorerElement = document.getElementById('explorer');
    explorerElement.innerHTML = list.map(data => `<div class="small-card" onclick="fetchReset(${data?.id})">
    <div class="small-card-img-box">
      <img src="${data?.sprites?.other?.dream_world?.front_default}" alt="${data?.name}"/>
    </div>
    <div class="small-card-body">
      <p class="label font-gray">#${data?.id}</p>
      <p class="card-text font-gray font-weight-300">${data?.name}</p>
    </div>
  </div>`
    ).join('')
}

const fetchReset = (id) => {
    document.getElementById('evolution').innerHTML = "";
    fetchData(id);
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

const doKeySearch = (e) => {
    const searchInput = document.getElementById("search-input").value;
    const errorElement = document.getElementById("error");
    errorElement.style.display = "none";

    if (searchInput.length !== 0 && e.keyCode === 13) {
        document.getElementById('evolution').innerHTML = "";
        fetchData(searchInput.toLowerCase());
    }
}

const doSearch = () => {
    const searchInput = document.getElementById("search-input").value;
    const errorElement = document.getElementById("error");
    errorElement.style.display = "none";

    if (searchInput.length !== 0) {
        document.getElementById('evolution').innerHTML = "";
        fetchData(searchInput.toLowerCase());
    }

}

fetchData(randomPoke);