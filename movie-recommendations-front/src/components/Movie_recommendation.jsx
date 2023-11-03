import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import './movie_recommendation.css'; // Import the CSS file

const MovieRecommendation = () => {
  const [popularMovies, setPopularMovies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [numberOfMovies, setNumberOfMovies] = useState(''); // Default value

  const handleInputChange = (event) => {
    setNumberOfMovies(event.target.value);
  };

  const fetchData1 = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Define the API endpoint with the user-specified number
    const apiUrl = `http://localhost:5000/popular-movies?n=${numberOfMovies}`;

    // Make a GET request using Axios
    axios.get(apiUrl)
      .then(response => {
        setPopularMovies(response.data.popular_movies);
        setLoading(false);
      })
      .catch(error => {
        console.error('Error fetching popular movies:', error);
        setLoading(false);
      });
  };

  // State to manage input values and recommendations
  const [fullMovieTitle, setFullMovieTitle] = useState('');
  const [numRecommendations, setNumRecommendations] = useState();
  const [recommendations, setRecommendations] = useState([]);

  // Function to handle form submission
  const handleFormSubmit2 = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/recommendations', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movie_title: selectedOption,
          n_recommendations: numRecommendations,
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      setRecommendations(data.recommendations);
    } catch (err) {
      console.error(err);
    }
  };

  const handleReset = () => {
    setNumberOfMovies(''); // Reset form data to its initial state
    setMovieTitle('');
    setNumRecommendations('');

  };

  const handleOptionChange = (e) => {
    setSelectedOption(e.target.value); // Update the selected option
  };

  // State to manage input values and recommendations
  const [movieTitle, setMovieTitle] = useState('');
  const [moviesList, setMoviesList] = useState([]);
  const [selectedOption, setSelectedOption] = useState('');

  // Function to handle form submission
  const handleFormSubmit1 = async (e) => {
    e.preventDefault();
    try {
      const response = await fetch('http://localhost:5000/find_similar_movies', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          movie_title: movieTitle,
        }),
      });

      if (!response.ok) {
        throw new Error('Request failed');
      }

      const data = await response.json();
      if (data.similar_movie_titles) {
        setMoviesList(data.similar_movie_titles);
      }
    } catch (err) {
      console.error(err);
    }
  };
  
    return (
        <div className='grid-container'>
          <div className="result-box-container">
            <div>
              <h1 className='blue-hedding'>Get Popular Movies</h1>
            </div>
            <div className='input-container-item'>
                <form onSubmit={fetchData1}>
                  <div className="form-group row">
                      <label htmlFor="movie_title" className="col-sm-6 col-form-label">How Many Popular Movies Would You Like to See?</label>
                      <div className="col-sm-6">
                        <input
                            type="number"
                            className="form-control"
                            id="number"
                            name="number"
                            placeholder="Enter The number"
                            value={numberOfMovies}
                            onChange={handleInputChange}
                            min="1"
                            required 
                        />
                        </div>
                  </div>
                  {popularMovies && 
                      <div className='container-item'>
                        <div className="scroll-item">
                          <h5>Popular Movies:</h5>
                          <ol>
                            {popularMovies.map((movie, index) => (
                              <li key={index}>{movie}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                  }
                  <button type="submit" className="btn btn-primary add-btn">
                      Submit
                  </button>
                  <button type="button" className="btn btn-outline-primary clear-btn" onClick={handleReset}>
                      Reset
                  </button>
                </form>
                  </div>
                </div>
                <div className="result-box-container">
                  <div>
                    <h1 className='blue-hedding'>Movie Recommendations</h1>
                  </div>
                  <div className='input-container-item'>
                    <form onSubmit={handleFormSubmit1}>
                      <div className="form-group row">
                        <label htmlFor="movie_title" className="col-sm-6 col-form-label">Movie Title</label>
                        <div className="col-sm-6">
                          <input
                              type="text"
                              className="form-control"
                              id="movieTitler"
                              name="movieTitle"
                              placeholder="Enter Movie Title"
                              value={movieTitle}
                              onChange={(e) => setMovieTitle(e.target.value)}
                              required 
                          />
                          </div>
                      </div>
                      <button type="submit" className="btn btn-primary add-btn">
                        Get Similar Movies
                      </button>
                      <button type="button" className="btn btn-outline-primary clear-btn" onClick={handleReset}>
                          Reset
                      </button>
                    </form>
                    {moviesList.length > 0 && (
                      <div>
                        <label htmlFor="movie_title" className="col-sm-6 col-form-label">Movie Title for Recommendations</label>
                        <select class="form-select" aria-label="Default select example" onChange={handleOptionChange} value={selectedOption}>
                          <option value="" selected>--Select a Movie--</option>
                          {moviesList.map((movie, index) => (
                            <option key={index} value={movie}>
                              {movie}
                            </option>
                          ))}
                        </select>
                      

                        <form onSubmit={handleFormSubmit2}>
                          <div className="form-group row">
                            <label htmlFor="movie_title" className="col-sm-6 col-form-label">Number of Similar Movies</label>
                            <div className="col-sm-6">
                              <input
                                  type="number"
                                  className="form-control"
                                  id="numRecommendations"
                                  name="numRecommendations"
                                  placeholder="Enter The number"
                                  value={numRecommendations}
                                  onChange={(e) => {
                                    const value = parseInt(e.target.value);
                                    if (!isNaN(value)) {
                                      setNumRecommendations(value);
                                    }
                                  }}
                                  min="1"
                                  required 
                              />
                              </div>
                        </div>
                          <button type="submit" className="btn btn-primary add-btn">
                            Get Movie Recommendations
                          </button>
                          <button type="button" className="btn btn-outline-primary clear-btn" onClick={handleReset}>
                              Reset
                          </button>
                        </form>
                    </div>
                    )}
                    {recommendations && 
                      <div className='container-item2'>
                        <div className="scroll-item2">
                          <h5>Movie Recommendations:</h5>
                          <ol>
                            {recommendations.map((movie, index) => (
                              <li key={index}>{movie}</li>
                            ))}
                          </ol>
                        </div>
                      </div>
                  }
                  </div>
                </div>
        </div>
    );
  };

export default MovieRecommendation;
