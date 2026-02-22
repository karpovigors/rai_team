# Core App

This is the core app for the RAI project. It handles the main business logic.

## Description

The core app manages places and place reviews for the accessibility platform. It includes functionality for creating, reading, updating, and deleting places with accessibility information.

## Features

- Place management (CRUD operations)
- Place reviews system
- Accessibility information tracking
- Image handling for places
- Push notifications for updates
- Geocoding addresses using Yandex API

## Models

- `PlaceObject`: Represents a place with accessibility information
- `PlaceReview`: Represents a review for a place
- `PushSubscription`: Manages push notification subscriptions

## Views

- `objects_api`: Handles place listings and creation
- `object_detail`: Handles individual place details
- `object_image`: Serves place images
- `object_reviews`: Manages place reviews
- `push_subscriptions_api`: Manages push notification subscriptions
- `push_notify_api`: Sends push notifications

## Documentation

This module includes Doxygen-style documentation for all public classes, methods, and functions. To generate the documentation, run:

```bash
cd backend
doxygen Doxyfile
```

Documentation will be generated in the `docs/html` directory.