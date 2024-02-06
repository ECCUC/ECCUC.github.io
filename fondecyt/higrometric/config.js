/* Produced By : Ibgarrido - ibgarrido.github.io */
/* Empowered with: ChatGPT 3.5 / Blackbox IA (Free versions) */


const SVG0 = d3.select("#vis-0").append("svg");
const WIDTH_VIS_0 = 900;
const HEIGHT_VIS_0 = 650;

SVG0.attr("width", WIDTH_VIS_0).attr("height", HEIGHT_VIS_0);



const SVG1 = d3.select("#vis-1").append("svg"); //psychometric chart

const WIDTH_VIS_1 = 900;
const HEIGHT_VIS_1 = 500;


/* ----------SET FIXED PART PSYCHOMETRIC CHART -----------*/


// Adjust SVG1 dimensions
SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);



/* -------------- END FIXED PARTS PSYCHOMETRIC CHART--------------------- */
const info = d3.select("body")
  .append("div")
  .attr("class", "info")
  .style("display", "none");


/* Generate Geodata */
d3.json("data/comunas_rm.geojson").then(function (geoJSON) {
    d3.json("data/sensors.geojson").then(function (sensors) {
        drawGeoJSON(geoJSON, sensors);
        DrawPsychometricChart('Null');
        
    });
});



/*update the Psychometric points*/
const categoryDropdown = document.getElementById("elementSelect");
categoryDropdown.addEventListener("change", function () {
    const sensor = categoryDropdown.value;
    DrawPsychometricChart(sensor);       
    });  

function drawGeoJSON(geoJSON, sensors) {
    const projection = d3.geoMercator().fitSize([800, 600], geoJSON);
    const path = d3.geoPath().projection(projection);

    // Draw GeoJSON polygons
    SVG0.selectAll("path")
        .data(geoJSON.features)
        .enter()
        .append("path")
        .attr("d", path)
        .attr("stroke", "black")
        .attr("stroke-width", 1)
        .attr("fill", "lightblue")
        .on("mouseover", function (event, d) {
            d3.select(this)
                .attr("stroke-width", 2)
                .attr("stroke", "black");

            info.style("display", "block")
                .html(`<strong>commune:</strong> ${d.properties.Comuna}`)
                .style("left", event.pageX + "px")
                .style("top", event.pageY + "px");
        })
        .on("mouseout", function () {
            d3.select(this)
                .attr("stroke-width", 1)
                .attr("stroke", "black");

            info.style("display", "none");
        });

    // Draw GeoJSON points
    SVG0.selectAll("circle")
    .data(sensors.features)
    .enter()
    .append("circle")
    .attr("cx", d => projection(d.geometry.coordinates)[0])
    .attr("cy", d => projection(d.geometry.coordinates)[1])
    .attr("r", 2)
    .attr("fill", "red")
    .on("mouseover", function (event, d) {
        d3.select(this)
            .attr("fill", "yellow")
            .attr("r", 5);

        info.style("display", "block")
            .html(`<strong>sensor:</strong> ${d.properties.ID}`)
            .style("left", event.pageX + "px")
            .style("top", event.pageY + "px");
    })
    .on("mouseout", function () {
        d3.select(this)
            .attr("fill", "red")
            .attr("r", 2);

        info.style("display", "none");
    })
    .on("click", function (event, d) {
        // Call DrawPsychometricChart function with the sensor ID or relevant data
        DrawPsychometricChart(`${d.properties.COD}.csv`);
    
        // Modify the h3 element with the ID "sensor" using d.properties.COD
        const sensorElement = document.getElementById("sensor");
        if (sensorElement) {
            sensorElement.textContent = `Sensor: ${d.properties.COD}`;
        }
    
        const targetElement = document.getElementById("vis-1");
        if (d.properties.COD !== undefined) {
            targetElement.scrollIntoView({ behavior: 'auto' });
        }
    
        // Prevent the default click behavior (optional)
        event.preventDefault();
    });
    

}

// Create a zoom behavior
const zoom = d3.zoom()
    .scaleExtent([1, 8]) // Set the minimum and maximum scale
    .on("zoom", zoomed);

// Apply the zoom behavior to the SVG
SVG0.call(zoom);

// Add buttons for zooming in and out


function zoomed(event) {
    SVG0.selectAll("path")
        .attr("transform", event.transform);

    SVG0.selectAll("circle")
        .attr("transform", event.transform);
}

function zoomIn() {
    SVG0.transition()
        .duration(500)
        .call(zoom.scaleBy, 1.2);
}

function zoomOut() {
    SVG0.transition()
        .duration(500)
        .call(zoom.scaleBy, 0.8);
}

function resetZoom() {
    SVG0.transition()
        .duration(500)
        .call(zoom.transform, d3.zoomIdentity);
}


/*Psychometric chart*/
function DrawPsychometricChart(sensor) {
    const sensorElement = document.getElementById("sensor");
    if (sensorElement) {
        sensorElement.textContent = `Sensor: ${removeLastFourCharacters(sensor)}`;
    }


    // Set the dimensions and margins of the graph
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const width = WIDTH_VIS_1 - margin.left - margin.right;
    const height = HEIGHT_VIS_1 - margin.top - margin.bottom;

    // Create scales
    const xScale = d3.scaleLinear().domain([-15, 55]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 60]).range([height, 0]);

    // Add X axis
    SVG1.append("g")
        .attr("transform", "translate(" + margin.left + "," + (height + margin.top) + ")") // Adjust the translation here
        .call(d3.axisBottom(xScale));

    // Add Y axis
    SVG1.append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")") // Adjust the translation here
        .call(d3.axisLeft(yScale));



    Promise.all([
        d3.csv("data/winter.csv"),
        d3.csv("data/summer.csv"),
        d3.csv("data/curves.csv")
    ])
    .then(([data1, data2, data3]) => {


        // Extract column names dynamically (excluding the temperature column)
    const columns = Object.keys(data3[0]).filter(key => key !== 'temperature');

    // Create a line generator for each column
    const lineGenerators = columns.map(column => {
        return d3.line()
            .x(d => xScale(d.temperature))
            .y(d => yScale(d[column]))
            .curve(d3.curveBasis); // You can choose a different interpolation method if needed
    });

    // Append a group element for each curve
    const curveGroups = SVG1.selectAll(".curve-group")
        .data(columns)
        .enter()
        .append("g")
        .attr("class", "curve-group")
        .attr("transform", `translate(${margin.left},${margin.top})`); // Translate each group
        
    // Draw the curves
    curveGroups.append("path")
        .attr("class", "curve-line")
        .attr("d", (column, i) => lineGenerators[i](data3))
        .attr("fill", "none")
        .attr("stroke", "steelblue"); // Use the same color for each curve, e.g., steelblue

    // Add legends (text over the curves)
    curveGroups.append("text")
        .attr("class", "legend")
        .attr("x", width -150) // Position to the right of the curves
        .attr("y", (column, i) => i * 45) // Adjust the vertical position for each curve
        .style("font-size", "10px") // Use a small font size
        .style("font-weight", "bold") // Make the text bold
        .text((column) => `A.H=${parseFloat(column).toFixed(1)}`); // Format the text to one decimal place  



    // Draw polygons for summer comfort
    const summerPolygonPoints = [
        [Math.max(...data2.map(d => d.Temp)), Math.min(...data2.map(d => d.Hum))],
        [Math.max(...data2.map(d => d.Temp)), data2[2].Hum],
        [data2[5].Temp, data2[5].Hum],
        [data2[3].Temp, data2[3].Hum],
        [data2[2].Temp, data2[2].Hum]
    ];

    // Draw polygons for winter comfort
    const winterPolygonPoints = [
        [data1[2].Temp, data1[2].Hum],
        [Math.min(...data2.map(d => d.Temp)), Math.max(...data1.map(d => d.Hum))],
        [data1[3].Temp, data1[3].Hum],
        [data1[4].Temp, data1[4].Hum]
    ];

    const VsummerLine2 = SVG1.append("line")
        .attr("x1", xScale(Math.max(...data2.map(d => d.Temp))))
        .attr("y1", yScale(Math.min(...data2.map(d => d.Hum))))
        .attr("x2", xScale(Math.max(...data2.map(d => d.Temp))))
        .attr("y2", yScale(data2[2].Hum))
        .attr("stroke", "red")
        .attr("transform", `translate(${margin.left},${margin.top})`) // Translate each group
        .attr("stroke-width", 2);

    const HsummerLine1 = SVG1.append("line")
        .attr("x1", xScale(Math.min(...data2.map(d => d.Temp))))
        .attr("y1", yScale(Math.min(...data2.map(d => d.Hum))))
        .attr("x2", xScale(Math.max(...data2.map(d => d.Temp))))
        .attr("y2", yScale(Math.min(...data2.map(d => d.Hum))))
        .attr("stroke", "red")
        .attr("transform", `translate(${margin.left},${margin.top})`) // Translate each group
        .attr("stroke-width", 2);

    // Another vertical line (Common between winter and summer)
    const commonLine = SVG1.append("line")
        .attr("x1", xScale(Math.min(...data2.map(d => d.Temp))))
        .attr("y1", yScale(Math.min(...data2.map(d => d.Hum))))
        .attr("x2", xScale(Math.min(...data2.map(d => d.Temp))))
        .attr("y2", yScale(Math.max(...data1.map(d => d.Hum))))  // Assuming data1 represents winter
        .attr("stroke", "red")
        .attr("transform", `translate(${margin.left},${margin.top})`) // Translate each group
        .attr("stroke-width", 2);

    // Lines between summer and winter points
    const line1 = SVG1.append("line")
        .attr("x1", xScale(Math.min(...data2.map(d => d.Temp))))
        .attr("y1", yScale(Math.max(...data1.map(d => d.Hum))))  // Assuming data1 represents winter
        .attr("x2", xScale(data2[5].Temp))
        .attr("y2", yScale(data2[5].Hum))
        .attr("stroke", "red")
        .attr("transform", `translate(${margin.left},${margin.top})`) // Translate each group
        .attr("stroke-width", 2);

    const line2 = SVG1.append("line")
        .attr("x1", xScale(data2[5].Temp))
        .attr("y1", yScale(data2[5].Hum))
        .attr("x2", xScale(data2[3].Temp))
        .attr("y2", yScale(data2[3].Hum))
        .attr("stroke", "red")
        .attr("transform", `translate(${margin.left},${margin.top})`) // Translate each group
        .attr("stroke-width", 2);

    const line3 = SVG1.append("line")
        .attr("x1", xScale(data2[3].Temp))
        .attr("y1", yScale(data2[3].Hum))
        .attr("x2", xScale(data2[2].Temp))
        .attr("y2", yScale(data2[2].Hum))
        .attr("stroke", "red")
        .attr("transform", `translate(${margin.left},${margin.top})`) // Translate each group
        .attr("stroke-width", 2);

    // Lines for winter comfort
    const line4 = SVG1.append("line")
        .attr("x1", xScale(data1[2].Temp))
        .attr("y1", yScale(data1[2].Hum))
        .attr("x2", xScale(Math.min(...data2.map(d => d.Temp))))
        .attr("y2", yScale(Math.max(...data1.map(d => d.Hum))))
        .attr("stroke", "blue")
        .attr("transform", `translate(${margin.left},${margin.top})`) // Translate each group
        .attr("stroke-width", 2);

    const line5 = SVG1.append("line")
        .attr("x1", xScale(data1[2].Temp))
        .attr("y1", yScale(data1[2].Hum))
        .attr("x2", xScale(data1[3].Temp))
        .attr("y2", yScale(data1[3].Hum))
        .attr("stroke", "blue")
        .attr("transform", `translate(${margin.left},${margin.top})`) // Translate each group
        .attr("stroke-width", 2);

    const line6 = SVG1.append("line")
        .attr("x1", xScale(data1[3].Temp))
        .attr("y1", yScale(data1[3].Hum))
        .attr("x2", xScale(data1[4].Temp))
        .attr("y2", yScale(data1[4].Hum))
        .attr("stroke", "blue")
        .attr("transform", `translate(${margin.left},${margin.top})`) // Translate each group
        .attr("stroke-width", 2);

    
        if (sensor === 'Null') return;
        drawConcentratedCircle(`data/givoni_data/${sensor}`, xScale, yScale, width, height);
})


/* Function to discribe the concentration of every sensor of the pair (temperature, A.Humidity) */
function drawConcentratedCircle(sensorDataPath, xScale, yScale, width, height) {
    SVG1.selectAll("circle").remove();

    d3.csv(sensorDataPath).then(data => {
        // Convert data to numbers if needed
        data.forEach(d => {
            d.temperature = +d.temperature;
            d.absolute_humidity = +d.absolute_humidity;
        });

        // Create a 2D array to store the density of points
        const density = new Array(width).fill(null).map(() => new Array(height).fill(0));

        // Calculate the density of points for each cell in the heatmap
        data.forEach(d => {
            const xIndex = Math.floor(xScale(d.temperature));
            const yIndex = Math.floor(yScale(d.absolute_humidity));
            density[xIndex][yIndex] += 1;
        });

        // Create a linear scale to map the density of points to a color
        const colorScale = d3.scaleLinear()
            .domain([0, d3.max(density.flat())])
            .range(["black", "yellow"]);

        // Add new points
        SVG1.selectAll("circle")
            .data(data)
            .enter()
            .append("circle")
            .attr("cx", d => xScale(d.temperature))
            .attr("cy", d => yScale(d.absolute_humidity))
            .attr("r", 1.5) // Set the radius of the points
            .attr("transform", `translate(${margin.left},${margin.top})`) // Translate each group
            .attr("fill", d => colorScale(density[Math.floor(xScale(d.temperature))][Math.floor(yScale(d.absolute_humidity))])); // Set the fill color of the points based on the density of points in the area
    });
}
}

function removeLastFourCharacters(inputString) {
    // Check if the string length is greater than 4
    if (inputString.length > 4) {
      return inputString.slice(0, -4);
    }
  
    // If the length is 4 or less, return an empty string or the original string as needed
    return '';
  }
  
  
  

/* Notice I put this function inside the other function because the parameter margin is out of the scope */