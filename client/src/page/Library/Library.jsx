import React, { useState, useEffect } from 'react'; 
import axios from 'axios';
import Swal from 'sweetalert2';
import { 
 BiSearch, 
 BiSortAlt2, 
 BiGridAlt, 
 BiListUl 
} from 'react-icons/bi';
import { FaCopy, FaKey } from 'react-icons/fa';
import './Library.css';
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1337';

const Library = () => {
 const [games, setGames] = useState([]);
 const [loading, setLoading] = useState(true);
 const [searchTerm, setSearchTerm] = useState('');
 const [sortBy, setSortBy] = useState('name');
 const [viewMode, setViewMode] = useState('grid');

 // Modern modal style with no borders and white text
 const customSwal = Swal.mixin({
   customClass: {
     popup: 'modern-swal-popup',
     title: 'modern-swal-title',
     htmlContainer: 'modern-swal-content',
     confirmButton: 'modern-swal-confirm-button',
     closeButton: 'modern-swal-close-button',
     icon: 'modern-swal-icon'
   },
   buttonsStyling: false,
   showClass: {
     popup: 'animate__animated animate__fadeIn faster'
   },
   hideClass: {
     popup: 'animate__animated animate__fadeOut faster'
   }
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
          text: 'Please sign in to view your library',
        });
        setLoading(false);
        return;
      }

      // Fetch data from the updated endpoint
      const response = await axios.get(
        `${API_URL}/api/product-keys?filters[owner][id][$eq]=${userId}&populate[products][populate]=image`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (response.data.data && response.data.data.length > 0) {
        // Map the response data to extract relevant information
        const userLibrary = response.data.data.map((item) => {
          const product = item.products?.[0]; // Assuming 'products' is an array, use the first product
          const imageUrl =
            product?.image?.[0]?.formats?.small?.url || product?.image?.[0]?.url;

          return {
            id: product?.id,
            name: product?.name,
            description: product?.description,
            imageUrl: imageUrl ? `${API_URL}${imageUrl}` : null,
            gameKey: item.key,
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
        text: 'Your library could not be loaded. Please try again.',
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

   // Updated game key modal based on provided design
 const handleGameKeyModal = (game) => {
  customSwal.fire({
    title: game.name.toUpperCase(),
    html: `
      <div class="game-key-modal">
        <div class="key-label">YOUR GAME ACTIVATION KEY</div>
        <div class="game-key-container" onclick="navigator.clipboard.writeText('${game.gameKey}')">
          ${game.gameKey}
        </div>
        <div class="activate-info">
          <p>Activate this key on the game platform to start playing</p>
        </div>
      </div>
    `,
    showConfirmButton: true,
    confirmButtonText: 'COPY KEY',
    showCloseButton: true,
    showClass: {
      popup: 'animate__animated animate__fadeIn'
    },
    hideClass: {
      popup: 'animate__animated animate__fadeOut'
    },
    preConfirm: () => {
      navigator.clipboard.writeText(game.gameKey);
      const toast = Swal.mixin({
        toast: true,
        position: 'top-end',
        showConfirmButton: false,
        timer: 2000,
        timerProgressBar: true,
        iconColor: 'white',
        customClass: {
          popup: 'colored-toast',
          title: 'toast-title'
        },
        didOpen: (toast) => {
          toast.addEventListener('mouseenter', Swal.stopTimer)
          toast.addEventListener('mouseleave', Swal.resumeTimer)
        }
      });

      toast.fire({
        icon: 'success',
        title: 'Game key copied to clipboard!'
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
       <h1>Library</h1>
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