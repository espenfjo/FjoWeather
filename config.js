var graphite = "http://graphite.mrfjo.org/render/";

var loaded = 0;

$(function() {
    if (loaded === 0) {
        metrics = [ {
            name: "Balkong",
            metricPath: "mrfjo.hjemme.temp.telldus.Balkong",
            type: "temperature",
            suffix: "°C",
            scale: "",
            dashboard: true,
            single: false
        }, {
            name: "Soverom",
            metricPath: "mrfjo.hjemme.temp.telldus.Soverom",
            type: "temperature",
            suffix: "°C",
            dashboard: true,
            scale: "",
            single: ""
        }, {
            name: "Office desk",
            metricPath: "mrfjo.hjemme.temp.28-000002dcb9bc",
            type: "temperature",
            dashboard: false,
            suffix: "°C",
            scale: "0.001",
            single: ""
        }, {
            name: "Outside wall",
            metricPath: "mrfjo.hjemme.temp.28-0000044ddd1d",
            type: "temperature",
            dashboard: false,
            suffix: "°C",
            scale: "0.001",
            single: ""
        }, {
            name: "Barometer",
            metricPath: "mrfjo.hjemme.pressure.bmp085_pressure",
            type: "pressure",
            dashboard: true,
            suffix: "",
            scale: "Pa",
            single: true
        }, {
            name: "Light",
            metricPath: "mrfjo.hjemme.light.tsl2561_lux",
            type: "light",
            dashboard: false,
            suffix: "lx",
            scale: "",
            single: true
        }, {
            name: "Humidity",
            metricPath: "mrfjo.hjemme.humidity.dht11_humidity",
            type: "humidity",
            dashboard: false,
            suffix: "%",
            scale: "",
            single: true
        } ];
        loaded = 1;
    }
});
