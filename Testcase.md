# Test Cases

## Add valid email
```graphql
mutation {
  addToWaitlist(email: "john.doe@gmail.com") {
    email
    isRegistered
    registeredAt
  }
}
```

## Check status for registered email
```graphql
query {
  getWaitlistStatus(email: "john.doe@gmail.com") {
    email
    isRegistered
    registeredAt
  }
}
```

## Invalid email format
```graphql
mutation {
  addToWaitlist(email: "notanemail") {
    email
    isRegistered
  }
}
```

## Add duplicate email (run twice)
```graphql
mutation {
  addToWaitlist(email: "duplicate@test.com") {
    email
    isRegistered
  }
}
```

## Case insensitive check
```graphql
mutation {
  addToWaitlist(email: "TestUser@Example.COM") {
    email
    isRegistered
  }
}

query {
  getWaitlistStatus(email: "testuser@example.com") {
    email
    isRegistered
  }
}
```

## Email with spaces
```graphql
mutation {
  addToWaitlist(email: "  spaced@email.com  ") {
    email
    isRegistered
  }
}
```

## Check non-existent email
```graphql
query {
  getWaitlistStatus(email: "notfound@example.com") {
    email
    isRegistered
    registeredAt
  }
}
```

## Invalid email in query
```graphql
query {
  getWaitlistStatus(email: "bad-email") {
    email
    isRegistered
  }
}
```

## Email with plus sign
```graphql
mutation {
  addToWaitlist(email: "user+tag@example.com") {
    email
    isRegistered
  }
}
```

## Empty email
```graphql
mutation {
  addToWaitlist(email: "") {
    email
    isRegistered
  }
}
```

## Email with subdomain
```graphql
mutation {
  addToWaitlist(email: "user@subdomain.example.com") {
    email
    isRegistered
  }
}
```

## Multiple emails
```graphql
mutation {
  addToWaitlist(email: "user1@test.com") {
    email
    isRegistered
  }
}

mutation {
  addToWaitlist(email: "user2@test.com") {
    email
    isRegistered
  }
}

mutation {
  addToWaitlist(email: "user3@test.com") {
    email
    isRegistered
  }
}
```
