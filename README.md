# A Map of Becoming
Live Website: https://oyeakinsulire.github.io/A-Map-Of-Becoming/
*A Map of Becoming* is a data visualisation and sensing project exploring the transition between **Wanderer** (chaos, restlessness) and **Solace** (peace, stillness).

Using data collected from a **Pulse Sensor**, **GSR Sensor**, and **Environmental Sound Sensor** through an **Arduino Uno**, the project transforms bodily and environmental conditions into generative visual landscapes.

Sensor data is transmitted from Arduino to Python via Serial communication, logged as CSV files, processed using **pandas**, and visualised using **p5.js**. The resulting visuals shift between calm, oceanic forms and fragmented, chaotic abstractions based on changing sensor values.

Rather than measuring emotion directly, the project explores how physiological and environmental data can be interpreted as traces of human experience, creating a living visual portrait of becoming.

## Technologies

* Arduino Uno
* Pulse Sensor
* GSR Sensor
* Environmental Sound Sensor
* Python
* Pandas
* PySerial
* p5.js

## Workflow

```text
Sensors → Arduino → Python → CSV → Pandas → p5.js Visualisation
```
