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
        bottom: 80,
        left: 50
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

    // Functions below are for bonus challenge using multipe axes
    // Initialize starting values for axes
    var chosenXAxis = "poverty";
    var chosenYAxis = "obesity";

    // Functions to define axis scales
    function xScale(healthData, chosenXAxis) {
        // create scales
        var xLinearScale = d3.scaleLinear()
          .domain([d3.min(healthData, d => d[chosenXAxis]) * 0.8,
            d3.max(healthData, d => d[chosenXAxis]) * 1.2
          ])
          .range([0, width]);
      
        return xLinearScale;
    };
    
    function yScale(healthData, chosenYAxis) {
        // create scales
        var yLinearScale = d3.scaleLinear()
            .domain([d3.max(healthData, d => d[chosenYAxis]) * 1.2,
              d3.min(healthData, d => d[chosenYAxis]) * 0.8
            ])
            .range([height, 0]);

        return yLinearScale;
    };
      
    // function used for updating xAxis var upon click on axis label
    function renderXAxis(newXScale, xAxis) {
        var bottomAxis = d3.axisBottom(newXScale);
  
        xAxis.transition()
            .duration(1000)
            .call(bottomAxis);

        return xAxis;
    }

    // Function used for updation Y axis var on click
    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;    
    }

    // Function to update circle positions
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));

        return circlesGroup;
    }

    // function used for updating circles group with new tooltip
    function updateToolTip(chosenXAxis, chosenYAxis, circlesGroup) {

        var xLabel;
    
        if (chosenXAxis === "poverty") {
            label = "% in Poverty:";
        }
        else if (chosenXAxis === "age") {
            label = "Median Age:";
        }
        else {
            label = "Median Household Income";
        };

        var yLabel;

        if (chosenYAxis === "obesity") {
            label = "Obesity:";
        }
        else if (chosenYAxis === "smokes") {
            label = "Smokes:";
        }
        else {
            label = "Lacks Healthcare:";
        };
    
        var toolTip = d3.tip()
        .attr("class", "d3-tip")
        .offset([80, -60])
        .html(function(d) {
            return (`${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
        });
    
        circlesGroup.call(toolTip);
    
        circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
        })
        // onmouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });
    
        return circlesGroup;
    }
  
  
      
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
                .attr("opacity", ".65");

        // Add text to points
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

        // Create group for labels
        var labelsGroup = chartGroup.append("g")
            .attr("transform", `translate ${width / 2}, ${height + 20}`);

        // Create labels
        var povertyLabels = labelsGroup.append("text")
            .attr("x", width / 2)
            .attr("y", height + 40)
            .attr("value", "poverty")
            .classed("active", true)
            .text("Percent At or Below Poverty Rate");

        var obesityLabels = labelsGroup.append("text")
            .attr("transform", "rotate(-90)")
            .attr("y", (20 - margin.left))
            .attr("x", (0 - height/2))
            .classed ("active", true)
            .text("Obesity Rate (%)");

        // Create tooltip
        var toolTip = d3.select("body")
            .append("div")
            .attr("class", "d3-tip");

        // Create event handlers

        var dotGroup = d3.selectAll("circle");

        dotGroup.on("mouseover", )
            
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