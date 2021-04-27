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
        left: 80
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
    };

    // Function used for updation Y axis var on click on axis label
    function renderYAxis(newYScale, yAxis) {
        var leftAxis = d3.axisLeft(newYScale);

        yAxis.transition()
            .duration(1000)
            .call(leftAxis);

        return yAxis;    
    };

    // Function to update circle positions
    function renderCircles(circlesGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        circlesGroup.transition()
            .duration(1000)
            .attr("cx", d => newXScale(d[chosenXAxis]))
            .attr("cy", d => newYScale(d[chosenYAxis]));

        return circlesGroup;
    };

    // Function to update text positions
    function renderText(textGroup, newXScale, chosenXAxis, newYScale, chosenYAxis) {

        textGroup.transition()
            .duration(1000)
            .attr("x", d => newXScale(d[chosenXAxis]))
            .attr("y", d => newYScale(d[chosenYAxis]));

        return textGroup;
    };

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
        .offset([30, -30])
        .html(function(d) {
            return (`${xLabel} ${d[chosenXAxis]}<br>${yLabel} ${d[chosenYAxis]}`);
        });
    
        circlesGroup.call(toolTip);
        
        // on mouseover event
        circlesGroup.on("mouseover", function(data) {
        toolTip.show(data);
        })
        // on mouseout event
        .on("mouseout", function(data, index) {
            toolTip.hide(data);
        });
    
        return circlesGroup;
    };
  
      
    // Read in the data
    d3.csv("assets/data/data.csv").then(function(healthData, err) {
        console.log(healthData);
        if (err) throw err;

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

        // Instantiate Scale Functions
        var xLinearScale = xScale(healthData, chosenXAxis);

        var yLinearScale = yScale(healthData, chosenYAxis);

        // Instantiate axes
        var bottomAxis = d3.axisBottom(xLinearScale);
        var leftAxis = d3.axisLeft(yLinearScale);

        // Add axes to chart
        var xAxis = chartGroup.append("g")
            .attr("transform", `translate(0, ${height})`)
            .call(bottomAxis);

        var yAxis = chartGroup.append("g")
            .call(leftAxis);

        // Append initial data
        var circlesGroup = chartGroup.selectAll("circle")
            .data(healthData)
            .enter()
            .append("circle")
            .classed("stateCircle", true)
                .attr("cx", d => xLinearScale(d[chosenXAxis]))
                .attr("cy", d => yLinearScale(d[chosenYAxis]))
                .attr("r", "15");
                
        // Append initial text
        var textGroup = chartGroup.selectAll("null")
            .data(healthData)
            .enter()
            .append("text")
            .classed("stateText", true)
            .attr("x", function(d) {
                return xLinearScale(d[chosenXAxis]);
            })
            .attr("y", function(d) {
                return yLinearScale(d[chosenYAxis] + 0.2);
            })
            .text(function(d) {
                return d.abbr
            });

        // Create group for x labels
        var xLabelsGroup = chartGroup.append("g")
            .attr("transform", `translate(${width / 2}, ${height + 20})`);

        // Create x labels
        var povertyLabel = xLabelsGroup.append("text")
            .attr("y", 15)
            .attr("value", "poverty")
            .classed("active", true)
            .text("Percent At or Below Poverty Rate");

        var ageLabel = xLabelsGroup.append("text")
            .attr("y", 35)
            .attr("value", "age")
            .classed("inactive", true)
            .text("Median Age");

        var incomeLabel = xLabelsGroup.append("text")
            .attr("y", 55)
            .attr("value", "income")
            .classed("inactive", true)
            .text("Median Household Income");

        // Create group for y labels
        var yLabelsGroup = chartGroup.append("g")
            .attr("transform", "rotate(-90)");

        // Create y labels
        var obesityLabel = yLabelsGroup.append("text")
            .attr("y", (50 - margin.left))
            .attr("x", (0 - height/2))
            .classed ("active", true)
            .text("Obesity Rate (%)");

        var smokesLabel = yLabelsGroup.append("text")
            .attr("y", (30 - margin.left))
            .attr("x", (0 - height/2))
            .classed("inactive", true)
            .text("Smokes (%)");

        var healthcareLabel = yLabelsGroup.append("text")
            .attr("y", (10 - margin.left))
            .attr("x", (0 - height/2))
            .classed("inactive", true)
            .text("Lacks Healthcare (%)");

        // Update tooltip
        var circlesGroup = updateToolTip(chosenXAxis, chosenYAxis, circlesGroup);

        // Create event handlers
        // x axis
        xLabelsGroup.selectAll("text")
            .on("click", function() {

                // Update x coordinates
                var xValue = d3.select(this).attr("value");
                if (xValue !== chosenXAxis) {
                    chosenXAxis = xValue;
                    
                    console.log(chosenXAxis);

                    // update x scale
                    xLinearScale = xScale(healthData, chosenXAxis);

                    // update x axis
                    xAxis = renderXAxis(xLinearScale, xAxis);
                };

                // Update classes to change bold text
                if (chosenXAxis === "poverty") {
                    povertyLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else if (chosenXAxis === "age") {
                    ageLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    incomeLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                }
                else {
                    incomeLabel
                        .classed("active", true)
                        .classed("inactive", false);
                    povertyLabel
                        .classed("active", false)
                        .classed("inactive", true);
                    ageLabel
                        .classed("active", false)
                        .classed("inactive", true);
                };

                // Update circles
                circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

                // Update text
                textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
            });

        // y axis
        yLabelsGroup.selectAll("text")
            .on("click", function() {

            // Update Y coordinates
            var yValue = d3.select(this).attr("value");
            if (yValue !== chosenYAxis) {
                chosenYAxis = yValue;

                console.log(chosenYAxis);

                // update y scale
                yLinearScale = yScale(healthData, chosenYAxis);

                // update y axis
                yAxis = renderYAxis(yLinearScale, yAxis);
            };

            // Update classes to change bold text
            if (chosenYAxis === "obesity") {
                obesityLabel
                    .classed("active", true)
                    .classed("inactive", false);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else if (chosenYAxis === "smokes") {
                smokesLabel
                    .classed("active", true)
                    .classed("inactive", false);
                healthcareLabel
                    .classed("active", false)
                    .classed("inactive", true);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
            }
            else {
                healthcareLabel
                    .classed("active", true)
                    .classed("inactive", false);
                obesityLabel
                    .classed("active", false)
                    .classed("inactive", true);
                smokesLabel
                    .classed("active", false)
                    .classed("inactive", true);
            };
               
            // Update circles
            circlesGroup = renderCircles(circlesGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);

            // Update text
            textGroup = renderText(textGroup, xLinearScale, chosenXAxis, yLinearScale, chosenYAxis);
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