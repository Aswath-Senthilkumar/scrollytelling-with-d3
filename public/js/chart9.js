// chart9.js
// Nutrition Intake Visualization - Total vs FAFH

(async function () {
  if (window.chart9Initialized) {
    console.log("Chart9 is already initialized, skipping initialization");
    return;
  }

  const container = d3.select("#viz9");
  container.html("");

  container.style("opacity", "0");
  container.style("visibility", "hidden");
  container.style("transition", "opacity 0.8s ease-in-out, visibility 0s");
  container.style("background-color", "#f8f9fa");

  window.chart9Initialized = false;
  window.chart9AnimatedOnce = false;
  window.chart9Rendered = false;

  let totalWidths = {};
  let fafhWidths = {};

  const chartContainer = container
    .append("div")
    .attr("class", "chart-container")
    .style("width", "100%")
    .style("height", "100%")
    .style("display", "flex")
    .style("flex-direction", "column")
    .style("justify-content", "center")
    .style("align-items", "center")
    .style("position", "relative")
    .style("margin", "auto")
    .style("padding-top", "40px");

  chartContainer
    .append("h3")
    .attr("class", "chart-title")
    .text("Nutrient Intake: Total vs Fast Food")
    .style("text-align", "center")
    .style("margin-bottom", "15px")
    .style("margin-top", "20px");

  const buttonContainer = chartContainer
    .append("div")
    .attr("class", "button-container")
    .style("display", "flex")
    .style("flex-wrap", "wrap")
    .style("justify-content", "center")
    .style("margin-bottom", "15px");

  const margin = { top: 60, right: 60, bottom: 50, left: 100 };

  const svgContainer = chartContainer
    .append("div")
    .style("width", "100%")
    .style("height", "calc(100% - 150px)")
    .style("overflow", "visible")
    .style("margin-top", "15px");

  const width =
    Math.min(900, window.innerWidth * 0.8) - margin.left - margin.right;
  const height = 550 - margin.top - margin.bottom;

  const svg = svgContainer
    .append("svg")
    .attr("id", "bar_svg")
    .attr("width", "100%")
    .attr("height", "100%")
    .attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${
        height + margin.top + margin.bottom + 40
      }`
    )
    .attr("preserveAspectRatio", "xMidYMid meet");

  const chart = svg
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

  const nutrients = [
    "Carbohydrate",
    "Energy",
    "Fiber, dietary",
    "Iron",
    "Protein",
    "Total Fat",
  ];

  nutrients.forEach((nutrient, i) => {
    buttonContainer
      .append("button")
      .attr("class", "nutrient-btn")
      .classed("active", i === 0)
      .text(nutrient)
      .style("margin", "5px")
      .style("padding", "8px 12px")
      .style("background-color", i === 0 ? "#6ca796" : "#f8f9fa")
      .style("color", i === 0 ? "white" : "#333")
      .style("border", "1px solid #ccc")
      .style("border-radius", "4px")
      .style("cursor", "pointer")
      .style("transition", "all 0.3s ease");
  });

  const svgLegend = svg
    .append("g")
    .attr("class", "svg-legend")
    .attr(
      "transform",
      `translate(${width / 2},${height + margin.bottom + 70})`
    );

  svgLegend
    .append("rect")
    .attr("x", -120)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", "#d7e6db");

  svgLegend
    .append("text")
    .attr("x", -100)
    .attr("y", 12)
    .text("Total Intake")
    .style("font-size", "12px");

  svgLegend
    .append("rect")
    .attr("x", 20)
    .attr("y", 0)
    .attr("width", 15)
    .attr("height", 15)
    .attr("fill", "#6ca796");

  svgLegend
    .append("text")
    .attr("x", 40)
    .attr("y", 12)
    .text("FAFH (Fast Food) Intake")
    .style("font-size", "12px");

  const legend = chartContainer
    .append("div")
    .attr("class", "legend")
    .style("display", "flex")
    .style("align-items", "center")
    .style("justify-content", "center")
    .style("margin-top", "15px")
    .style("padding-top", "15px")
    .html(
      `<div style="display: flex; align-items: center; margin-right: 20px;">
        <div style="width: 15px; height: 15px; background-color: #d7e6db; margin-right: 5px;"></div>
        <span>Total Intake</span>
      </div>
      <div style="display: flex; align-items: center;">
        <div style="width: 15px; height: 15px; background-color: #6ca796; margin-right: 5px;"></div>
        <span>FAFH (Fast Food) Intake</span>
      </div>`
    );

  const tooltip = d3
    .select("body")
    .append("div")
    .attr("id", "nutrition-tooltip")
    .style("position", "absolute")
    .style("opacity", "0")
    .style("background", "rgba(0,0,0,0.7)")
    .style("color", "#fff")
    .style("padding", "6px 10px")
    .style("border-radius", "5px")
    .style("pointer-events", "none")
    .style("font-size", "13px")
    .style("z-index", "1000");

  let currentNutrientIndex = 0;
  let data = [];

  function drawChart(nutrient) {
    const subset = data.filter((d) => d.Nutrient === nutrient);

    subset.sort((a, b) => {
      const yearA = typeof a.Year === "string" ? a.Year.split("-")[0] : a.Year;
      const yearB = typeof b.Year === "string" ? b.Year.split("-")[0] : b.Year;
      return +yearA - +yearB;
    });

    const xScale = d3
      .scaleLinear()
      .domain([0, d3.max(subset, (d) => d.Total) * 1.1])
      .range([0, width]);

    const yScale = d3
      .scaleBand()
      .domain(subset.map((d) => d.Year))
      .range([0, height])
      .padding(0.2);

    chart.selectAll(".axis").remove();

    chart
      .append("g")
      .attr("class", "axis y-axis")
      .call(d3.axisLeft(yScale).tickSizeOuter(0))
      .call((g) => g.selectAll(".tick text").style("font-size", "11px"));

    chart
      .append("g")
      .attr("class", "axis x-axis")
      .attr("transform", `translate(0,${height})`)
      .call(
        d3
          .axisBottom(xScale)
          .tickFormat((d) => (nutrient === "Energy" ? `${d} kcal` : d))
          .tickSize(-height)
      )
      .call((g) => {
        g.selectAll(".tick line").attr("stroke", "#ddd");
        g.selectAll(".tick text")
          .style("font-size", "11px")
          .attr("dy", "0.8em");
      });

    const totalBars = chart.selectAll("rect.range").data(subset, (d) => d.Year);

    totalBars.exit().transition().duration(500).attr("width", 0).remove();

    chart.selectAll(".title").remove();

    chart
      .append("text")
      .attr("class", "title")
      .attr("x", width / 2)
      .attr("y", -30)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .style("font-weight", "bold")
      .text(`${nutrient} Intake: Total vs FAFH`);

    const totalEnter = totalBars
      .enter()
      .append("rect")
      .attr("class", "range")
      .attr("x", 0)
      .attr("y", (d) => yScale(d.Year))
      .attr("height", yScale.bandwidth())
      .attr("width", (d) => totalWidths[d.Year] || 0)
      .attr("fill", "#d7e6db")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(`Total Intake: ${d.Total.toFixed(2)}`)
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 25}px`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    totalEnter
      .merge(totalBars)
      .transition()
      .duration(1200)
      .attr("y", (d) => yScale(d.Year))
      .attr("width", (d) => xScale(d.Total))
      .on("end", function (event, d) {
        totalWidths[d.Year] = xScale(d.Total);
      });

    const fafhBars = chart
      .selectAll("rect.measure")
      .data(subset, (d) => d.Year);

    fafhBars.exit().transition().duration(500).attr("width", 0).remove();

    const fafhEnter = fafhBars
      .enter()
      .append("rect")
      .attr("class", "measure")
      .attr("x", 0)
      .attr("y", (d) => yScale(d.Year) + yScale.bandwidth() * 0.25)
      .attr("height", yScale.bandwidth() * 0.5)
      .attr("width", (d) => fafhWidths[d.Year] || 0)
      .attr("fill", "#6ca796")
      .on("mouseover", (event, d) => {
        tooltip
          .style("opacity", 1)
          .html(
            `FAFH Intake: ${d.FAFH_Intake.toFixed(2)} (${(
              (d.FAFH_Intake / d.Total) *
              100
            ).toFixed(1)}%)`
          )
          .style("left", `${event.pageX + 10}px`)
          .style("top", `${event.pageY - 25}px`);
      })
      .on("mouseout", () => tooltip.style("opacity", 0));

    fafhEnter
      .merge(fafhBars)
      .transition()
      .duration(1200)
      .attr("y", (d) => yScale(d.Year) + yScale.bandwidth() * 0.25)
      .attr("width", (d) => xScale(d.FAFH_Intake))
      .on("end", function (event, d) {
        fafhWidths[d.Year] = xScale(d.FAFH_Intake);
      });

    d3.selectAll(".nutrient-btn")
      .classed("active", function () {
        return d3.select(this).text() === nutrient;
      })
      .style("background-color", function () {
        return d3.select(this).text() === nutrient ? "#6ca796" : "#f8f9fa";
      })
      .style("color", function () {
        return d3.select(this).text() === nutrient ? "white" : "#333";
      });
  }

  try {
    const response = await fetch("/Data/cleaned_actual.csv");
    const csvText = await response.text();

    data = d3
      .csvParse(csvText, (d) => ({
        Year: d.Year,
        Nutrient: d.Nutrient.trim(),
        Total: +d.Total,
        FAFH_Intake: +d.FAFH_Intake,
      }))
      .filter((d) => nutrients.includes(d.Nutrient));

    console.log("Nutrition data loaded:", data.length, "records");

    window.updateChart9 = function (progress, stepIndex) {
      try {
        if (!window.chart9Rendered && progress > 0) {
          console.log("Initializing chart9 elements");
          window.chart9Rendered = true;

          container.style("visibility", "visible");
          container.style("opacity", "1");

          drawChart(nutrients[0]);

          d3.selectAll(".nutrient-btn").on("click", function () {
            const selectedNutrient = this.textContent;
            currentNutrientIndex = nutrients.indexOf(selectedNutrient);
            drawChart(selectedNutrient);
          });

          window.chart9Initialized = true;
          window.chart9AnimatedOnce = true;
        }

        if (window.chart9Rendered && stepIndex >= 0) {
          if (stepIndex === 0) {
            drawChart("Carbohydrate");

            currentNutrientIndex = 0;

            d3.selectAll(".nutrient-btn").each(function (d, i) {
              const isActive = i === 0;
              d3.select(this)
                .classed("active", isActive)
                .style("background-color", isActive ? "#6ca796" : "#f8f9fa")
                .style("color", isActive ? "white" : "#333");
            });
          } else if (stepIndex <= nutrients.length) {
            const nutrientIndex = stepIndex - 1;

            drawChart(nutrients[nutrientIndex]);

            currentNutrientIndex = nutrientIndex;

            d3.selectAll(".nutrient-btn").each(function (d, i) {
              const isActive = i === nutrientIndex;
              d3.select(this)
                .classed("active", isActive)
                .style("background-color", isActive ? "#6ca796" : "#f8f9fa")
                .style("color", isActive ? "white" : "#333");
            });
          }
        }
      } catch (error) {
        console.error("Error in updateChart9:", error);
      }
    };
  } catch (error) {
    console.error("Error loading or processing nutrition data:", error);
  }
})();
