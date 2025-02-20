import os
import pandas as pd
import random

# Define the base directory of the current file (backend/)
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

# Construct the path to the network_data.csv file
network_data_path = os.path.join(BASE_DIR, '..', 'network', 'test_data.csv')

# Check if the file exists
if not os.path.exists(network_data_path):
    print(f"File not found at: {network_data_path}")
    print("Please check the file path and ensure the file exists.")
else:
    # Load the network dataset
    network_data = pd.read_csv(network_data_path)
    print("Dataset loaded successfully!")

    # Helper functions to generate random data
    def random_ip():
        """Generate a random IP address."""
        return ".".join(str(random.randint(1, 254)) for _ in range(4))

    def random_source_port():
        """Generate a random source port."""
        return random.randint(1024, 65535)

    def determine_protocol(dport):
        """Determine the protocol type based on destination port."""
        if dport in [80, 443, 22]:  # HTTP, HTTPS, SSH
            return "TCP"
        elif dport == 53:  # DNS
            return "UDP"
        else:
            return "TCP" if random.random() > 0.5 else "UDP"

    def generate_network_data():
        """Generate network data with all required columns."""
        # Add new network information columns
        network_data['Source IP'] = [random_ip() for _ in range(len(network_data))]
        network_data['Destination IP'] = [random_ip() for _ in range(len(network_data))]
        network_data['Source Port'] = [random_source_port() for _ in range(len(network_data))]
        network_data['Protocol'] = network_data['Destination Port'].apply(determine_protocol)
        
        # Reorder columns to place network information first
        columns = ['Source IP', 'Destination IP', 'Source Port', 'Destination Port', 'Protocol'] + \
                 [col for col in network_data.columns if col not in ['Source IP', 'Destination IP', 
                                                                    'Source Port', 'Destination Port', 'Protocol']]
        
        return network_data[columns]

    # Generate the enhanced network data
    enhanced_network_data = generate_network_data()
    
    # Save the enhanced data to a new file
    enhanced_data_path = os.path.join(BASE_DIR, '..', 'network', 'test_data_with_network_info.csv')
    enhanced_network_data.to_csv(enhanced_data_path, index=False)
    print(f"Enhanced network data saved to: {enhanced_data_path}")
