# Administrative Scripts

These scripts help you manage stores, subscriptions, and other administrative tasks for the application.

## Prerequisites

Make sure your `.env` file contains the correct `MONGODB_URI` for your database.

## Available Scripts

### 1. Add New Store (Interactive)

This script interactively adds a new store to the database.

```bash
node src/scripts/addStore.js
```

This will:
- Prompt you for store details (number, name, address, etc.)
- Prompt you for admin user details
- Create the store and admin user in the database
- Optionally activate leadership subscription for the store

### 2. Add New Store (Non-Interactive)

This script adds a new store using command line arguments.

```bash
node src/scripts/addStoreNonInteractive.js <storeNumber> <storeName> <storeAddress> <adminEmail> [adminName] [adminPosition] [activate-subscription]
```

Example:
```bash
node src/scripts/addStoreNonInteractive.js 01234 "Chick-fil-A Downtown" "123 Main St, Anytown, USA" admin@example.com "John Smith" "Store Director" activate-subscription
```

This will:
- Create a store with the provided details
- Create or update an admin user with the provided email
- Associate the admin user with the store
- Optionally activate leadership subscription if "activate-subscription" is provided

### 3. Activate Leadership Subscription

This script activates the leadership plans subscription for a specific store.

```bash
node src/scripts/activateLeadershipSubscription.js <storeNumber>
```

Example:
```bash
node src/scripts/activateLeadershipSubscription.js 01234
```

This will:
- Find the store with the given store number
- Create or update a subscription for that store
- Set the subscription status to "active"
- Enable the leadership plans feature
- Set the subscription period for one year from the current date
- Add a payment record of $499

### 4. Check Subscription Status

This script checks the subscription status for a specific store.

```bash
node src/scripts/checkSubscriptionStatus.js <storeNumber>
```

Example:
```bash
node src/scripts/checkSubscriptionStatus.js 01234
```

This will display:
- Subscription status (active, expired, etc.)
- Whether leadership plans are enabled
- Subscription period dates
- Days remaining in the subscription
- Payment history

### 5. List All Store Subscriptions

This script lists all stores and their subscription status.

```bash
node src/scripts/listStoreSubscriptions.js
```

This will display:
- All stores in the database
- Subscription status for each store
- Whether leadership plans are enabled for each store
- Expiry date for each subscription

## Notes

- These scripts are meant for administrative use only
- Make sure to run them from the root directory of the project
- You need to have the necessary permissions to access the database
- For the store creation scripts, ensure that the admin user has appropriate permissions
- After adding a new store, you may need to initialize default data (templates, positions, etc.)
- Always back up your database before running administrative scripts
