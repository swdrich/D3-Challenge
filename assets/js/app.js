console.log("app.js is loaded!")

// This is a function to draw a scatter plot
function drawScatter() {
    console.log("drawScatter");

    // Remove previous graph if one exists
    var svgArea = d3.select("body").select("svg");
    if (!svgArea.empty()) {
        svgArea.remove();
    }

    // Create SVG area based on window size
    var svgWidth = window.innerWidth;
    var svgHeight = window.innerHeight;

    var margin = {
        top: 50,
        right: 100,
        bottom: 50,
        left: 30
    };

    var height = svgHeight - margin.top - margin.bottom;
    var width = svgWidth - margin.left - margin.right;

    // Append svg to html
    var svg = d3.select("#scatter")
        .append("svg")
        .attr("height", svgHeight)
        .attr("width", svgWidth);

    // Append chart group
    var chartGroup = svg.append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);

    // Read in the data
    d3.csv("assets/data/data.csv").then(function(healthData) {
        console.log(healthData);

        // Loop through data and parse as numbers
        healthData.forEach(function(data) {
            data.age = +data.age;
            data.healthcare = +data.healthcare;
            data.id = +data.id;
            data.income = +data.income;
            data.obesity = +data.obesity;
            data.poverty = +data.poverty;
            data.smokes = +data.smokes;

        });

        // Create Scale Functions
        var povertyScale = d3.scaleLinear()
            .domain([8, d3.max(healthData, d => d.poverty)])
            .range([0, width]);

        var obesityScale = d3.scaleLinear()
            .domain([18, d3.max(healthData, d => d.obesity)])
            .range([height, 0]);

        // Create axes
        var povertyAxis = d3.axisBottom(povertyScale);
        var obesityAxis = d3.axisLeft(obesityScale);

        // Add axes to chart
        chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(povertyAxis);

        chartGroup.append("g")
            .call(obesityAxis);

        //console.log(healthData.poverty);

        // // Create data points
        // var dataPoints = svg.selectAll("dot")
        //     .data(healthData)
        //     .enter()
        //     .append("g");

        // dataPoints.append("circle")
        //     .attr("cx", d => povertyScale(d.poverty))
        //     .attr("cy", d => obesityScale(d.obesity))
        //     .attr("r", "15")
        //     .attr("fill", "blue")
        //     .attr("opacity", ".75");

        // dataPoints.append("text")


        // Plot data
        chartGroup.append("g")
            .selectAll("dot")
            .data(healthData)
            .enter()
            .append("circle")
                .attr("cx", d => povertyScale(d.poverty))
                .attr("cy", d => obesityScale(d.obesity))
                .attr("r", "15")
                .attr("fill", "blue")
                .attr("opacity", ".75");

        chartGroup.append("text")
        .style("font-size", "12px")
        .style("fill", "white")
        .selectAll("tspan")
        .data(healthData)
        .enter()
        .append("tspan")
            .attr("x", function(data) {
                return povertyScale(data.poverty - 0.08);
            })
            .attr("y", function(data) {
                return obesityScale(data.obesity - .15);
            })
            .text(function(data) {
                return data.abbr
            });
            
    // Catch errors
    }).catch(e => {
        console.log(e);
    });

};


// This is a function to redraw the plot based on window size
function makeResponsive() {
    console.log("makeResponsive");

    drawScatter();
};

makeResponsive();

// Resize as browser window changes
d3.select(window).on("resize", makeResponsive);