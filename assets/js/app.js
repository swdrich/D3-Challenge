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
        right: 50,
        bottom: 50,
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

    // Read in the data
    d3.csv("assets/data/data.csv").then(function(data) {
        console.log(data);
    });

};

drawScatter();
// This is a function to redraw the plot based on window size
// function makeResponsive() {
//     console.log("makeResponsive");

//     drawScatter();


// };
// // This base code taken directly from D3 scatterplot section

// //Read the data
// d3.csv("https://raw.githubusercontent.com/holtzy/data_to_viz/master/Example_dataset/2_TwoNum.csv", function(data) {

//   // Add X axis
//   var x = d3.scaleLinear()
//     .domain([0, 4000])
//     .range([ 0, width ]);
//   svg.append("g")
//     .attr("transform", "translate(0," + height + ")")
//     .call(d3.axisBottom(x));

//   // Add Y axis
//   var y = d3.scaleLinear()
//     .domain([0, 500000])
//     .range([ height, 0]);
//   svg.append("g")
//     .call(d3.axisLeft(y));

//   // Add dots
//   svg.append('g')
//     .selectAll("dot")
//     .data(data)
//     .enter()
//     .append("circle")
//       .attr("cx", function (d) { return x(d.GrLivArea); } )
//       .attr("cy", function (d) { return y(d.SalePrice); } )
//       .attr("r", 1.5)
//       .style("fill", "#69b3a2")

// })

// </script>

// makeResponsive();