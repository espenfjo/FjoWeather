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
var id, startDate, timeSpan;

$(function() {
    var pId = querystring("id");
    startDate = new Date();
    $("#dropdown-menu").empty();
    populateDropdown();
    setListener();
    if (pId.length > 0) {
        id = pId;
        setupChart(id);
    } else {
        setupDatePicker();
        setupDashboard();
    }
});

function setupDatePicker() {
    var format, viewMode;
    var day = startDate.getDate();
    if (day < 10) day = "0" + day;
    var month = startDate.getMonth() + 1;
    if (month < 10) month = "0" + month;
    var year = startDate.getFullYear();
    timeSpan = timeSpan || "month";
    timeSpan = timeSpan + "s";
    if (timeSpan === "months") {
        format = "mm-yyyy";
        viewMode = month + "-" + year;
    } else if (timeSpan === "days") {
        format = "dd-mm-yyyy";
        viewMode = day + "-" + month + "-" + year;
    } else if (timeSpan === "years") {
        format = "yyyy";
        viewMode = year;
    }
    $("#dp1").attr("data-date-format", format);
    $("#dp1").datepicker("remove");
    $("#dp1 input").val(viewMode);
    $("#dp1").datepicker({
        autoclose: true,
        format: format,
        minViewMode: timeSpan,
        todayHighlight: true,
        weekStart: 1
    }).on("changeDate", function(ev) {
        startDate = new Date(ev.date);
        setupChart(id);
    });
}

function setupChart(id, average) {
    $("#page-load-modal").modal("show");
    $("body").css("cursor", "wait");
    clearCharts();
    $("#graphs").append('<div id="graph"></div>');
    $("#timechanger").show();
    var metric = getMetricById(id);
    if (typeof average !== "undefined") {
        if (average === true) metric.average = true; else metric.average = false;
    }
    if (metric.type == "winddirection") {
        drawWindD(id);
    } else {
        var url = createUrl(id, timeSpan);
        drawChart(url, id);
    }
    $("#page-load-modal").modal("hide");
    $("body").css("cursor", "default");
}

function setListener() {
    $(".dropdown-metric").on("click", function() {
        id = $(this).attr("id");
        history.pushState({
            page: 1
        }, id, "?id=" + id);
        setupChart(id);
    });
    $("#home").on("click", function() {
        id = $(this).attr("id");
        history.pushState({
            page: 1
        }, "Dashboard", ".");
        setupDashboard();
    });
    $(".navbar-brand").on("click", function() {
        id = $(this).attr("id");
        history.pushState({
            page: 1
        }, "Dashboard", ".");
        setupDashboard();
    });
    window.onpopstate = function(event) {
        console.log("onpopstate: location: " + document.location.href + ", data: " + JSON.stringify(event.state) + "efo " + JSON.stringify(History.getState()));
    };
    $(".timespan").on("click", function() {
        var bid = $(this).children(":first").attr("id");
        timeSpan = bid.split("-")[1];
        setupDatePicker(timeSpan);
        setupChart(id);
    });
}

function populateDropdown() {
    for (var i = 0; i < metrics.length; i++) {
        var metric = metrics[i];
        var name = metric.name;
        var metricPath = metric.metricPath;
        var group = metric.group;
        if ($("#" + group).length == 0) {
            $("#dropdown-menu").append("<li id='" + group + "' class='dropdown-header'>" + group + "</li>");
            $("#dropdown-menu").append("<li class='divider'></li>");
        }
        $("#" + group).after("<li> <span id='" + i + "'class='navlink dropdown-metric'>" + name + "</span></li>");
    }
    $(".divider").last().remove();
}

function clearCharts() {
    if (typeof Highcharts !== "undefined") {
        for (var i = 0; i < Highcharts.charts.length; i++) {
            Highcharts.charts[i].destroy();
            window.console && console.info("Killing chart " + i);
        }
        Highcharts.charts = [];
    }
    $("#graphs").empty();
}

function setupDashboard() {
    $("#page-load-modal").modal("show");
    $("body").css("cursor", "wait");
    clearCharts();
    $("#timechanger").hide();
    for (var i = 0; i < metrics.length; i++) {
        var metric = metrics[i];
        var name = metric.name;
        var metricPath = metric.metricPath;
        var type = metric.type || metric.group;
        if (metric.dashboard === true) {
            this[type](name, metricPath, i);
        }
    }
    $("#page-load-modal").modal("hide");
    $("body").css("cursor", "default");
}

function createUrl(id) {
    var start_year, start_month, start_day, endDate, end_year, end_month, end_date;
    var metric = getMetricById(id);
    var metricPath = metric.metricPath;
    var scale = metric.scale;
    var name = metric.name;
    var url = graphite;
    var averageDelimiter;
    var average = metric.average;
    console.info(average);
    if (typeof scale === "undefined" || scale == "") scale = 1;
    start_year = startDate.getFullYear();
    if (typeof timeSpan === "undefined" || timeSpan === "months") {
        averageDelimiter = "1day";
        start_month = startDate.getMonth() + 1;
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 0);
        endDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
        end_year = endDate.getFullYear();
        end_month = endDate.getMonth() + 1;
        end_date = endDate.getDate();
        if (start_month < 10) start_month = "0" + start_month;
        if (end_month < 10) end_month = "0" + end_month;
        if (end_date < 10) end_date = "0" + end_date;
        date_from = "00:00_" + start_year + start_month + "01";
        date_to = "23:59_" + end_year + end_month + end_date;
        url += "?from=" + date_from + "&until=" + date_to;
    } else if (timeSpan === "years") {
        averageDelimiter = "1month";
        endDate = new Date(startDate.getFullYear(), 0, 0);
        endDate = new Date(endDate.getFullYear() + 1, 0, 0);
        end_year = endDate.getFullYear() + 1;
        date_from = "00:00_" + start_year + "0101";
        date_to = "23:59_" + end_year + "1231";
        url += "?from=" + date_from + "&until=" + date_to;
    } else if (timeSpan === "days") {
        averageDelimiter = "1hour";
        start_month = startDate.getMonth() + 1;
        start_date = startDate.getDate();
        endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, startDate.getDate());
        endDate = new Date(endDate.getFullYear(), endDate.getMonth(), endDate.getDate());
        end_year = endDate.getFullYear();
        end_month = endDate.getMonth();
        end_date = endDate.getDate();
        if (start_month < 10) start_month = "0" + start_month;
        if (start_date < 10) start_date = "0" + start_date;
        if (end_month < 10) end_month = "0" + end_month;
        if (end_date < 10) end_date = "0" + end_date;
        date_from = "00:00_" + start_year + start_month + start_date;
        date_to = "23:59_" + end_year + end_month + end_date;
        url += "?from=" + date_from + "&until=" + date_to;
    }
    url += "&target=";
    var gd = metricPath;
    if (typeof average !== "undefined" && average === false) {
        if (typeof scale !== "undefined") {
            gd = "scale(" + gd + ',"' + scale + '")';
        }
        if (typeof name !== "undefined") {
            gd = "alias(" + gd + ',"' + name + '")';
        }
    }
    if (typeof average === "undefined" || average === "" || average === true) {
        var lgd = gd;
        if (typeof name !== "undefined" && name != "") {
            gd = sprintf("alias(scale(smartSummarize( %s, '%s', 'max'), %s), '%s Average')", lgd, averageDelimiter, scale, name);
            gd += sprintf("&target=alias(scale(smartSummarize( %s, '%s','min'), %s), '%s Min')", lgd, averageDelimiter, scale, name);
            gd += sprintf("&target=alias(scale(smartSummarize( %s, '%s','avg'), %s), '%s Average')", lgd, averageDelimiter, scale, name);
        } else {
            gd = "smartSummarize(" + lgd + ',"' + averageDelimiter + '","max")';
            gd += "&target=smartSummarize(" + lgd + ",'" + averageDelimiter + "','min')";
            gd += "&target=smartSummarize(" + lgd + ",'" + averageDelimiter + "','avg')";
        }
    }
    url += gd;
    url += "&format=json&rawData=true";
    return url;
}

function drawChart(url, id) {
    var nodata = false;
    var title;
    var metric = getMetricById(id);
    var suffix = metric.suffix;
    var options = {
        chart: {
            renderTo: "#graph",
            type: "line",
            renderTo: "graph",
            marginTop: 80,
            zoomType: "xy"
        },
        title: {
            text: title
        },
        legend: {
            enabled: true,
            align: "right",
            borderColor: "black",
            borderWidth: 2,
            layout: "vertical",
            verticalAlign: "top",
            shadow: true,
            useHTML: true,
            floating: true,
            x: -1,
            y: -1,
            labelFormatter: function() {
                var name = this.chart.options.series[0].name;
                var curUrl = location.href;
                var average = metric.average;
                if (typeof average === "undefined" || average === "" || average === true) {
                    link = '<span class="dropdown-metric" onclick="javascript:setupChart(id, false)" id="' + id + '" style="color:#0898d9;text-decoration:underline;">[View detailed graph]</span>';
                } else {
                    link = '<span onclick="javascript:setupChart(id, true)" class="dropdown-metric" id="' + id + '" style="color:#0898d9;text-decoration:underline;">[View average]</span>';
                }
                return name + " " + link;
            }
        },
        plotOptions: {
            gapSize: 0,
            series: {
                connectNulls: true
            }
        },
        rangeSelector: {
            enabled: true,
            buttons: [ {
                type: "day",
                count: 1,
                text: "1d"
            }, {
                type: "day",
                count: 2,
                text: "2d"
            }, {
                type: "day",
                count: 5,
                text: "5d"
            }, {
                type: "day",
                count: 15,
                text: "15d"
            }, {
                type: "all",
                text: "1m"
            } ]
        },
        plotOptions: {
            series: {
                connectNulls: true
            }
        },
        tooltip: {
            valueDecimals: 1,
            crosshairs: true,
            shared: true,
            valueSuffix: " " + suffix,
            valueDecimals: 1
        },
        yAxis: {
            labels: {
                formatter: function() {
                    return this.value;
                }
            },
            type: "linear"
        },
        xAxis: {
            type: "datetime"
        },
        series: []
    };
    $.ajax({
        async: false,
        url: url,
        dataType: "json",
        success: function(data) {
            for (var i = 0; i < data.length; i++) {
                options.series[i] = [];
                options.series[i].id = i;
                options.series[i].name = data[i].target;
                options.series[i].data = flip(data[i].datapoints);
            }
            if (data.length > 1) {
                options.series[0].type = "arearange";
                options.series[0].linkedTo = ":next";
                options.series[0].data = merge(options.series[0].data, options.series[1].data);
                options.series[0].color = Highcharts.getOptions().colors[0];
                options.series[0].fillOpacity = .3;
                options.series[1] = options.series[2];
                options.series[1].zIndex = 1, options.series[1].marker = {
                    enabled: true,
                    fillColor: "white",
                    lineWidth: 2,
                    lineColor: Highcharts.getOptions().colors[0]
                }, options.series.splice($.inArray(2, options.series), 1);
            }
            if (data.length === 0 && typeof data.datapoints === "undefined") {
                nodata = true;
            }
        },
        cache: false
    });
    if (options.series.length > 0) options.title.text = options.series[0].name;
    Highcharts.setOptions({
        global: {
            useUTC: useUTC
        }
    });
    var chart = new Highcharts.StockChart(options);
    if (nodata) {
        chart.showLoading("No data available for this metric for the given time period!");
    }
}

function drawWindD(id) {
    var nodata = false;
    var title;
    var metric = getMetricById(id);
    var suffix = metric.suffix;
    var degrees = [];
    var options = {
        chart: {
            renderTo: "graph",
            marginTop: 80,
            polar: true,
            type: "column"
        },
        title: {
            text: title
        },
        pane: {
            size: "85%"
        },
        legend: {
            reversed: true,
            align: "right",
            verticalAlign: "top",
            y: 100,
            layout: "vertical"
        },
        xAxis: {
            tickmarkPlacement: "on"
        },
        yAxis: {
            min: 0,
            endOnTick: false,
            showLastLabel: true,
            title: {
                text: "Frequency (%)"
            },
            labels: {
                formatter: function() {
                    return this.value + "%";
                }
            }
        },
        tooltip: {
            valueSuffix: "%",
            followPointer: true
        },
        plotOptions: {
            series: {
                stacking: "normal",
                shadow: false,
                groupPadding: 0,
                pointPlacement: "on"
            }
        },
        series: [ {
            data: [],
            name: "&lt; 0.5 m/s"
        }, {
            data: [ {
                "0": 0
            }, {
                "22.5": 0
            }, {
                "45": 0
            }, {
                "67.5": 0
            }, {
                "90": 0
            }, {
                "112.5": 0
            }, {
                "135": 0
            }, {
                "157.5": 0
            }, {
                "180": 0
            }, {
                "202.5": 0
            }, {
                "225": 0
            }, {
                "247.5": 0
            }, {
                "270": 0
            }, {
                "292.5": 0
            }, {
                "315": 0
            }, {
                "337.5": 0
            } ],
            name: "0.5-2 m/s"
        }, {
            data: [ {
                "0": 0
            }, {
                "22.5": 0
            }, {
                "45": 0
            }, {
                "67.5": 0
            }, {
                "90": 0
            }, {
                "112.5": 0
            }, {
                "135": 0
            }, {
                "157.5": 0
            }, {
                "180": 0
            }, {
                "202.5": 0
            }, {
                "225": 0
            }, {
                "247.5": 0
            }, {
                "270": 0
            }, {
                "292.5": 0
            }, {
                "315": 0
            }, {
                "337.5": 0
            } ],
            name: "2-4 m/s"
        }, {
            data: [ {
                "0": 0
            }, {
                "22.5": 0
            }, {
                "45": 0
            }, {
                "67.5": 0
            }, {
                "90": 0
            }, {
                "112.5": 0
            }, {
                "135": 0
            }, {
                "157.5": 0
            }, {
                "180": 0
            }, {
                "202.5": 0
            }, {
                "225": 0
            }, {
                "247.5": 0
            }, {
                "270": 0
            }, {
                "292.5": 0
            }, {
                "315": 0
            }, {
                "337.5": 0
            } ],
            name: "4-6 m/s"
        }, {
            data: [ {
                "0": 0
            }, {
                "22.5": 0
            }, {
                "45": 0
            }, {
                "67.5": 0
            }, {
                "90": 0
            }, {
                "112.5": 0
            }, {
                "135": 0
            }, {
                "157.5": 0
            }, {
                "180": 0
            }, {
                "202.5": 0
            }, {
                "225": 0
            }, {
                "247.5": 0
            }, {
                "270": 0
            }, {
                "292.5": 0
            }, {
                "315": 0
            }, {
                "337.5": 0
            } ],
            name: "6-8 m/s"
        }, {
            data: [ {
                "0": 0
            }, {
                "22.5": 0
            }, {
                "45": 0
            }, {
                "67.5": 0
            }, {
                "90": 0
            }, {
                "112.5": 0
            }, {
                "135": 0
            }, {
                "157.5": 0
            }, {
                "180": 0
            }, {
                "202.5": 0
            }, {
                "225": 0
            }, {
                "247.5": 0
            }, {
                "270": 0
            }, {
                "292.5": 0
            }, {
                "315": 0
            }, {
                "337.5": 0
            } ],
            name: "8-10 m/s"
        }, {
            data: [ {
                "0": 0
            }, {
                "22.5": 0
            }, {
                "45": 0
            }, {
                "67.5": 0
            }, {
                "90": 0
            }, {
                "112.5": 0
            }, {
                "135": 0
            }, {
                "157.5": 0
            }, {
                "180": 0
            }, {
                "202.5": 0
            }, {
                "225": 0
            }, {
                "247.5": 0
            }, {
                "270": 0
            }, {
                "292.5": 0
            }, {
                "315": 0
            }, {
                "337.5": 0
            } ],
            name: "&gt; 10 m/s"
        } ]
    };
    var metric = getMetricById(id);
    var directionUrl = graphite + "?target=smartSummarize(" + metric.metricPath + ", '1day')&format=json";
    var speedUrl = graphite + "?target=smartSummarize(" + metric.windSpeedPath + ", '1day')&format=json";
    var winddirection;
    var speed;
    $.ajax({
        async: false,
        url: directionUrl,
        dataType: "json",
        success: function(data) {
            winddirection = data[0].datapoints;
        }
    });
    $.ajax({
        async: false,
        url: speedUrl,
        dataType: "json",
        success: function(data) {
            speed = data[0].datapoints;
        }
    });
    var data = [];
    var h = new Object();
    h["0"] = 0;
    h["22.5"] = 1;
    h["45"] = 2;
    h["67.5"] = 3;
    h["90"] = 4;
    h["112.5"] = 5;
    h["135"] = 6;
    h["157.5"] = 7;
    h["180"] = 8;
    h["202.5"] = 9;
    h["225"] = 10;
    h["247.5"] = 11;
    h["270"] = 12;
    h["292.5"] = 13;
    h["315"] = 14;
    h["337.5"] = 15;
    if (speed.length > 0 && winddirection.length > 0) {
        for (var i = 0; i <= speed.length; i++) {
            if (speed[i] != null && speed[i][0] !== null) {
                if (speed[i][0] >= 10) {} else if (speed[i][0] >= 8) {
                    data[5][winddirection[i][0]]++;
                } else if (speed[i][0] >= 6) {
                    h[winddirection[i][0]]++;
                    data[4][winddirection[i][0]]++;
                } else if (speed[i][0] >= 4) {
                    h[winddirection[i][0]]++;
                    data[3][winddirection[i][0]]++;
                } else if (speed[i][0] >= 2) {
                    h[winddirection[i][0]]++;
                    data[2][winddirection[i][0]]++;
                } else if (speed[i][0] >= .5) {
                    h[winddirection[i][0]]++;
                    data[1][winddirection[i][0]]++;
                } else {
                    h[winddirection[i][0]]++;
                }
            }
        }
    }
    console.info(data);
    options.series = [];
    options.series[0] = {};
    options.series[0].data = [];
    options.series[0].data = [ [ 0, 2 ], [ 90, 3 ], [ 180, 23 ], [ 270, 0 ] ];
    Highcharts.setOptions({
        global: {
            useUTC: useUTC
        }
    });
    var chart = new Highcharts.Chart(options);
    console.info(chart);
    if (nodata) {
        chart.showLoading("No data available for this metric for the given time period!");
    }
}

function merge(one, two) {
    for (var i = 0; i < one.length; i++) {
        one[i].push(two[i][1]);
    }
    return one;
}

function flip(series) {
    newseries = [];
    for (var i = 0; i < series.length; i++) {
        newseries.push([ series[i][1] * 1e3, series[i][0] ]);
    }
    return newseries;
}

function querystring(key) {
    var re = new RegExp("(?:\\?|&)" + key + "=(.*?)(?=&|$)", "gi");
    var r = [], m;
    while ((m = re.exec(document.location.search)) != null) r.push(m[1]);
    return r;
}

function sprintf(format) {
    for (var i = 1; i < arguments.length; i++) {
        format = format.replace(/%s/, arguments[i]);
    }
    return format;
}

function getMetricById(id) {
    return metrics[id];
}

function getFirstPoint(points) {
    for (var i = 0; i <= points.length; i++) {
        var data = points[i];
        if (data[0] !== null) {
            return data;
        }
    }
}

function getLatestPoint(points) {
    var i = points.length - 1;
    for (;i >= 0; i--) {
        var data = points[i];
        if (data[0] !== null) {
            return data;
        }
    }
}