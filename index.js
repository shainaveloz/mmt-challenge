d3.json("stock.json", function(error, data) {
    if (error) throw error;
    console.log(data);

    //map out objects
    var bboList = data.bboList.map(function(stocks){
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

    //create function for converting times
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
    var times = [];
    var priceArray = [];
    var askArray = [];
    var bidArray = [];
    var bboTimes = [];

    //Loop through bboList to put data into an empty array
    for(var i = 0; i<bboList.length; i++){
        //convert hundreds of pennies to dollars
        var ask = ((bboList[i].ask)/10000).toFixed(2);
        var bid = ((bboList[i].bid)/10000).toFixed(2);
        var bboTimeArray = bboList[i].timeStr;

        times.push(bboTimeArray);
        askArray.push(ask);
        bidArray.push(bid);
        bboTimes.push(bboTimeArray);
        //console.log(bid);
        //console.log(ask);
        //console.log(bboTimeArray.length);
    }

    //Loop through tradeList to put data into an empty array
    for(var j = 0; j<tradeList.length; j++){
        //convert hundreds of pennies to dollars
        //use time converter to change time format
        var tradeTime = nsToTime(tradeList[j].time);
        var tradePrice = ((tradeList[j].price)/10000).toFixed(2);

        times.push(tradeTime);
        priceArray.push(tradePrice);
        //console.log(tradeTimeArray.length);
        //console.log(tradePriceArray);
        //console.log(tradePrice)
    }

    var newTimes = times.sort();
    var newPrices = priceArray.sort();
    var newAskArray = askArray.sort();
    var newBidArray = bidArray.sort();
    var newBboTimesArray = bboTimes.sort();
    //console.log(newTimes);
    //console.log(priceArray);

    //Make new arrays available for the graph
    newPrices.forEach(function(d){
        d.newPrices = +d.newPrices
    });

    newTimes.forEach(function(d){
        d.newTimes = format(d.newTimes)
    });

    newAskArray.forEach(function(d){
        d.newAskArray = +d.newAskArray
    });

    newBidArray.forEach(function(d){
        d.newBidArray = +d.newBidArray
    });

    newBboTimesArray.forEach(function(d){
        d.newBboTimesArray = format(d.newBboTimesArray)
    });

    //Create empty array for chart data
    //Push in other arrays into this one
    var chartData = [];
    chartData.push(newPrices, newTimes, newAskArray, newBboTimesArray, newBidArray);
    //console.log(chartData.push(newPrices, newTimes, newAskArray, newBboTimesArray, newBidArray));
    //console.log(chartData);

    //Map out data for graph
    for(var l = 0; l < chartData.length; l++){
        //console.log(chartData[l]);
        var times = chartData[1];
        var prices = chartData[0];
        var bboAsk = chartData[2];
        var bids = chartData[4];
        var bboTimes = chartData[3];
    };

    console.log(bboTimes);
    console.log(bids);

    //Create a function for the creation of the graph
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

        var area = d3.area()
            .curve(d3.curveStepAfter)
            .x0(function(){ return x(bboTimes);})
            .y0(function() { return y(bboAsk); })
            .y1(function() { return y(bids); });

        x.domain(d3.extent(chartData, function() { return times; }));
        y.domain(d3.extent[
            d3.min(chartData[l], function(){return Math.min([bids],[bboAsk]);}),
            d3.max(chartData[l], function(){return Math.max([bids],[bboAsk]);})
        ]);
        area.y0(height);

        g.append("path")
            .datum([chartData])
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

    initialize();
});