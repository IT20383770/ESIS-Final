import pandas as pd
import numpy as np
from flask import Flask, request, jsonify
from scipy.sparse import csr_matrix
from sklearn.neighbors import NearestNeighbors
from flask_cors import CORS

app = Flask(__name__)

# Enable CORS for all routes
CORS(app)

RATINGS_URL = "https://s3-us-west-2.amazonaws.com/recommender-tutorial/ratings.csv"
MOVIES_URL = "https://s3-us-west-2.amazonaws.com/recommender-tutorial/movies.csv"

# Load data into memory when the server starts
ratings = pd.read_csv(RATINGS_URL)
movies = pd.read_csv(MOVIES_URL)


def most_popular_movies(n):
    avg_ratings = ratings.groupby('movieId').mean()['rating']
    top_movies = avg_ratings.sort_values(ascending=False).head(n).index.tolist()
    return top_movies


@app.route('/popular-movies', methods=['GET'])
def get_popular_movies():
    n = request.args.get('n', type=int)
    if n is None:
        return jsonify({'error': 'Please provide the parameter "n".'}), 400

    popular_movies = most_popular_movies(n)
    movie_titles = movies[movies['movieId'].isin(popular_movies)]['title'].tolist()

    return jsonify({'popular_movies': movie_titles})


def find_similar_titles(movie_title_input, movies):
    matching_movies = movies[movies['title'].str.contains(movie_title_input, case=False, na=False)]
    return matching_movies['title'].tolist()


@app.route('/find_similar_movies', methods=['POST'])
def find_similar_movies():
    try:
        data = request.get_json()
        movie_title_input = data['movie_title']

        similar_titles = find_similar_titles(movie_title_input, movies)

        if not similar_titles:
            response = {"message": "No Similar Movie Titles Found."}
        else:
            response = {"similar_movie_titles": similar_titles}

        return jsonify(response), 200
    except Exception as e:
        return jsonify({"error": str(e)}), 400


def create_matrix(df):
    print("Processing Data Into Matrix Format...")
    N = len(df['userId'].unique())
    M = len(df['movieId'].unique())
    user_mapper = dict(zip(np.unique(df["userId"]), list(range(N))))
    movie_mapper = dict(zip(np.unique(df["movieId"]), list(range(M))))
    user_inv_mapper = dict(zip(list(range(N)), np.unique(df["userId"])))
    movie_inv_mapper = dict(zip(list(range(M)), np.unique(df["movieId"])))
    user_index = [user_mapper[i] for i in df['userId']]
    movie_index = [movie_mapper[i] for i in df['movieId']]
    X = csr_matrix((df["rating"], (movie_index, user_index)), shape=(M, N))
    print("Matrix Created Successfully!")
    return X, user_mapper, movie_mapper, user_inv_mapper, movie_inv_mapper


def find_similar_movies(movie_id, X, movie_mapper, movie_inv_mapper, k=10):
    print("Finding Similar Movies...")
    if movie_id not in movie_mapper:
        print(f"Movie ID {movie_id} Not Found!")
        return []
    movie_ind = movie_mapper[movie_id]
    movie_vec = X[movie_ind]
    k += 1
    kNN = NearestNeighbors(n_neighbors=k, algorithm="brute", metric='cosine')
    kNN.fit(X)
    movie_vec = movie_vec.reshape(1, -1)
    neighbours = kNN.kneighbors(movie_vec, return_distance=False)
    neighbour_ids = [movie_inv_mapper[n] for n in neighbours[0][1:]]
    return neighbour_ids


def get_movie_id_from_title(movie_title_input, movies):
    selected_movie = movies[movies['title'].str.contains(movie_title_input, case=False, na=False, regex=False)]

    if selected_movie.empty:  # Check if the DataFrame is empty
        print(f"No movie found matching the title: {movie_title_input}")
        return None  # Return None or an appropriate value to handle this case in the calling function

    return selected_movie.iloc[0].movieId


X, user_mapper, movie_mapper, user_inv_mapper, movie_inv_mapper = create_matrix(ratings)
movie_titles = dict(zip(movies['movieId'], movies['title']))


@app.route('/recommendations', methods=['POST'])
def get_recommendations():
    data = request.get_json()

    if 'movie_title' not in data:
        return jsonify({"error": "Missing 'movie_title' in the request."}), 400

    movie_title_input = data['movie_title']
    movie_id = get_movie_id_from_title(movie_title_input, movies)

    if movie_id:
        n_recommendations = data.get('n_recommendations', 10)
        similar_ids = find_similar_movies(movie_id, X, movie_mapper, movie_inv_mapper, k=n_recommendations)

        recommendations = [movie_titles[i] for i in similar_ids]

        return jsonify({"recommendations": recommendations})

    return jsonify({"error": "Movie not found."}), 404


if __name__ == "__main__":
    app.run(debug=True)
