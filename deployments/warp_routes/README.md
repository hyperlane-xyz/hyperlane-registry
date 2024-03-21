Directory structure is as follows:

```
<ASSET_SYMBOL>/<ORIGIN_CHAIN>/<DESTINATION_CHAIN>/addresses.json
```

Addresses are keyed by their token router type:

```typescript
enum TokenType {
  synthetic,
  collateral,
  native,
}
```
