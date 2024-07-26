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










### Driver Side API Documentation for Flutter (Dart)

This documentation provides a comprehensive guide for frontend developers using Flutter (Dart) to integrate with the driver-side API of the e-hailing application.

## Overview

The driver-side API allows drivers to:
- Register and log in.
- Update their profile information.
- Update their location in real-time.
- Handle booking assignments and status updates.
- Manage earnings, rewards, and reviews.

## API Endpoints

### 1. **Authentication**

#### Register Driver

**Endpoint**: `POST /auth/register-driver`

**Description**: Registers a new driver.

**Request Parameters**:
- `email` (String): Driver's email.
- `password` (String): Driver's password.
- `firstname` (String): Driver's first name.
- `lastname` (String): Driver's last name.
- `dob` (String): Driver's date of birth.
- `phoneNumber` (String): Driver's phone number.
- `nrcNumber` (String): Driver's NRC number.
- `address` (String): Driver's address.

**Example Request**:
```dart
var response = await http.post(
  Uri.parse('http://yourapi.com/auth/register-driver'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'email': email,
    'password': password,
    'firstname': firstname,
    'lastname': lastname,
    'dob': dob,
    'phoneNumber': phoneNumber,
    'nrcNumber': nrcNumber,
    'address': address,
  }),
);
```

#### Sign In Driver

**Endpoint**: `POST /auth/signin-driver`

**Description**: Authenticates an existing driver.

**Request Parameters**:
- `email` (String): Driver's email.
- `password` (String): Driver's password.

**Example Request**:
```dart
var response = await http.post(
  Uri.parse('http://yourapi.com/auth/signin-driver'),
  headers: {'Content-Type': 'application/json'},
  body: jsonEncode({
    'email': email,
    'password': password,
  }),
);
```

#### Sign Out Driver

**Endpoint**: `POST /auth/signout-driver`

**Description**: Logs out the authenticated driver.

**Example Request**:
```dart
var response = await http.post(
  Uri.parse('http://yourapi.com/auth/signout-driver'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
);
```

### 2. **Profile Management**

#### Edit Driver Profile

**Endpoint**: `PUT /profile/edit`

**Description**: Edits the driver's profile information.

**Request Parameters**:
- `firstname` (String): Driver's first name.
- `lastname` (String): Driver's last name.
- `dob` (String): Driver's date of birth.
- `email` (String): Driver's email.
- `phoneNumber` (String): Driver's phone number.
- `nrcNumber` (String): Driver's NRC number.
- `address` (String): Driver's address.
- `vehicleInfo` (Map): Driver's vehicle information.

**Example Request**:
```dart
var response = await http.put(
  Uri.parse('http://yourapi.com/profile/edit'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
  body: jsonEncode({
    'firstname': firstname,
    'lastname': lastname,
    'dob': dob,
    'email': email,
    'phoneNumber': phoneNumber,
    'nrcNumber': nrcNumber,
    'address': address,
    'vehicleInfo': {
      'registrationNumber': registrationNumber,
      'licenseNumber': licenseNumber,
      'licenseExpirationDate': licenseExpirationDate,
      'brand': brand,
      'model': model,
      'seats': seats,
      'color': color,
      'category': category,
    },
  }),
);
```

#### Toggle Driver Availability

**Endpoint**: `POST /profile/toggle-availability`

**Description**: Toggles the driver's availability status between 'available' and 'unavailable'.

**Example Request**:
```dart
var response = await http.post(
  Uri.parse('http://yourapi.com/profile/toggle-availability'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
);
```

#### Get Driver Information

**Endpoint**: `GET /profile/info`

**Description**: Retrieves the driver's profile information.

**Example Request**:
```dart
var response = await http.get(
  Uri.parse('http://yourapi.com/profile/info'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
);
```

### 3. **Location Management**

#### Update Driver Location

**Endpoint**: `POST /driverlocation/update-location`

**Description**: Updates the driver's current location.

**Request Parameters**:
- `latitude` (double): Driver's current latitude.
- `longitude` (double): Driver's current longitude.

**Example Request**:
```dart
var response = await http.post(
  Uri.parse('http://yourapi.com/driverlocation/update-location'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
  body: jsonEncode({
    'latitude': latitude,
    'longitude': longitude,
  }),
);
```

#### Update FCM Token

**Endpoint**: `POST /driverlocation/update-fcm-token`

**Description**: Updates the driver's FCM token for push notifications.

**Request Parameters**:
- `fcmToken` (String): Driver's FCM token.

**Example Request**:
```dart
var response = await http.post(
  Uri.parse('http://yourapi.com/driverlocation/update-fcm-token'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
  body: jsonEncode({
    'fcmToken': fcmToken,
  }),
);
```

### 4. **Earnings and Statistics**

#### Get Total Earnings

**Endpoint**: `GET /driverstats/total-earnings`

**Description**: Retrieves the driver's total earnings.

**Example Request**:
```dart
var response = await http.get(
  Uri.parse('http://yourapi.com/driverstats/total-earnings'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
);
```

#### Update Driver Status

**Endpoint**: `POST /driverstats/update-status`

**Description**: Updates the driver's status (e.g., 'online' or 'offline').

**Request Parameters**:
- `status` (String): Driver's new status.

**Example Request**:
```dart
var response = await http.post(
  Uri.parse('http://yourapi.com/driverstats/update-status'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
  body: jsonEncode({
    'status': status,
  }),
);
```

#### Get Driver Statistics

**Endpoint**: `GET /driverstats/statistics`

**Description**: Retrieves the driver's statistics, including total earnings and completed rides.

**Example Request**:
```dart
var response = await http.get(
  Uri.parse('http://yourapi.com/driverstats/statistics'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
);
```

### 5. **Reviews**

#### Add Review

**Endpoint**: `POST /reviews/add`

**Description**: Adds a review for a driver after a ride is completed.

**Request Parameters**:
- `bookingId` (String): The booking ID.
- `driverId` (String): The driver ID.
- `rating` (int): The rating out of 5.
- `comment` (String): The review comment.

**Example Request**:
```dart
var response = await http.post(
  Uri.parse('http://yourapi.com/reviews/add'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
  body: jsonEncode({
    'bookingId': bookingId,
    'driverId': driverId,
    'rating': rating,
    'comment': comment,
  }),
);
```

#### Get Driver Reviews

**Endpoint**: `GET /reviews/driver/:driverId`

**Description**: Retrieves all reviews for a specific driver.

**Example Request**:
```dart
var response = await http.get(
  Uri.parse('http://yourapi.com/reviews/driver/$driverId'),
  headers: {
    'Content-Type': 'application/json',
    'Authorization': 'Bearer $token',
  },
);
```

## Flow of the Booking Process

### 1. Driver Registration and Login

- **Step 1**: The driver registers using the `/auth/register-driver` endpoint.
- **Step 2**: The driver logs in using the `/auth/signin-driver` endpoint.

### 2. Driver Updates Profile and Location

- **Step 3**: The driver updates their profile using the `/profile/edit` endpoint.
- **Step 4**: The driver updates their location in real-time using the `/driverlocation/update-location` endpoint.

### 3. Booking Assignment and Notifications

- **Step 5**: When a booking is assigned to the driver, the `listenForBookingAssignments` function listens for real-time updates and notifies the driver using FCM (Firebase Cloud Messaging).

### 4. Driver Manages Earnings and

 Reviews

- **Step 6**: The driver can check their total earnings using the `/driverstats/total-earnings` endpoint.
- **Step 7**: The driver can update their status (e.g., online or offline) using the `/driverstats/update-status` endpoint.
- **Step 8**: The driver can view their statistics, including total earnings and completed rides, using the `/driverstats/statistics` endpoint.
- **Step 9**: After a ride is completed, the user can add a review for the driver using the `/reviews/add` endpoint.
- **Step 10**: The driver can view their reviews using the `/reviews/driver/:driverId` endpoint.

### Notifications

- The driver must update their FCM token using the `/driverlocation/update-fcm-token` endpoint to receive push notifications.
- Notifications will be sent to the driver when a new booking is assigned, and other important events occur during the booking process.

## Example Flutter Implementation

### Register Driver

```dart
Future<void> registerDriver() async {
  var response = await http.post(
    Uri.parse('http://yourapi.com/auth/register-driver'),
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'email': email,
      'password': password,
      'firstname': firstname,
      'lastname': lastname,
      'dob': dob,
      'phoneNumber': phoneNumber,
      'nrcNumber': nrcNumber,
      'address': address,
    }),
  );

  if (response.statusCode == 200) {
    // Handle successful registration
  } else {
    // Handle error
  }
}
```

### Update Driver Location

```dart
Future<void> updateDriverLocation(double latitude, double longitude) async {
  var token = await getAuthToken(); // Implement this function to get the auth token
  var response = await http.post(
    Uri.parse('http://yourapi.com/driverlocation/update-location'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
    body: jsonEncode({
      'latitude': latitude,
      'longitude': longitude,
    }),
  );

  if (response.statusCode == 200) {
    // Handle successful location update
  } else {
    // Handle error
  }
}
```

### Add Review

```dart
Future<void> addReview(String bookingId, String driverId, int rating, String comment) async {
  var token = await getAuthToken(); // Implement this function to get the auth token
  var response = await http.post(
    Uri.parse('http://yourapi.com/reviews/add'),
    headers: {
      'Content-Type': 'application/json',
      'Authorization': 'Bearer $token',
    },
    body: jsonEncode({
      'bookingId': bookingId,
      'driverId': driverId,
      'rating': rating,
      'comment': comment,
    }),
  );

  if (response.statusCode == 200) {
    // Handle successful review submission
  } else {
    // Handle error
  }
}
```

## Conclusion

This documentation provides a comprehensive guide for integrating the driver-side API of the e-hailing application with a Flutter frontend. It covers authentication, profile management, location updates, booking assignments, earnings, and reviews. By following the provided examples, frontend developers can effectively utilize the API to build a robust and efficient driver-side application.