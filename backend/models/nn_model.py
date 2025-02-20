import joblib
import os
import pandas as pd
import numpy as np
import shap  # Import SHAP
from collections import defaultdict

# Define the base directory of the project (backend/)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Define paths for model files inside the models folder
model_path = os.path.join(BASE_DIR, 'random_forest_model.pkl')  # Absolute path to the model
scaler_path = os.path.join(BASE_DIR, 'scaler.pkl')  # Absolute path to the scaler
label_encoder_path = os.path.join(BASE_DIR, 'label_encoder.pkl')  # Absolute path to the label encoder

# Load the trained model (scikit-learn model)
model = joblib.load(model_path)

# Load the scaler used during training
scaler = joblib.load(scaler_path)

# Load the LabelEncoder for 'Attack Type'
le = joblib.load(label_encoder_path)

# Define the feature columns (model_columns)
model_columns = [
    'Destination Port', 'Flow Duration', 'Total Fwd Packets', 'Total Backward Packets',
    'Total Length of Fwd Packets', 'Total Length of Bwd Packets', 'Fwd Packet Length Max',
    'Fwd Packet Length Min', 'Fwd Packet Length Mean', 'Fwd Packet Length Std',
    'Bwd Packet Length Max', 'Bwd Packet Length Min', 'Bwd Packet Length Mean',
    'Bwd Packet Length Std', 'Flow Bytes/s', 'Flow Packets/s', 'Flow IAT Mean',
    'Flow IAT Std', 'Flow IAT Max', 'Flow IAT Min', 'Fwd IAT Total', 'Fwd IAT Mean',
    'Fwd IAT Std', 'Fwd IAT Max', 'Fwd IAT Min', 'Bwd IAT Total', 'Bwd IAT Mean',
    'Bwd IAT Std', 'Bwd IAT Max', 'Bwd IAT Min', 'Fwd PSH Flags', 'Fwd URG Flags',
    'Fwd Header Length', 'Bwd Header Length', 'Fwd Packets/s', 'Bwd Packets/s',
    'Min Packet Length', 'Max Packet Length', 'Packet Length Mean', 'Packet Length Std',
    'Packet Length Variance', 'FIN Flag Count', 'SYN Flag Count', 'RST Flag Count',
    'PSH Flag Count', 'ACK Flag Count', 'URG Flag Count', 'CWE Flag Count', 'ECE Flag Count',
    'Down/Up Ratio', 'Average Packet Size', 'Avg Fwd Segment Size', 'Avg Bwd Segment Size',
    'Fwd Header Length Extra', 'Subflow Fwd Packets', 'Subflow Fwd Bytes', 'Subflow Bwd Packets',
    'Subflow Bwd Bytes', 'Init_Win_bytes_forward', 'Init_Win_bytes_backward', 'act_data_pkt_fwd',
    'min_seg_size_forward', 'Active Mean', 'Active Std', 'Active Max', 'Active Min', 'Idle Mean',
    'Idle Std', 'Idle Max', 'Idle Min'
]

# Define feature statistics for unscaling
feature_stats = {
    'Destination Port': {'mean': 8071.48, 'std': 18283.63},
    'Flow Duration': {'mean': 14785663.93, 'std': 33653744.09},
    'Total Fwd Packets': {'mean': 9.36, 'std': 749.67},
    'Total Backward Packets': {'mean': 10.39, 'std': 997.39},
    'Total Length of Fwd Packets': {'mean': 549.30, 'std': 9993.59},
    'Total Length of Bwd Packets': {'mean': 16162.64, 'std': 2263088.05},
    'Fwd Packet Length Max': {'mean': 207.60, 'std': 717.18},
    'Fwd Packet Length Min': {'mean': 18.71, 'std': 60.34},
    'Fwd Packet Length Mean': {'mean': 58.20, 'std': 186.09},
    'Fwd Packet Length Std': {'mean': 68.91, 'std': 281.19},
    'Bwd Packet Length Max': {'mean': 870.85, 'std': 1946.37},
    'Bwd Packet Length Min': {'mean': 41.05, 'std': 68.86},
    'Bwd Packet Length Mean': {'mean': 305.95, 'std': 605.26},
    'Bwd Packet Length Std': {'mean': 335.33, 'std': 839.69},
    'Flow Bytes/s': {'mean': 3715.0378579999997, 'std': 1.0},  # Handling inf/NaN
    'Flow Packets/s': {'mean': 69.742244285, 'std': 1.0},  # Handling inf/NaN
    'Flow IAT Mean': {'mean': 1298448.71, 'std': 4507944.17},
    'Flow IAT Std': {'mean': 2919270.92, 'std': 8045869.78},
    'Flow IAT Max': {'mean': 9182475.32, 'std': 24459539.25},
    'Flow IAT Min': {'mean': 162379.56, 'std': 2950281.78},
    'Fwd IAT Total': {'mean': 14482961.73, 'std': 33575811.65},
    'Fwd IAT Mean': {'mean': 2610192.97, 'std': 9525722.49},
    'Fwd IAT Std': {'mean': 3266957.22, 'std': 9639055.40},
    'Fwd IAT Max': {'mean': 9042938.56, 'std': 24529157.40},
    'Fwd IAT Min': {'mean': 1021892.91, 'std': 8591436.34},
    'Bwd IAT Total': {'mean': 9893830.35, 'std': 28736614.20},
    'Bwd IAT Mean': {'mean': 1805783.77, 'std': 8887197.08},
    'Bwd IAT Std': {'mean': 1485973.35, 'std': 6278468.56},
    'Bwd IAT Max': {'mean': 4684692.43, 'std': 17160950.06},
    'Bwd IAT Min': {'mean': 967261.37, 'std': 8308983.09},
    'Fwd PSH Flags': {'mean': 0.05, 'std': 0.21},
    'Bwd PSH Flags': {'mean': 0.00, 'std': 0.00},
    'Fwd URG Flags': {'mean': 0.00, 'std': 0.01},
    'Bwd URG Flags': {'mean': 0.00, 'std': 0.00},
    'Fwd Header Length': {'mean': -25997.39, 'std': 21052857.87},
    'Bwd Header Length': {'mean': -2273.28, 'std': 1452208.94},
    'Fwd Packets/s': {'mean': 63865.35, 'std': 247537.13},
    'Bwd Packets/s': {'mean': 6995.19, 'std': 38151.70},
    'Min Packet Length': {'mean': 16.43, 'std': 25.24},
    'Max Packet Length': {'mean': 950.40, 'std': 2028.23},
    'Packet Length Mean': {'mean': 171.94, 'std': 305.49},
    'Packet Length Std': {'mean': 294.98, 'std': 631.80},
    'Packet Length Variance': {'mean': 486154.79, 'std': 1647489.87},
    'FIN Flag Count': {'mean': 0.04, 'std': 0.18},
    'SYN Flag Count': {'mean': 0.05, 'std': 0.21},
    'RST Flag Count': {'mean': 0.00, 'std': 0.02},
    'PSH Flag Count': {'mean': 0.30, 'std': 0.46},
    'ACK Flag Count': {'mean': 0.32, 'std': 0.46},
    'URG Flag Count': {'mean': 0.09, 'std': 0.29},
    'CWE Flag Count': {'mean': 0.00, 'std': 0.01},
    'ECE Flag Count': {'mean': 0.00, 'std': 0.02},
    'Down/Up Ratio': {'mean': 0.68, 'std': 0.68},
    'Average Packet Size': {'mean': 191.98, 'std': 331.86},
    'Avg Fwd Segment Size': {'mean': 58.20, 'std': 186.09},
    'Avg Bwd Segment Size': {'mean': 305.95, 'std': 605.26},
    'Fwd Header Length Extra': {'mean': -25997.39, 'std': 21052857.87},  # Renamed from Fwd Header Length.1
    'Fwd Avg Bytes/Bulk': {'mean': 0.00, 'std': 0.00},
    'Fwd Avg Packets/Bulk': {'mean': 0.00, 'std': 0.00},
    'Fwd Avg Bulk Rate': {'mean': 0.00, 'std': 0.00},
    'Bwd Avg Bytes/Bulk': {'mean': 0.00, 'std': 0.00},
    'Bwd Avg Packets/Bulk': {'mean': 0.00, 'std': 0.00},
    'Bwd Avg Bulk Rate': {'mean': 0.00, 'std': 0.00},
    'Subflow Fwd Packets': {'mean': 9.36, 'std': 749.67},
    'Subflow Fwd Bytes': {'mean': 549.29, 'std': 9980.07},
    'Subflow Bwd Packets': {'mean': 10.39, 'std': 997.39},
    'Subflow Bwd Bytes': {'mean': 16162.30, 'std': 2263057.28},
    'Init_Win_bytes_forward': {'mean': 6989.84, 'std': 14338.73},
    'Init_Win_bytes_backward': {'mean': 1989.43, 'std': 8456.88},
    'act_data_pkt_fwd': {'mean': 5.42, 'std': 636.43},
    'min_seg_size_forward': {'mean': -2741.69, 'std': 1084989.38},
    'Active Mean': {'mean': 81551.32, 'std': 648599.94},
    'Active Std': {'mean': 41134.12, 'std': 393381.52},
    'Active Max': {'mean': 153182.52, 'std': 1025824.97},
    'Active Min': {'mean': 58295.82, 'std': 577092.28},
    'Idle Mean': {'mean': 8316036.63, 'std': 23630078.58},
    'Idle Std': {'mean': 503843.95, 'std': 4602984.48},
    'Idle Max': {'mean': 8695751.98, 'std': 24366888.33},
    'Idle Min': {'mean': 7920031.01, 'std': 23363418.93}
}

# Dictionary to store feature frequency for each attack type
attack_feature_stats = {
    'DoS': defaultdict(int),
    'DDoS': defaultdict(int),
    'Port Scan': defaultdict(int),
    'Brute Force': defaultdict(int),
    'Bot': defaultdict(int),
    'Web Attack': defaultdict(int)
}

# Add this function to get the statistics
def get_attack_feature_stats():
    """
    Get the current statistics of influential features for each attack type.
    Returns a dictionary with attack types and their feature frequencies.
    """
    return {
        attack_type: dict(frequencies)
        for attack_type, frequencies in attack_feature_stats.items()
    }

def process_network_traffic(df):
    """
    Process the incoming network traffic data.
    Scale the data using the same scaler used in training.
    """
    try:
        # Store display columns
        display_columns = ['Source IP', 'Destination IP', 'Source Port', 'Protocol']
        display_data = df[display_columns].copy()
        
        # Drop non-numeric columns and labels
        columns_to_drop = ['Attack Type', 'Source IP', 'Destination IP', 'Source Port', 'Protocol', 'Label']
        df_for_prediction = df.drop(columns=columns_to_drop, errors='ignore')
        
        # Ensure columns match exactly with model_columns and in the same order
        df_for_prediction = df_for_prediction.reindex(columns=model_columns, fill_value=0)
        
        # Scale the data using the same scaler used in training
        X = scaler.transform(df_for_prediction)
        
        # Make predictions
        predictions = model.predict(X)
        predicted_probabilities = model.predict_proba(X)
        
        # Debug print predictions
        print(f"Prediction: {predictions[0]}")
        print(f"Probabilities: {predicted_probabilities[0]}")
        
        # Check if we have valid predictions
        if len(predictions) == 0 or len(predicted_probabilities) == 0:
            raise ValueError("No predictions generated")
            
        # Get the first prediction and probability
        prediction = predictions[0]
        probability = predicted_probabilities[0]
        
        # Generate explanation using the scaled data
        shap_explanation = explain_with_shap(
            scaled_data=X,
            row_index=0,
            model_columns=model_columns
        ) or {'interpretation': '', 'feature_importance': {}}
        
        # Unscale only the specific values needed for frontend display
        frontend_values = {}
        columns_to_unscale = [
            'Destination Port', 'Flow Duration', 'Flow Bytes/s',
            'Total Fwd Packets', 'Total Backward Packets', 'Flow Packets/s',
            'Fwd Packet Length Mean', 'Fwd Packet Length Max', 'Fwd Packet Length Min',
            'Bwd Packet Length Mean', 'Bwd Packet Length Max', 'Bwd Packet Length Min',
            'Fwd IAT Mean', 'Fwd IAT Max', 'Fwd IAT Min',
            'Bwd IAT Mean', 'Bwd IAT Max', 'Bwd IAT Min',
            'PSH Flag Count', 'ACK Flag Count', 'SYN Flag Count',
            'Active Mean', 'Active Max', 'Active Min',
            'Idle Mean', 'Idle Max', 'Idle Min'
        ]

        for column in columns_to_unscale:
            if column in feature_stats and column in df_for_prediction:
                scaled_value = float(df_for_prediction[column].iloc[0])
                mean = feature_stats[column]['mean']
                std = feature_stats[column]['std']
                
                # Unscale: original = (scaled * std) + mean
                unscaled_value = scaled_value * std + mean
                
                # Ensure non-negative values for ports and durations
                if column in ['Destination Port', 'Flow Duration']:
                    unscaled_value = max(0, unscaled_value)
                    
                # Round port numbers to integers
                if column == 'Destination Port':
                    unscaled_value = int(round(unscaled_value))
                else:
                    unscaled_value = round(unscaled_value, 2)  # Format to two decimal places
                
                frontend_values[column] = unscaled_value
        
        # After getting SHAP explanation, update the feature statistics
        if prediction in attack_feature_stats:
            # Update frequency counters for the top features
            for feature in shap_explanation.get('feature_importance', {}).keys():
                attack_feature_stats[prediction][feature] += 1

        # Create response with unscaled values for frontend
        response_data = {
            'Source IP': str(display_data['Source IP'].iloc[0]),
            'Destination IP': str(display_data['Destination IP'].iloc[0]),
            'Source Port': int(display_data['Source Port'].iloc[0]),
            'Protocol': str(display_data['Protocol'].iloc[0]),
            'traffic_stats': frontend_values,
            'prediction': prediction,
            'recommendation': recommendation(prediction, shap_explanation.get('feature_importance', [])),
            'interpretation': shap_explanation.get('interpretation', ''),
            'feature_importance': shap_explanation.get('feature_importance', {}),
            'confidence_score': float(max(probability) * 100),
            'attack_feature_stats': get_attack_feature_stats()  # Add the statistics to the response
        }
        
        return pd.DataFrame([response_data])
        
    except Exception as e:
        print(f"Error during processing: {e}")
        import traceback
        traceback.print_exc()
        return None


def explain_with_shap(scaled_data, row_index, model_columns):
    """
    Generate feature importance explanations using SHAP values for a specific instance.
    """
    try:
        # Convert scaled_data to numpy array if it's a DataFrame
        if isinstance(scaled_data, pd.DataFrame):
            instance = scaled_data.values  # Get the entire dataset as a 2D array
        else:
            instance = scaled_data  # Assume it's already a NumPy array

        # Create the SHAP explainer for the Random Forest model
        explainer = shap.TreeExplainer(model)  # Use the Random Forest model

        # Calculate SHAP values for the entire dataset
        shap_values = explainer.shap_values(instance)

        # Check if shap_values is a list (for multi-class)
        if isinstance(shap_values, list):
            # Get SHAP values for the predicted class of the specific row
            predicted_class = np.argmax(model.predict_proba(instance[row_index:row_index + 1])[0])
            shap_value_for_instance = shap_values[predicted_class][row_index]  # Access the SHAP values for the predicted class
        else:
            shap_value_for_instance = shap_values[row_index]  # Single class case

        # Ensure shap_value_for_instance is a 1D array
        if isinstance(shap_value_for_instance, np.ndarray) and shap_value_for_instance.ndim > 1:
            shap_value_for_instance = shap_value_for_instance.flatten()

        # Calculate feature importance from SHAP values
        feature_importance = {model_columns[i]: float(shap_value_for_instance[i]) for i in range(len(model_columns))}

        # Filter for positive contributions only
        positive_features = {feature: importance for feature, importance in feature_importance.items() if importance > 0}

        # Sort features by importance and get top 5
        sorted_positive_features = dict(sorted(
            positive_features.items(), 
            key=lambda x: x[1], 
            reverse=True
        )[:5])  # Get top 5 features

        # Generate interpretation with feature frequencies
        interpretation = "Top 5 Positive SHAP values for the instance:\n"
        interpretation += "\n".join([
            f"{feature}: {importance:.3f}" 
            for feature, importance in sorted_positive_features.items()
        ])

        # Add attack type statistics to interpretation
        interpretation += "\n\nFeature Frequency by Attack Type:\n"
        for attack_type, features in attack_feature_stats.items():
            if features:  # Only show attacks that have recorded features
                interpretation += f"\n{attack_type}:\n"
                sorted_features = sorted(
                    features.items(),
                    key=lambda x: x[1],
                    reverse=True
                )
                interpretation += "\n".join([
                    f"  {feature}: {count} times"
                    for feature, count in sorted_features
                ])

        return {
            'interpretation': interpretation,
            'feature_importance': sorted_positive_features
        }

    except Exception as e:
        print(f"Error in SHAP explanation: {str(e)}")
        return {
            'interpretation': 'Feature importance analysis unavailable',
            'feature_importance': {}
        }




def recommendation(attack_type, influential_features):
    """
    Generate detailed recommendations based on attack type and specific influential features.
    """
    base_recommendation = ""
    detailed_recommendations = []
    
    if attack_type == 'BENIGN':
        base_recommendation = "Traffic appears to be normal."
        
        if 'Destination Port' in influential_features:
            detailed_recommendations.append(
                "Standard destination port usage indicates normal application traffic patterns."
            )
        if 'SYN Flag Count' in influential_features:
            detailed_recommendations.append(
                "Normal SYN flag patterns suggest regular connection establishment behavior."
            )
        if 'Total Length of Fwd Packets' in influential_features:
            detailed_recommendations.append(
                "Forward packet lengths show typical data transfer patterns consistent with normal traffic."
            )
        if 'Subflow Bwd Packets' in influential_features:
            detailed_recommendations.append(
                "Backward packet flow indicates normal response patterns from server to client."
            )
        if 'Bwd IAT Max' in influential_features:
            detailed_recommendations.append(
                "Maximum inter arrival time for backward packets shows regular server response timing."
            )
        if 'Active Std' in influential_features:
            detailed_recommendations.append(
                "Standard deviation of active time indicates consistent connection behavior."
            )
        if 'Flow Bytes/s' in influential_features:
            detailed_recommendations.append(
                "Byte flow rate falls within normal ranges for legitimate traffic."
            )
        if 'Fwd Packet Length Min' in influential_features:
            detailed_recommendations.append(
                "Minimum forward packet length shows expected protocol behavior."
            )
        if 'Bwd Packets/s' in influential_features:
            detailed_recommendations.append(
                "Rate of backward packets indicates normal server response patterns."
            )
        
        # Add general confirmation for benign only if there are detailed recommendations
        if len(detailed_recommendations) > 0:
            detailed_recommendations.append(
                "These network characteristics strongly indicate legitimate traffic patterns. Continue monitoring but no immediate action required."
            )

    elif attack_type == 'DoS':
        base_recommendation = "DoS attack detected. Monitor traffic and identify attack sources."
        
        if 'Fwd Header Length' in influential_features:
            detailed_recommendations.append(
                "High Forward Header Length detected → Implement packet header inspection and filtering"
            )
        if 'Idle Std' in influential_features:
            detailed_recommendations.append(
                "Unusual idle time patterns detected → Consider implementing traffic rate analysis"
            )
        if 'Total Length of Fwd Packets' in influential_features:
            detailed_recommendations.append(
                "Abnormal forward packet lengths → Set up packet size monitoring and filtering rules"
            )
        if 'URG Flag Count' in influential_features:
            detailed_recommendations.append(
                "High URG flag usage detected → Configure firewall to handle URG flag abuse"
            )
        if 'act_data_pkt_fwd' in influential_features:
            detailed_recommendations.append(
                "Unusual active data packet patterns → Implement active connection monitoring"
            )
        if 'Packet Length Std' in influential_features:
            detailed_recommendations.append(
                "Unusual packet size variation → Monitor packet size distributions"
            )
        if 'Total Backward Packets' in influential_features:
            detailed_recommendations.append(
                "High volume of backward packets → Set up volumetric analysis and filtering"
            )
        if 'Fwd Packets/s' in influential_features:
            detailed_recommendations.append(
                "High packet rate → Implement rate limiting per source"
            )
        if 'Fwd Packet Length Max' in influential_features:
            detailed_recommendations.append(
                "Large forward packets detected → Set maximum packet size limits"
            )
        if 'Flow IAT Max' in influential_features:
            detailed_recommendations.append(
                "Unusual flow timing patterns → Set up flow timing analysis"
            )
        if 'Bwd IAT Total' in influential_features:
            detailed_recommendations.append(
                "Abnormal backward timing total → Monitor cumulative timing patterns"
            )
        if 'Bwd Header Length' in influential_features:
            detailed_recommendations.append(
                "Abnormal backward header size → Monitor and filter suspicious header patterns"
            )
        if 'CWE Flag Count' in influential_features:
            detailed_recommendations.append(
                "Unusual CWE flag patterns → Monitor congestion window behavior"
            )
        if 'SYN Flag Count' in influential_features:
            detailed_recommendations.append(
                "High SYN flag count → Enable SYN flood protection mechanisms"
            )
        if 'Destination Port' in influential_features:
            detailed_recommendations.append(
                "Suspicious port targeting → Implement port-based traffic filtering"
            )
        
        if detailed_recommendations:  # Only add final recommendation for attacks
            detailed_recommendations.append(
                "These recommendations should be implemented to mitigate the attack."
            )

    elif attack_type == 'DDoS':
        base_recommendation = "DDoS attack detected. Traffic overload, consider blocking source IPs."
        
        if 'ACK Flag Count' in influential_features:
            detailed_recommendations.append(
                "High ACK flag count → Implement SYN cookie protection and ACK flood protection."
            )
        if 'Fwd URG Flags' in influential_features:
            detailed_recommendations.append(
                "URG flag abuse detected → Configure firewall rules to handle URG flag misuse."
            )
        if 'Init_Win_bytes_backward' in influential_features:
            detailed_recommendations.append(
                "Unusual window size patterns → Adjust TCP window size parameters."
            )
        if 'Total Backward Packets' in influential_features:
            detailed_recommendations.append(
                "High volume of backward packets → Implement bandwidth throttling for suspected sources."
            )
        if 'Fwd IAT Min' in influential_features:   
            detailed_recommendations.append(
                "Very small forward packet timing intervals → Set up minimum Inter-Arrival Time thresholds"
            )
        if 'Packet Length Mean' in influential_features:
            detailed_recommendations.append(
                "Abnormal packet length patterns → Set up packet size filtering rules."
            )

    elif attack_type == 'Brute Force':
        base_recommendation = "Brute force attack detected. Consider rate-limiting or blocking IPs."
        
        if 'ACK Flag Count' in influential_features:
            detailed_recommendations.append(
                "High ACK flag count → Implement progressive delays between login attempts"
            )
        if 'Down/Up Ratio' in influential_features:
            detailed_recommendations.append(
                "Unusual Down/Up Ratio → Monitor and limit asymmetric traffic patterns"
            )
        if 'Init_Win_bytes_forward' in influential_features:
            detailed_recommendations.append(
                "Abnormal window size → Implement connection throttling"
            )
        if 'PSH Flag Count' in influential_features:
            detailed_recommendations.append(
                "High PSH flag usage → Set up request rate limiting per IP"
            )
        if 'min_seg_size_forward' in influential_features:
            detailed_recommendations.append(
                "Unusual segment size → Monitor and filter suspicious packet sizes"
            )
        if 'Fwd IAT Max' in influential_features:
            detailed_recommendations.append(
                "High forward inter-arrival time → Implement timing-based access controls"
            )
        if 'Fwd PSH Flags' in influential_features:
            detailed_recommendations.append(
                "Suspicious PSH flag patterns → Monitor and limit rapid connection attempts"
            )
        if 'SYN Flag Count' in influential_features:
            detailed_recommendations.append(
                "Unusual ACK flag patterns → Monitor ACK flag frequency"
            )
        if 'Bwd Header Length' in influential_features:    # Score: 1
            detailed_recommendations.append(
                "Abnormal backward header length → Inspect response header patterns"
            )
        if 'CWE Flag Count' in influential_features:    # Score: 1
            detailed_recommendations.append(
                "Unusual CWE flag usage → Monitor congestion window flags"
            )
        if 'Fwd Packet Length Std' in influential_features:    # Score: 1
            detailed_recommendations.append(
                "Irregular forward packet length variation → Analyze packet size patterns"
            )
        if 'min_seg_size_forward' in influential_features:    # Score: 1
            detailed_recommendations.append(
                "Unusual minimum segment size → Monitor TCP segment size patterns"
            )
        if 'Total Fwd Packets' in influential_features:
            detailed_recommendations.append(
                "Unusual number of forward packets → Set up packet volume monitoring and thresholds"
            )

    elif attack_type == 'Port Scan':
        base_recommendation = "Port scan detected. Investigate for potential reconnaissance activity."
        
        if 'Bwd Header Length' in influential_features:
            detailed_recommendations.append(
                "Unusual backward header length → Implement port scan detection rules"
            )
        if 'CWE Flag Count' in influential_features:
            detailed_recommendations.append(
                "CWE flag anomalies → Monitor and block suspicious flag patterns"
            )
        if 'Destination Port' in influential_features:
            detailed_recommendations.append(
                "Multiple destination ports → Set up port scan rate limiting"
            )
        if 'min_seg_size_forward' in influential_features:
            detailed_recommendations.append(
                "Small segment sizes detected → Configure minimum segment size requirements"
            )
        if 'Flow Duration' in influential_features:
            detailed_recommendations.append(
                "Short flow durations → Implement connection attempt rate limiting"
            )
        if 'Bwd Packet Length Mean' in influential_features:
            detailed_recommendations.append(
                "Unusual backward packet length mean → Monitor response packet sizes for scan patterns"
            )
        if 'Packet Length Variance' in influential_features:
            detailed_recommendations.append(
                "Abnormal packet length variance → Set up packet size variation monitoring for scan detection"
            )
        if 'Total Fwd Packets' in influential_features:
            detailed_recommendations.append(
                "High number of forward packets → Monitor and limit rapid connection attempts per source"
            )    

    elif attack_type == 'Bot':
        base_recommendation = "Bot/Automated Traffic Detected."
        
        if 'Bwd IAT Min' in influential_features:
            detailed_recommendations.append(
                "Suspicious backward packet timing → Implement timing analysis for bot detection"
            )
        if 'Flow Duration' in influential_features:
            detailed_recommendations.append(
                "Unusual flow duration patterns → Set up flow duration monitoring"
            )
        if 'RST Flag Count' in influential_features:
            detailed_recommendations.append(
                "Abnormal RST flags → Monitor for connection reset patterns"
            )
        if 'Subflow Bwd Bytes' in influential_features:
            detailed_recommendations.append(
                "Suspicious backward traffic volume → Analyze traffic symmetry"
            )
        if 'Fwd Packet Length Mean' in influential_features:
            detailed_recommendations.append(
                "Uniform packet sizes → Implement packet size variance checks"
            )
        if 'Bwd Header Length' in influential_features:
            detailed_recommendations.append(
                "Unusual header lengths → Monitor header patterns"
            )
        if 'Min Packet Length' in influential_features:
            detailed_recommendations.append(
                "Consistent minimum packet sizes → Set up packet size profiling"
            )
        if 'Destination Port' in influential_features:
            detailed_recommendations.append(
                "Port targeting patterns → Implement port hopping detection"
            )
        if 'Bwd IAT Max' in influential_features:
            detailed_recommendations.append(
                "Maximum backward timing anomalies → Set up timing-based detection rules"
            )

    elif attack_type == 'Web Attack':
        base_recommendation = "Web attack detected. Review web application security."
        
        if 'Active Mean' in influential_features:
            detailed_recommendations.append(
                "Unusual activity patterns → Implement request rate monitoring"
            )
        if 'Bwd Header Length' in influential_features:
            detailed_recommendations.append(
                "Suspicious header lengths → Set up header inspection and filtering"
            )
        if 'ECE Flag Count' in influential_features:
            detailed_recommendations.append(
                "ECE flag anomalies → Monitor and analyze flag usage patterns"
            )
        if 'Fwd Packet Length Max' in influential_features:
            detailed_recommendations.append(
                "Large packet sizes → Implement payload size restrictions"
            )
        if 'Fwd Packets/s' in influential_features:
            detailed_recommendations.append(
                "High packet rate → Set up rate limiting per client"
            )
        if 'Fwd Packet Length Max' in influential_features:
            detailed_recommendations.append(
                "Large packet sizes detected → Implement payload size restrictions and content length validation"
            )
        if 'Bwd IAT Std' in influential_features:
            detailed_recommendations.append(
                "Irregular backward timing → Monitor response timing patterns for potential SQL injection"
            )
        if 'Destination Port' in influential_features:
            detailed_recommendations.append(
                "Unusual port targeting → Restrict access to sensitive ports and implement port filtering"
            )
        if 'Idle Min' in influential_features:
            detailed_recommendations.append(
                "Minimal idle time → Monitor for automated attack patterns and bot activity"
            )
        if 'SYN Flag Count' in influential_features:
            detailed_recommendations.append(
                "High SYN count → Implement SYN flood protection and connection rate limiting"
            )
        if 'Total Length of Fwd Packets' in influential_features:
            detailed_recommendations.append(
                "Abnormal packet lengths → Monitor for large payloads indicating potential XSS or injection attacks"
            )

    else:
        return "Unknown attack type. Further investigation required."

    # Combine recommendations
    full_recommendation = base_recommendation
    for rec in detailed_recommendations:
        full_recommendation += f"\n{rec}"

    return full_recommendation