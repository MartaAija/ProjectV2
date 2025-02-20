# Use Python 3.12 as the base image
FROM python:3.12-slim

# Set the working directory
WORKDIR /app

# Update packages and install Open vSwitch along with other dependencies
RUN apt update && \
    apt install -y openvswitch-switch iproute2 iputils-ping sudo && \
    apt clean

# Copy the requirements file and install Python dependencies
COPY backend/requirements.txt ./requirements.txt
RUN pip install -r requirements.txt

# Copy your application code to the container
COPY . .

# Expose the port Flask or FastAPI will run on
EXPOSE 5000

# Set the default command to run the app
CMD ["python", "main.py"]
