## Routing


My Sensor Protocol:

```
node-id;child-sensor-id;message-type;ack;sub-type;payload
```


Translation:
```
{
  radioId,
  sensorId,
  sensorType,
  readings: [{
    type,
    value
  }]
}
```