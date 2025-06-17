// chart2.js
// Timeline visualization showing the growth of fast food locations over time

(async function () {
  if (window.chart2Initialized) {
    console.log("Chart2 is already initialized, skipping initialization");
    return;
  }

  const container = d3.select("#viz2");
  container.html("");

  container.style("opacity", "0");
  container.style("visibility", "hidden");
  container.style("transition", "opacity 0.8s ease-in-out, visibility 0s");

  window.chart2Initialized = false;
  window.chart2AnimatedOnce = false;
  window.chart2Rendered = false;

  let svg = null;
  let lineData = null;
  let xScale = null;
  let yScale = null;

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "chart2-tooltip")
    .style("position", "absolute")
    .style("background", "white")
    .style("border", "1px solid black")
    .style("padding", "5px")
    .style("border-radius", "5px")
    .style("visibility", "hidden")
    .style("font-size", "14px")
    .style("pointer-events", "none")
    .style("z-index", "1000");

  const margin = { top: 20, right: 30, bottom: 40, left: 60 },
    width = 800 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;

  try {
    svg = container
      .append("svg")
      .attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", `translate(${margin.left + 50},${margin.top + 100})`);

    lineData = await d3.csv("data/num_locations.csv");

    lineData.forEach((d) => {
      d.date = d3.timeParse("%Y")(d.year);
      d.value = +d.total_fastfood;
    });

    xScale = d3
      .scaleTime()
      .domain(d3.extent(lineData, (d) => d.date))
      .range([0, width]);

    yScale = d3
      .scaleLinear()
      .domain([0, d3.max(lineData, (d) => d.value)])
      .nice()
      .range([height, 0]);

    window.chart2Initialized = true;
    console.log(
      "Chart2 data prepared and ready for rendering when section is visible"
    );
  } catch (error) {
    console.error("Error loading or processing data:", error);
    createFallbackChart();
  }

  function renderAndAnimateChart() {
    if (window.chart2Rendered || !svg || !lineData || !xScale || !yScale)
      return;

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", -50)
      .attr("text-anchor", "middle")
      .attr("class", "chart-title")
      .text("Growth of Fast Food Restaurants Over the Years")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .style("opacity", 1);

    const xAxis = svg
      .append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(d3.timeYear.every(5)));

    const yAxis = svg.append("g").call(d3.axisLeft(yScale));

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height + margin.bottom - 5)
      .attr("text-anchor", "middle")
      .text("Year")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .style("opacity", 1);

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2)
      .attr("y", -margin.left + 15)
      .attr("text-anchor", "middle")
      .text("Number of Fast‑Food Locations")
      .style("opacity", 0)
      .transition()
      .duration(800)
      .style("opacity", 1);

    const line = d3
      .line()
      .x((d) => xScale(d.date))
      .y((d) => yScale(d.value));

    const path = svg
      .append("path")
      .datum(lineData)
      .attr("fill", "none")
      .attr("stroke", "#007acc")
      .attr("stroke-width", 2)
      .attr("d", line);

    const pathLength = path.node().getTotalLength();

    path
      .attr("stroke-dasharray", pathLength)
      .attr("stroke-dashoffset", pathLength)
      .transition()
      .duration(2000)
      .attr("stroke-dashoffset", 0);

    svg
      .selectAll(".data-point")
      .data(lineData)
      .enter()
      .append("circle")
      .attr("class", "data-point")
      .attr("cx", (d) => xScale(d.date))
      .attr("cy", (d) => yScale(d.value))
      .attr("r", 0)
      .attr("fill", "#007acc")
      .transition()
      .delay((d, i) => 2000 + i * 100)
      .duration(500)
      .attr("r", 4);

    svg
      .selectAll(".data-point")
      .on("mouseover", function (event, d) {
        tooltip
          .style("visibility", "visible")
          .html(
            `<div><strong>Year: ${d.year}</strong></div>` +
              `<div>Locations: ${d3.format(",")(d.value)}</div>`
          );
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");

        d3.select(this).attr("r", 6).attr("fill", "#ff7700");
      })
      .on("mousemove", function (event) {
        tooltip
          .style("top", event.pageY - 10 + "px")
          .style("left", event.pageX + 10 + "px");
      })
      .on("mouseout", function () {
        tooltip.style("visibility", "hidden");
        d3.select(this).attr("r", 4).attr("fill", "#007acc");
      });

    window.chart2Rendered = true;

    container.style("visibility", "visible").style("opacity", "1");

    window.chart2AnimatedOnce = true;
  }

  function createFallbackChart() {
    if (!svg) return;

    svg
      .append("text")
      .attr("x", width / 2)
      .attr("y", height / 2)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text(
        "Unable to load timeline data. Please check your connection and try again."
      );

    container.style("visibility", "visible").style("opacity", "1");
  }

  window.updateChart2 = function (progress, stepIndex) {
    if (!window.chart2AnimatedOnce && progress > 0.1) {
      renderAndAnimateChart();
    }
  };
})();
