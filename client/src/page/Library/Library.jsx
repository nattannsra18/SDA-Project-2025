import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
 BiSearch, 
 BiSortAlt2, 
 BiGridAlt, 
 BiListUl 
} from 'react-icons/bi';
import './Library.css';

const Library = () => {
 const [games, setGames] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [sortBy, setSortBy] = useState('name');
 const [viewMode, setViewMode] = useState('grid');

 const customSwal = Swal.mixin({
   customClass: {
     popup: 'custom-swal-popup',
     title: 'custom-swal-title',
     htmlContainer: 'custom-swal-content',
     confirmButton: 'custom-swal-confirm-button',
     cancelButton: 'custom-swal-cancel-button',
     icon: 'custom-swal-icon'
   },
   buttonsStyling: false
 });

 useEffect(() => {
  const fetchLibraryGames = async () => {
    try {
      const userId = sessionStorage.getItem("userId");
      const token = sessionStorage.getItem("token");
  
      if (!userId || !token) {
        customSwal.fire({
          icon: 'error',
          title: 'Access Denied',
          text: 'Please sign in to view your library'
        });
        setLoading(false);
        return;
      }
  
      const response = await axios.get(
        `http://localhost:1337/api/product-keys?filters[owner][id][$eq]=${userId}&populate[product][populate]=image`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
  
      if (response.data.data && response.data.data.length > 0) {
        const userLibrary = response.data.data.map(item => {
          const product = item.product;
          const imageUrl = product.image?.[0]?.formats?.small?.url || 
                           product.image?.[0]?.url;
          
          return {
            id: product.id,
            name: product.name,
            description: product.description,   
            imageUrl: imageUrl ? `http://localhost:1337${imageUrl}` : null,
            gameKey: item.key
          };
        });
  
        setGames(userLibrary);
      } else {
        setGames([]);
      }
  
      setLoading(false);
    } catch (error) {
      console.error('Error fetching library data:', error);
      customSwal.fire({
        icon: 'error',
        title: 'Connection Lost',
        text: 'Your library could not be loaded. Please try again.'
      });
      setGames([]);
      setLoading(false);
    }
  };
   fetchLibraryGames();
 }, []);

 // Sorting function
 const sortedGames = games
   .filter(game => 
     game.name.toLowerCase().includes(searchTerm.toLowerCase())
   )
   .sort((a, b) => {
     switch(sortBy) {
       case 'name':
         return a.name.localeCompare(b.name);
       default:
         return 0;
     }
   });

   const handleGameKeyModal = (game) => {
    customSwal.fire({
      title: game.name.toUpperCase(),
      html: `
        <div class="game-key-modal">
          <p class="key-instructions">Click below to copy your game key</p>
          <div class="game-key-container">${game.gameKey}</div>
        </div>
      `,
      showConfirmButton: true,
      confirmButtonText: 'Copy Key',
      showCloseButton: true,
      animation: true,
      preConfirm: () => {
        navigator.clipboard.writeText(game.gameKey);
        customSwal.fire({
          icon: 'success',
          title: 'Key Copied',
          text: 'Your game key has been copied to clipboard',
          showConfirmButton: false,
          timer: 1500
        });
      }
    });
  };

 if (loading) {
   return <div className="loading">Loading your library...</div>;
 }

 return (
   <div className="library-page">
     <div className="library-header">
       <h1>My Games Library</h1>
     </div>

     <div className="library-controls">
       <div className="library-filters">
         <div className="search-filter">
           <BiSearch className="search-icon" />
           <input 
             type="text" 
             className="search-input" 
             placeholder="Search your games"
             value={searchTerm}
             onChange={(e) => setSearchTerm(e.target.value)}
           />
         </div>
       </div>
     </div>

     <div className={`library-games ${viewMode}`}>
       {sortedGames.length === 0 ? (
         <div className="no-games-message">
           No games in your library
         </div>
       ) : (
         sortedGames.map((game) => (
           <div 
             key={game.id} 
             className="game-card" 
             onClick={() => handleGameKeyModal(game)}
           >
             <div className="game-image">
               {game.imageUrl ? (
                 <img src={game.imageUrl} alt={game.name} />
               ) : (
                 <div className="no-image">Game Art Loading</div>
               )}
             </div>
             <div className="game-info">
               <h2 className="game-title">{game.name}</h2>
               <button className="install-btn">View Game Key</button>
             </div>
           </div>
         ))
       )}
     </div>
   </div>
 );
};

export default Library;