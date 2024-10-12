import { useState, useEffect } from 'react';
import axios from 'axios';

interface Pokemon {
  name: string;
  image: string;
}

function App() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    const fetchPokemon = async () => {
      try {
        const response = await axios.get('https://pokeapi.co/api/v2/pokemon?limit=151');
        const results = response.data.results;

        const pokemonDetails = await Promise.all(
          results.map(async (pokemon: any) => {
            const details = await axios.get(pokemon.url);
            return {
              name: pokemon.name,
              image: details.data.sprites.front_default
            };
          })
        );

        setPokemonList(pokemonDetails);
      } catch (e) {
        console.error('Error fetching Pokémon data:', e);
      }
    };

    fetchPokemon();
  }, []);

  const filteredPokemon = pokemonList.filter((pok) =>
    pok.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleSearch = (e: any) => {
    setSearchTerm(e.target.value);
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-green-400 to-purple-500 text-center">
      <header className="py-8">
        <h1 className="text-4xl font-bold text-white mb-4">My Pokémon Dictionary</h1>
        <input
          type="text"
          placeholder="Search Pokémon..."
          value={searchTerm}
          onChange={handleSearch}
          className="p-3 w-80 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </header>

      <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-10">
        {filteredPokemon.map((pok) => (
          <div
            key={pok.name}
            className="bg-white bg-opacity-20 backdrop-blur-lg rounded-lg p-6 shadow-lg transform transition-all hover:scale-105"
          >
            <img
              src={pok.image}
              alt={pok.name}
              className="mx-auto w-24 h-24 mb-4"
            />
            <h2 className="text-2xl font-semibold text-white capitalize">
              {pok.name}
            </h2>
          </div>
        ))}
      </main>
    </div>
  );
}

export default App;
