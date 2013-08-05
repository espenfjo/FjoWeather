/**
 * @license
 * Copyright 2013 Espen Fjellvær Olsen espen@mrfjo.org
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
var graphite = "http://graphite.mrfjo.org/render/";

var useUTC = false;

var metrics = metrics || [ {
    name: "Balkong",
    metricPath: "mrfjo.hjemme.temp.telldus.Balkong",
    type: "temperature",
    suffix: "°C",
    scale: "",
    dashboard: true,
    average: true
}, {
    name: "Soverom",
    metricPath: "mrfjo.hjemme.temp.telldus.Soverom",
    type: "temperature",
    suffix: "°C",
    dashboard: true,
    scale: "",
    average: true
}, {
    name: "Office desk",
    metricPath: "mrfjo.hjemme.temp.28-000002dcb9bc",
    type: "temperature",
    dashboard: false,
    suffix: "°C",
    scale: "0.001",
    average: true
}, {
    name: "Outside wall",
    metricPath: "mrfjo.hjemme.temp.28-0000044ddd1d",
    type: "temperature",
    dashboard: false,
    suffix: "°C",
    scale: "0.001",
    average: true
}, {
    name: "Barometer",
    metricPath: "mrfjo.hjemme.pressure.bmp085_pressure",
    type: "pressure",
    dashboard: true,
    suffix: "Pa",
    scale: "",
    average: false
}, {
    name: "Light",
    metricPath: "mrfjo.hjemme.light.tsl2561_lux",
    type: "light",
    dashboard: false,
    suffix: "lx",
    scale: "",
    average: false
}, {
    name: "Humidity",
    metricPath: "mrfjo.hjemme.humidity.dht11_humidity",
    type: "humidity",
    dashboard: false,
    suffix: "%",
    scale: "",
    average: false
} ];
