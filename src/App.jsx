import './css/App.css'
import Favorites from './pages/Favorites';
import MovieDetails from "./pages/MovieDetails";
import Home from './pages/Home';
import {Routes, Route} from "react-router-dom";
import { MovieProvider } from "./contexts/MovieContext";
import NavBar from './components/NavBar';
import MovieNight from "./pages/MovieNight";
import TasteProfile from "./pages/TasteProfile";

function App() {

  return (
    <MovieProvider>
      <div>
        <NavBar />
        <main className="main-content">
          <Routes>
            <Route path="/" element={<Home/>}/>
            <Route path="/movie/:id" element={<MovieDetails />} />
            <Route path="/favorites" element={<Favorites/>}/> 
            <Route path="/movie-night" element={<MovieNight />} />
            <Route path="/taste" element={<TasteProfile />} />
          </Routes>
        </main>
      </div>
    </MovieProvider>
    
  );
}


export default App
