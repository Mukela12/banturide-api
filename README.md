## API Documentation for React Native Frontend Developer

### Server Configuration

The server is configured with the following endpoints:

- `/auth`: User authentication endpoints
- `/Booking`: Booking related endpoints
- `/profile`: User profile management endpoints
- `/payment`: Payment processing endpoints
- `/favorites`: Favorite locations management endpoints
- `/driverlocation`: Driver location management endpoints

### Booking Process Flow

1. **User Authentication**: The user needs to authenticate using Firebase Authentication.
2. **Booking Request**: The user sends a booking request with pickup and dropoff locations.
3. **Driver Search**: The server searches for available drivers within a certain radius.
4. **Driver Assignment**: The user selects a driver, and the server assigns the driver to the booking.
5. **Ride Start**: The driver starts the ride upon reaching the pickup location.
6. **Ride End**: The ride is marked as completed when the driver reaches the dropoff location.
7. **Payment Confirmation**: The payment for the ride is processed and confirmed.

### API Endpoints and Parameters

#### 1. User Authentication

**Endpoint**: `/auth`

Refer to the user authentication routes in `userRoutes.js`.

#### 2. Booking Request

**Endpoint**: `/Booking/request`

**Method**: `POST`

**Parameters**:
- `pickUpLatitude`: Latitude of the pickup location
- `pickUpLongitude`: Longitude of the pickup location
- `dropOffLatitude`: Latitude of the dropoff location
- `dropOffLongitude`: Longitude of the dropoff location
- `price`: Price of the ride
- `hasThirdStop`: Boolean indicating if there's a third stop
- `thirdStopLatitude`: Latitude of the third stop (if any)
- `thirdStopLongitude`: Longitude of the third stop (if any)

**Example**:

```javascript
async function requestBooking(pickUpLatitude, pickUpLongitude, dropOffLatitude, dropOffLongitude, price, hasThirdStop, thirdStopLatitude, thirdStopLongitude) {
    const token = await firebase.auth().currentUser.getIdToken(true);
    const response = await fetch('/Booking/request', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
            pickUpLatitude,
            pickUpLongitude,
            dropOffLatitude,
            dropOffLongitude,
            price,
            hasThirdStop,
            thirdStopLatitude,
            thirdStopLongitude
        })
    });

    const result = await response.json();
    if (response.ok) {
        console.log('Booking request successful:', result);
    } else {
        console.error('Error in booking request:', result);
    }
}
```

#### 3. Search for Drivers

**Endpoint**: `/Booking/search-drivers`

**Method**: `POST`

**Parameters**:
- `bookingId`: ID of the booking

**Example**:

```javascript
async function searchDrivers(bookingId) {
    const token = await firebase.auth().currentUser.getIdToken(true);
    const response = await fetch('/Booking/search-drivers', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId })
    });

    const result = await response.json();
    if (response.ok) {
        console.log('Drivers found:', result);
    } else {
        console.error('Error in searching drivers:', result);
    }
}
```

#### 4. Assign Driver to Booking

**Endpoint**: `/Booking/assign-driver`

**Method**: `POST`

**Parameters**:
- `bookingId`: ID of the booking
- `driverId`: ID of the selected driver

**Example**:

```javascript
async function assignDriver(bookingId, driverId) {
    const token = await firebase.auth().currentUser.getIdToken(true);
    const response = await fetch('/Booking/assign-driver', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId, driverId })
    });

    const result = await response.json();
    if (response.ok) {
        console.log('Driver assigned successfully:', result);
    } else {
        console.error('Error in assigning driver:', result);
    }
}
```

#### 5. Start Ride

**Endpoint**: `/Booking/start-ride`

**Method**: `POST`

**Parameters**:
- `bookingId`: ID of the booking

**Example**:

```javascript
async function startRide(bookingId) {
    const token = await firebase.auth().currentUser.getIdToken(true);
    const response = await fetch('/Booking/start-ride', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId })
    });

    const result = await response.json();
    if (response.ok) {
        console.log('Ride started successfully:', result);
    } else {
        console.error('Error in starting ride:', result);
    }
}
```

#### 6. End Ride

**Endpoint**: `/Booking/end-ride`

**Method**: `POST`

**Parameters**:
- `bookingId`: ID of the booking

**Example**:

```javascript
async function endRide(bookingId) {
    const token = await firebase.auth().currentUser.getIdToken(true);
    const response = await fetch('/Booking/end-ride', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId })
    });

    const result = await response.json();
    if (response.ok) {
        console.log('Ride ended successfully:', result);
    } else {
        console.error('Error in ending ride:', result);
    }
}
```

#### 7. Confirm Payment

**Endpoint**: `/payment/confirm-payment`

**Method**: `POST`

**Parameters**:
- `bookingId`: ID of the booking
- `amount`: Amount of the payment

**Example**:

```javascript
async function confirmPayment(bookingId, amount) {
    const token = await firebase.auth().currentUser.getIdToken(true);
    const response = await fetch('/payment/confirm-payment', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ bookingId, amount })
    });

    const result = await response.json();
    if (response.ok) {
        console.log('Payment confirmed successfully:', result);
    } else {
        console.error('Error in confirming payment:', result);
    }
}
```

#### 8. Update Driver Location

**Endpoint**: `/driverlocation/update-location`

**Method**: `POST`

**Parameters**:
- `latitude`: Latitude of the driver's current location
- `longitude`: Longitude of the driver's current location

**Example**:

```javascript
async function updateDriverLocation(latitude, longitude) {
    const token = await firebase.auth().currentUser.getIdToken(true);
    const response = await fetch('/driverlocation/update-location', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ latitude, longitude })
    });

    const result = await response.json();
    if (response.ok) {
        console.log('Location updated successfully:', result);
    } else {
        console.error('Error updating location:', result);
    }
}

// Example usage: Call this function periodically to update location
navigator.geolocation.watchPosition((position) => {
    const { latitude, longitude } = position.coords;
    updateDriverLocation(latitude, longitude);
}, (error) => {
    console.error('Error getting location:', error);
});
```

### Implementing Notifications

To implement notifications, you will use Firebase Cloud Messaging (FCM). Here are the steps:

1. **Set up FCM in your React Native app**.
2. **Send FCM tokens to your backend**.
3. **Modify backend endpoints to send notifications**.

#### 1. Set Up FCM in React Native

Follow the [official Firebase documentation](https://firebase.google.com/docs/cloud-messaging) to set up FCM in your React Native app.
