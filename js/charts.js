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
function temperature(name, metricPath, id) {
    $("#graphs").append('<div id="' + name + '" class="col-md-2"></div>');
    var chart;
    var options = {
        chart: {
            renderTo: name,
            type: "column",
            width: 200,
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false,
            events: {
                load: liveData(metricPath, $(this), id)
            }
        },
        plotOptions: {
            column: {
                pointWidth: 10
            }
        },
        legend: {
            enabled: false
        },
        title: {
            text: name
        },
        xAxis: {
            categories: ""
        },
        series: [ {
            name: "Temperature",
            data: [],
            tooltip: {
                valueSuffix: " °C"
            }
        } ]
    };
    $.ajax({
        async: true,
        dataType: "json",
        url: graphite + "?target=" + metricPath + "&from=-60minutes&format=json",
        success: function(point) {
            point = point[0].datapoints;
            var data = getLatestPoint(point);
            options.series[0].data = [ data[0] ];
            chart = new Highcharts.Chart(options);
        },
        cache: false
    });
}

function pressure(name, metricPath, id) {
    $("#graphs").append('<div class="row presrow" id="pressuregroup"></div>');
    $("#pressuregroup").append('<div id="barometer" class="col-md-4"></div>');
    var chart, now;
    var options = {
        chart: {
            renderTo: "barometer",
            type: "gauge",
            plotBackgroundColor: null,
            plotBackgroundImage: null,
            plotBorderWidth: 0,
            plotShadow: false,
            events: {
                load: liveData(metricPath, $(this), id)
            }
        },
        title: {
            text: "Pressure"
        },
        pane: {
            startAngle: -120,
            endAngle: 120,
            background: [ {
                backgroundColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [ [ 0, "#FFF" ], [ 1, "#333" ] ]
                },
                borderWidth: 0,
                outerRadius: "109%"
            }, {
                backgroundColor: {
                    linearGradient: {
                        x1: 0,
                        y1: 0,
                        x2: 0,
                        y2: 1
                    },
                    stops: [ [ 0, "#333" ], [ 1, "#FFF" ] ]
                },
                borderWidth: 1,
                outerRadius: "107%"
            }, {}, {
                backgroundColor: "#DDD",
                borderWidth: 0,
                outerRadius: "105%",
                innerRadius: "103%"
            } ]
        },
        xAxis: {
            categories: [ "" ]
        },
        yAxis: {
            min: 95e3,
            max: 105e3,
            minorTickInterval: "auto",
            minorTickWidth: 1,
            minorTickLength: 10,
            minorTickPosition: "inside",
            minorTickColor: "#666",
            tickPixelInterval: 30,
            tickWidth: 2,
            tickPosition: "inside",
            tickLength: 10,
            tickColor: "#666",
            labels: {
                step: 2,
                rotation: "auto"
            },
            title: {
                text: "Pa"
            },
            plotOptions: {
                gauge: {
                    dial: {}
                }
            },
            plotBands: [ {
                from: 95e3,
                to: 98e3,
                color: "#DF5353"
            }, {
                from: 98e3,
                to: 99e3,
                color: "#DDDF0D"
            }, {
                from: 99e3,
                to: 101e3,
                color: "#55BF3B"
            }, {
                from: 101e3,
                to: 102e3,
                color: "#DDDF0D"
            }, {
                from: 102e3,
                to: 105e3,
                color: "#DF5353"
            } ]
        },
        series: [ {
            name: "Pressure",
            data: [],
            tooltip: {
                valueSuffix: " Pa"
            }
        } ]
    };
    $.ajax({
        async: true,
        dataType: "json",
        url: graphite + "?target=" + metricPath + "&from=-20minutes&format=json",
        success: function(point) {
            point = point[0].datapoints;
            var data = getLatestPoint(point);
            options.series[0].data = [ data[0] ];
            now = data[0];
            chart = new Highcharts.Chart(options);
            pressureProgonosis(metricPath, now);
        },
        cache: false
    });
}

function pressureProgonosis(metricPath, pNow) {
    var name = "Pressure over time";
    var pressures = [];
    $("#pressuregroup").append('<div id="pgprog" "class="row"></div>');
    $("#pgprog").append('<div id="climacon"></div>');
    $("#pgprog").append('<div id="' + name + '" class="pgelement col-md-2"></div>');
    var chart;
    var options = {
        chart: {
            renderTo: name,
            type: "column",
            width: 200,
            height: 200,
            events: {
                load: liveData(metricPath, $(this), id)
            }
        },
        plotOptions: {
            column: {
                pointWidth: 10
            }
        },
        legend: {
            enabled: false
        },
        title: {
            text: name
        },
        xAxis: {
            categories: [ "" ]
        },
        yAxis: {},
        series: [ {} ]
    };
    metricPath = "movingMedian(" + metricPath + ",20)";
    var progonosisTime = [ "1", "2", "6", "12", "24" ];
    var min = 1e10;
    for (var i = 0; i < progonosisTime.length; i++) {
        console.info(graphite + "?target=" + metricPath + "&from=-" + progonosisTime[i] + "hours&format=json");
        $.ajax({
            async: false,
            dataType: "json",
            url: graphite + "?target=" + metricPath + "&from=-" + progonosisTime[i] + "hours&format=json",
            success: function(point) {
                var sI = i + 1;
                point = point[0].datapoints;
                var firstPoint = getFirstPoint(point);
                if (min > firstPoint[0]) min = firstPoint[0];
                var data = [ progonosisTime[i] + " Hour(s)", firstPoint[0] ];
                pressures.push(firstPoint[0]);
                options.series[sI] = {};
                options.series[sI].data = [ data ];
                options.series[sI].name = "foo";
                options.yAxis.min = min - 70;
            },
            cache: false
        });
    }
    options.series.reverse();
    var chart = new Highcharts.Chart(options);
    var p0;
    $.ajax({
        async: true,
        dataType: "json",
        url: graphite + "?target=" + metricPath + "&from=-3hours&format=json",
        success: function(point) {
            point = point[0].datapoints;
            var firstPoint = getFirstPoint(point);
            p0 = firstPoint[0];
            console.info(p0);
            console.info(pNow);
            var diff = pNow - p0;
            console.info(diff);
            if (diff > 150) {
                console.info("Getting sunny");
                $("#climacon").addClass("climacon sun");
            } else if (diff <= 150 || diff >= -150) {
                console.info("No change");
                $("#climacon").addClass("climacon sun cloud");
            } else if (diff < -150) {
                console.info("Getting Rainy!");
                image = "rain.png";
            }
        },
        cache: false
    });
}

function liveData(element, that, id) {
    var chart = that[0].Highcharts.charts[id];
    if (typeof chart === "undefined") {
        setTimeout(function() {
            liveData(element, $(this), id);
        }, 5e3);
        return;
    }
    $.ajax({
        url: graphite + "?target=" + element + "&from=-20minutes&format=json",
        success: function(point) {
            point = point[0].datapoints;
            var data = getLatestPoint(point);
            console.info(data);
            chart.series[0].setData([ data[0] ]);
            setTimeout(function() {
                liveData(element, $(this), id);
            }, 5e3);
        },
        cache: false
    });
}

