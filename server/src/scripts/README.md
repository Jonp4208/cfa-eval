# Leadership Subscription Management Scripts

These scripts help you manage leadership plan subscriptions for stores in the database.

## Prerequisites

Make sure your `.env` file contains the correct `MONGODB_URI` for your database.

## Available Scripts

### 1. Activate Leadership Subscription

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

### 2. Check Subscription Status

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

### 3. List All Store Subscriptions

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
