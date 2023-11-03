import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MovieRecommendation from './components/Movie_recommendation';



function App() {
  return (
    <Router>
      <Routes>
        <Route exact path="/" element={<MovieRecommendation />} />
      </Routes>
    </Router>
  );
}

export default App;
