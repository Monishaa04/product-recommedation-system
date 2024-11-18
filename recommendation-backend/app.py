from flask import Flask, request, jsonify
from pyspark.ml.recommendation import ALSModel
from pyspark.sql import SparkSession
from flask_cors import CORS

app = Flask(__name__)

# Initialize Spark Session
spark = SparkSession.builder \
    .appName("RecommendationAPI") \
    .config("spark.driver.memory", "4g") \
    .config("spark.executor.memory", "2g") \
    .getOrCreate()

# Load the trained ALS model from its saved location
model_path = r"D:\BDA\microproject\recommendation-backend\als_model"  # Update this path
try:
    model = ALSModel.load(model_path)
except Exception as e:
    print(f"Error loading ALS model: {e}")
    exit(1)  # Exit if the model cannot be loaded

@app.route('/recommend', methods=['GET'])
def recommend():
    user_id = request.args.get('user_id')
    if not user_id or not user_id.isdigit():
        return jsonify({"error": "Valid User ID is required"}), 400

    user_id = int(user_id)
    try:
        user_df = spark.createDataFrame([(user_id,)], ["userId"])  # Match model's schema
        recommendations = model.recommendForUserSubset(user_df, 10).collect()
        if not recommendations:
            return jsonify({"error": f"No recommendations found for user_id {user_id}"}), 404

        # Parse recommendations
        recs = recommendations[0].recommendations
        rec_list = [{"product_id": rec.productIndex, "rating": rec.rating} for rec in recs]

        return jsonify({"user_id": user_id, "recommendations": rec_list})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
