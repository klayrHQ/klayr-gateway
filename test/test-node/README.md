# Getting Started with Klayr Blockchain Client

This project was bootstrapped with [Klayr SDK](https://github.com/klayrhq/klayr-sdk)

### Start a node

```
./bin/run start
```

### Send tokens

```
./bin/run transaction:create token transfer 10000000 --params='{"tokenID": "0400000000000000", "amount": "100000000", "recipientAddress": "kly4mba244me87reyg9fegcy2cesdfw6gq9r8we5x", "data": ""}' --json --pretty
```

### Add a new module

```
klayr generate:module ModuleName
// Example
klayr generate:module token
```

### Add a new command

```
klayr generate:command ModuleName Command
// Example
klayr generate:command token transfer
```

### Add a new plugin

```
klayr generate:plugin PluginName
// Example
klayr generate:plugin httpAPI
```

## Learn More

You can learn more in the [documentation](https://klayr.xyz/documentation/klayr-sdk/).
