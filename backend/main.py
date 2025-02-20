from flask import Flask, jsonify, request, send_file
from flask_cors import CORS
import pandas as pd
import os
import logging
import bcrypt
import jwt
from database import SessionLocal, init_db
from model import User, SavedAttack  
from models.nn_model import process_network_traffic
import numpy as np
from datetime import datetime, timedelta

# Initialize Flask app and enable CORS
app = Flask(__name__)
CORS(app)

# Initialize DB and create tables if they do not exist
init_db()  # This will create tables if they do not exist

# Set up logging for debugging
logging.basicConfig(level=logging.DEBUG, format="%(asctime)s - %(levelname)s - %(message)s")

# Path to the CSV file (located in the 'network' folder)
csv_file_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'network', 'test_data_with_network_info.csv')

# Load the CSV data once at the start
try:
    traffic_data = pd.read_csv(csv_file_path)
    # Ensure that columns are correctly named (case-sensitive) and strip spaces
    traffic_data.columns = traffic_data.columns.str.strip()
    logging.info(f"Successfully loaded dataset from {csv_file_path}")
except Exception as e:
    logging.error(f"Failed to load CSV file: {e}")
    raise

# Add these variables at the top with other globals
ATTACK_PROBABILITY = 0.15  # 15% chance of attack
LAST_ATTACK_TIME = None
MIN_TIME_BETWEEN_ATTACKS = timedelta(seconds=30)  # Minimum 30 seconds between attacks

def get_random_traffic():
    """
    Get traffic data with realistic distribution:
    - Mostly benign traffic
    - Occasional attacks with cooldown period
    - Different attack types have different probabilities
    """
    try:
        global LAST_ATTACK_TIME
        current_time = datetime.now()
        
        # Check if we're still in cooldown period after last attack
        if LAST_ATTACK_TIME and (current_time - LAST_ATTACK_TIME) < MIN_TIME_BETWEEN_ATTACKS:
            # Get only benign traffic during cooldown
            benign_traffic = traffic_data[traffic_data['Attack Type'] == 'BENIGN']
            return benign_traffic.sample(1).iloc[0]

        # Determine if this should be an attack or benign traffic
        is_attack = np.random.random() < ATTACK_PROBABILITY

        if is_attack:
            # Different probabilities for different attack types
            attack_probabilities = {
                'Bot': 0.15,
                'Brute Force': 0.20,
                'DDoS': 0.15,
                'DoS': 0.20,
                'Port Scan': 0.20,
                'Web Attack': 0.10
            }
            
            # Select attack type based on probabilities
            attack_type = np.random.choice(
                list(attack_probabilities.keys()),
                p=list(attack_probabilities.values())
            )
            
            # Get traffic data for selected attack type
            attack_traffic = traffic_data[traffic_data['Attack Type'] == attack_type]
            if len(attack_traffic) > 0:
                LAST_ATTACK_TIME = current_time
                return attack_traffic.sample(1).iloc[0]
        
        # Default to benign traffic
        benign_traffic = traffic_data[traffic_data['Attack Type'] == 'BENIGN']
        return benign_traffic.sample(1).iloc[0]

    except Exception as e:
        logging.error(f"Error selecting random traffic data: {e}")
        raise

@app.route("/live-traffic", methods=["GET"])
def live_traffic():
    try:
        # Simulate traffic by randomly selecting a value from the dataset
        random_traffic = get_random_traffic()

        # Convert all values to native Python types (int, float, str)
        simulated_data = {col: random_traffic[col] for col in random_traffic.index}
        
        simulated_df = pd.DataFrame([simulated_data])
        logging.debug(f"Simulated Traffic Data: {simulated_df.to_dict(orient='records')}")

        # Process the simulated traffic data using the AI model
        processed_traffic = process_network_traffic(simulated_df)

        # Return the processed network traffic with attack type and recommendation
        return jsonify(processed_traffic.to_dict(orient="records")[0])

    except Exception as e:
        logging.error(f"Error in live_traffic route: {e}")
        return jsonify({"error": str(e)}), 500

# Sign-Up Route
@app.route("/sign-up", methods=["POST"])
def sign_up():
    try:
        # Get data from the request body
        data = request.get_json()
        first_name = data.get("firstName")
        last_name = data.get("lastName")
        email = data.get("email")
        username = data.get("username")
        password = data.get("password")
        company = data.get("company", "")

        # Hash the password
        hashed_password = bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt())

        # Create a database session
        db = SessionLocal()

        # Check if the user already exists
        existing_user = db.query(User).filter(User.username == username).first()
        if existing_user:
            return jsonify({"message": "Username already exists"}), 400

        # Create a new user instance
        new_user = User(
            first_name=first_name,
            last_name=last_name,
            email=email,
            username=username,
            password=hashed_password.decode("utf-8"),
            company=company,
        )

        # Add the new user to the database and commit the transaction
        db.add(new_user)
        db.commit()  # Ensure the transaction is committed
        db.refresh(new_user)

        # Return success response
        return jsonify({"message": "User created successfully", "user": {"username": new_user.username, "id": new_user.id}}), 201
    except Exception as e:
        return jsonify({"message": "Error during sign-up", "error": str(e)}), 500
    finally:
        db.close()

# Login Route
@app.route("/api/login", methods=["POST"])
def login():
    try:
        # Get data from the request body
        data = request.get_json()
        username = data.get("username")
        password = data.get("password")

        # Create a database session
        db = SessionLocal()

        # Check if the user exists
        user = db.query(User).filter(User.username == username).first()
        if not user:
            return jsonify({"message": "User not found"}), 404

        # Check if the password is correct
        if not bcrypt.checkpw(password.encode("utf-8"), user.password.encode("utf-8")):
            return jsonify({"message": "Invalid password"}), 400

        # Create JWT Token for the user
        token = jwt.encode({"user_id": user.id, "username": user.username}, "secretKey", algorithm="HS256")

        # Return success response with token
        return jsonify({"message": "Login successful", "token": token, "user": {"id": user.id, "username": user.username}}), 200

    except Exception as e:
        return jsonify({"message": "Error during login", "error": str(e)}), 500
    finally:
        db.close()

# Add new route to serve the explanation image
@app.route("/attack-explanation", methods=["GET"])
def get_attack_explanation():
    try:
        image_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'models', 'attack_explanation.png')
        if os.path.exists(image_path):
            return send_file(image_path, mimetype='image/png', cache_timeout=0)
        else:
            return "Image not found", 404
    except Exception as e:
        logging.error(f"Error serving explanation image: {e}")
        return str(e), 500

@app.route("/api/attacks/save", methods=["POST"])
def save_attack():
    try:
        # Get the token from the request headers
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"message": "No token provided"}), 401

        # Decode the token to get the user_id
        try:
            payload = jwt.decode(token.split(" ")[1], "secretKey", algorithms=["HS256"])
            user_id = payload['user_id']
        except:
            return jsonify({"message": "Invalid token"}), 401

        # Get attack data from request
        data = request.get_json()
        
        # Debug log the incoming data
        logging.debug(f"Received data: {data}")
        
        try:
            # Create new SavedAttack instance
            new_attack = SavedAttack(
                user_id=user_id,
                timestamp=data['timestamp'],
                attack_type=data['attackType'],
                flow_bytes=float(data['flowBytes']),  # Ensure float
                confidence=float(data['confidence']),  # Ensure float
                recommendation=data['recommendation'],
                interpretation=data['interpretation'],
                feature_importance=data['featureImportance'],
                source_ip=data['source_ip'],
                destination_ip=data['destination_ip'],
                protocol=data['protocol'],
                source_port=int(data['source_port']),  # Ensure integer
                destination_port=int(data['destination_port']),  # Ensure integer
                flow_duration=int(float(data['flow_duration']))  # Convert to integer
            )

            # Save to database
            db = SessionLocal()
            db.add(new_attack)
            db.commit()
            db.refresh(new_attack)
            
            return jsonify({"message": "Attack saved successfully", "id": new_attack.id}), 201

        except Exception as e:
            logging.error(f"Error creating SavedAttack: {str(e)}")
            return jsonify({"message": "Error creating attack record", "error": str(e)}), 500

    except Exception as e:
        logging.error(f"Error in save_attack: {str(e)}")
        return jsonify({"message": "Error saving attack", "error": str(e)}), 500
    finally:
        if 'db' in locals():
            db.close()

@app.route("/api/attacks/history", methods=["GET"])
def get_attack_history():
    try:
        # Get the token from the request headers
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"message": "No token provided"}), 401

        # Decode the token to get the user_id
        try:
            payload = jwt.decode(token.split(" ")[1], "secretKey", algorithms=["HS256"])
            user_id = payload['user_id']
        except:
            return jsonify({"message": "Invalid token"}), 401

        # Get user's saved attacks from database
        db = SessionLocal()
        saved_attacks = db.query(SavedAttack).filter(SavedAttack.user_id == user_id).all()
        
        # Convert to list of dictionaries
        attacks_list = [attack.to_dict() for attack in saved_attacks]
        
        return jsonify(attacks_list), 200

    except Exception as e:
        return jsonify({"message": "Error retrieving attacks", "error": str(e)}), 500
    finally:
        db.close()

@app.route("/api/attacks/delete/<int:attack_id>", methods=["DELETE"])
def delete_attack(attack_id):
    try:
        # Get the token from the request headers
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"message": "No token provided"}), 401

        # Decode the token to get the user_id
        try:
            payload = jwt.decode(token.split(" ")[1], "secretKey", algorithms=["HS256"])
            user_id = payload['user_id']
        except:
            return jsonify({"message": "Invalid token"}), 401

        # Get the attack and verify ownership
        db = SessionLocal()
        attack = db.query(SavedAttack).filter(
            SavedAttack.id == attack_id,
            SavedAttack.user_id == user_id
        ).first()

        if not attack:
            return jsonify({"message": "Attack not found or unauthorized"}), 404

        # Delete the attack
        db.delete(attack)
        db.commit()

        return jsonify({"message": "Attack deleted successfully"}), 200

    except Exception as e:
        return jsonify({"message": "Error deleting attack", "error": str(e)}), 500
    finally:
        db.close()

@app.route("/api/user/profile", methods=["GET", "PUT"])
def get_user_profile():
    try:
        # Get the token from the request headers
        token = request.headers.get('Authorization')
        if not token:
            return jsonify({"message": "No token provided"}), 401

        # Decode the token to get the user_id
        try:
            payload = jwt.decode(token.split(" ")[1], "secretKey", algorithms=["HS256"])
            user_id = payload['user_id']
        except Exception as e:
            return jsonify({"message": "Invalid token"}), 401

        db = SessionLocal()
        user = db.query(User).filter(User.id == user_id).first()
        
        if request.method == 'PUT':
            data = request.get_json()
            user.first_name = data.get('firstName', user.first_name)
            user.last_name = data.get('lastName', user.last_name)
            user.email = data.get('email', user.email)
            user.company = data.get('company', user.company)
            db.commit()
            db.refresh(user)
        
        saved_attacks_count = db.query(SavedAttack).filter(SavedAttack.user_id == user_id).count()
        
        user_data = {
            "username": user.username,
            "first_name": user.first_name,
            "last_name": user.last_name,
            "email": user.email,
            "company": user.company,
            "created_at": user.created_at.isoformat() if user.created_at else None,
            "saved_attacks": saved_attacks_count,
            "total_attacks": saved_attacks_count
        }
        
        return jsonify(user_data), 200

    except Exception as e:
        return jsonify({"message": "Error fetching user profile", "error": str(e)}), 500
    finally:
        if 'db' in locals():
            db.close()

@app.route("/forgot-password", methods=["POST"])
def forgot_password():
    try:
        data = request.get_json()
        email = data.get("email")
        new_password = data.get("newPassword")
        
        # Hash the new password
        hashed_password = bcrypt.hashpw(new_password.encode("utf-8"), bcrypt.gensalt())
        
        db = SessionLocal()
        user = db.query(User).filter(User.email == email).first()
        
        if user:
            user.password = hashed_password.decode("utf-8")
            db.commit()
            return jsonify({"message": "Password updated successfully"}), 200
        else:
            return jsonify({"message": "User not found"}), 404
            
    except Exception as e:
        return jsonify({"message": "Error updating password", "error": str(e)}), 500
    finally:
        if 'db' in locals():
            db.close()

if __name__ == "__main__":
    app.run(debug=True)
