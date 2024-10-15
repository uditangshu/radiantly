import { useState, useEffect, useCallback } from 'react';
import axios from 'axios';

interface Pokemon {
  name: string;
  image: string;
}

function App() {
  const [pokemonList, setPokemonList] = useState<Pokemon[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [nextUrl, setNextUrl] = useState(`https://pokeapi.co/api/v2/pokemon?limit=21`);
  const itemsPerPage = 21;

  useEffect(() => {
    const fetchPokemon = async () => {
      if (!nextUrl) return;

      try {
        setLoading(true);
        const response = await axios.get(nextUrl);
        const { results, next } = response.data;

        const pokemonDetails = await Promise.all(
          results.map(async (pok: any) => {
            const details = await axios.get(pok.url);
            return {
              name: pok.name,
              image: details.data.sprites.front_default,
            };
          })
        );

        setPokemonList((prev) => [...prev, ...pokemonDetails]);
        setNextUrl(next); 
      } catch (e) {
        console.error('Error fetching Pokémon data:', e);
      } finally {
        setLoading(false);
      }
    };

    fetchPokemon();
  }, [nextUrl]);

  const filteredPokemon = pokemonList.filter((pok) =>
    pok.name.toLowerCase().includes(searchTerm.toLowerCase().trim())
  );

  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentPokemon = filteredPokemon.slice(indexOfFirstItem, indexOfLastItem);

  const nextPage = () => {
    const maxPage = Math.ceil(filteredPokemon.length / itemsPerPage);
    if (currentPage < maxPage) {
      setCurrentPage(currentPage + 1);
    } else if (nextUrl) {
      setCurrentPage(currentPage + 1); 
    }
  };

  const prevPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1);
    }
  };

  const handleSearch = useCallback((e: any) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  }, []);

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

      {loading ? (
        <p className="text-white text-2xl">Loading...</p>
      ) : (
        <div>
          <main className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 px-4 py-10">
            {currentPokemon.map((pok) => (
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

          <div className="flex flex-col flex-1 justify-center mt-6">
            <span className="text-white text-lg mr-4">
              Page {currentPage} of {Math.ceil(filteredPokemon.length / itemsPerPage)}
            </span>
            <div className="flex justify-center mt-6">
              <button
                onClick={prevPage}
                disabled={currentPage === 1}
                className={`px-4 py-2 mb-6 mr-4 bg-gray-200 rounded-md ${currentPage === 1 ? 'cursor-not-allowed' : 'hover:bg-gray-300'}`}
              >
                Previous
              </button>
              <button
                onClick={nextPage}
                disabled={currentPage >= Math.ceil(filteredPokemon.length / itemsPerPage) && !nextUrl}
                className={`px-4 mb-6 py-2 bg-gray-200 rounded-md ${currentPage >= Math.ceil(filteredPokemon.length / itemsPerPage) && !nextUrl ? 'cursor-not-allowed' : 'hover:bg-gray-300'}`}
              >
                Next
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;
