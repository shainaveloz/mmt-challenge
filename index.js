d3.json("stock.json", function(error, data) {
    if (error) throw error;
    console.log(data);


    var bbo = data.bboList.map(function(stocks){
        return{
            ask: stocks.ask,
            bid: stocks.bid,
            timeStr: stocks.timeStr
        }
    });

    var tradeList = data.tradeList.map(function(stocks){
        return{
            price: stocks.price,
            time: stocks.time,
            shares: stocks.shares,
            tradeType: stocks.tradeType,
            orderReferenceNumber: stocks.orderReferenceNumber
        }
    });

    function nsToTime(duration) {
        var nanoseconds = parseInt((duration%10000)/1000),
            milliseconds = parseInt((duration%1000)/100)
            , seconds = parseInt((duration/1000)%60)
            , minutes = parseInt((duration/(1000*60))%60)
            , hours = parseInt((duration/(1000*60*60))%24);

        hours = (hours < 10) ? "0" + hours : hours;
        minutes = (minutes < 10) ? "0" + minutes : minutes;
        seconds = (seconds < 10) ? "0" + seconds : seconds;

        return hours + ":" + minutes + ":" + seconds + "." + milliseconds + "."+ nanoseconds;
    }

    var format = d3.timeParse("%X");


    bbo.forEach(function(time, d) {
        var bboTime = time.timeStr;
        var ask = time.ask;
        var bid = time.bid;
        //console.log(parseInt(bboTime, 10));
        d.bboTime = format(parseInt(bboTime, 10));
        d["bboTime"]= +d["bboTime"];
        d["ask"]= +d["ask"];
        d["bid"]= +d["bid"];
    });

    tradeList.forEach(function(trade, d) {
        var tradeTime = moment(trade.time);
        var price = trade.price;
        nsToTime(tradeTime);
        d.tradeTime = format(d.tradeTime);
        d["tradeTime"] = +d["tradeTime"];
        d["price"] = +d["price"];
    });

    initialize();
});

function initialize(){
    var svg = d3.select("svg"),
        margin = {top: 20, right: 20, bottom: 30, left: 50},
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom,
        g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleTime()
        .range([0, width]);

    var y = d3.scaleLinear()
        .range([height, 0]);

    var xAxis = d3.axisBottom(x);

    var yAxis = d3.axisLeft(y);

    var line = d3.area()
        .x(function(d) { return x(d.bboTime); })
        .y(function(d) { return y(d.tradeTime.price); })

    var area = d3.area()
        .curve(d3.curveStepAfter)
        .x0(function(d){ return x(d.bboTime);})
        .y0(function(d) { return y(d.bboTime.ask); })
        .y1(function(d) { return y(d.bboTime.bid); });

    x.domain(d3.extent(bbo, function(time) { return time.bboTime; }));
    //x.domain(d3.extent(tradeList, function(time) { return time.tradeTime; }));

    g.append("clipPath")
        .attr("id", "clip-below")
        .append("path")
        .attr("d", area.lineY0(height));

    g.append("path")
        .datum(data)
        .attr("fill", "steelblue")
        .attr("d", area);

    g.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    g.append("g")
        .call(yAxis)
        .append("text")
        .attr("fill", "#000")
        .attr("transform", "rotate(-90)")
        .attr("y", 6)
        .attr("dy", "0.71em")
        .attr("text-anchor", "end")
        .text("Price ($)");

}

    // svg.append("clipPath")
    //     .attr("id", "clip-above")
    //     .append("path")
    //     .attr("d", area.y0(0));
    //
    // svg.append("path")
    //     .attr("class", "area above")
    //     .attr("clip-path", "url(#clip-above)")
    //     .attr("d", area.y0(function(d) { return y(d["tradeList"]); }));
    //
    // svg.append("path")
    //     .attr("class", "area below")
    //     .attr("clip-path", "url(#clip-below)")
    //     .attr("d", area);
    //
    // svg.append("path")
    //     .attr("class", "line")
    //     .attr("d", line);
    //
    // svg.append("g")
    //     .attr("class", "x axis")
    //     .attr("transform", "translate(0," + height + ")")
    //     .call(xAxis);
    //
    // svg.append("g")
    //     .attr("class", "y axis")
    //     .call(yAxis)
    //     .append("text")
    //     .attr("transform", "rotate(-90)")
    //     .attr("y", 6)
    //     .attr("dy", ".71em")
    //     .style("text-anchor", "end")
    //     .text("Price ($)");
