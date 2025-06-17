// chart3.js
// Fast Food Chain Growth over the years Visualization

(async function () {
  if (window.chart3Initialized) {
    console.log("Chart3 is already initialized, skipping initialization");
    return;
  }

  const container = d3.select("#viz3");
  container.html("");

  container.style("opacity", "0");
  container.style("visibility", "hidden");
  container.style("transition", "opacity 0.8s ease-in-out, visibility 0s");
  container.style("background-color", "#f8f9fa");

  window.chart3Initialized = false;
  window.chart3AnimatedOnce = false;
  window.chart3Rendered = false;

  try {
    const logoURLs = {
      McDonalds: "Data/images/MC.png",
      KFC: "Data/images/KFC.jpeg",
      "Burger King": "Data/images/burger-king.png",
      "Dunkin Donuts": "Data/images/DD.png",
      Starbucks: "Data/images/starbucks.webp",
      "Pizza Hut": "Data/images/PH.webp",
      "Taco Bell": "Data/images/TB.jpeg",
      Subway: "Data/images/sub.jpeg",
      Dominos: "Data/images/DP.jpeg",
      "Hunt Brothers Pizza": "Data/images/HB.jpg",
      "Dairy Queen": "Data/images/DQ.jpeg",
      Wendys: "Data/images/wendys.jpeg",
      "Baskin Robbins": "Data/images/BR.png",
      Hardees: "Data/images/hP.png",
      "Papa Johns Pizza": "Data/images/papa J.png",
      "Little Caesars": "Data/images/LC.png",
    };

    const chainGroups = {
      intro: [],
      originalPioneers: ["McDonalds", "KFC"],
      burgerCompetitors: ["Burger King", "Wendys"],
      coffeeAndDonuts: ["Starbucks", "Dunkin Donuts"],
      pizzaChains: [
        "Pizza Hut",
        "Dominos",
        "Papa Johns Pizza",
        "Little Caesars",
        "Hunt Brothers Pizza",
      ],
      diversity: [
        "Taco Bell",
        "Subway",
        "Dairy Queen",
        "Baskin Robbins",
        "Hardees",
      ],
    };

    const data = await d3
      .csv("Data/datasets/fastfood_milestones.csv")
      .then((data) => {
        return data.map((d) => {
          return {
            Chain: d.Chain,
            Milestone: +d.Milestone,
            Year: +d.Year,
          };
        });
      })
      .catch((error) => {
        console.error("Error loading CSV:", error);
        return null;
      });

    const processedData = data || [
      { Chain: "McDonalds", Milestone: 100, Year: 1940 },
      { Chain: "McDonalds", Milestone: 500, Year: 1963 },
      { Chain: "McDonalds", Milestone: 1000, Year: 1968 },
      { Chain: "McDonalds", Milestone: 2000, Year: 1972 },
      { Chain: "McDonalds", Milestone: 3000, Year: 1974 },
      { Chain: "McDonalds", Milestone: 5000, Year: 1978 },
      { Chain: "McDonalds", Milestone: 10000, Year: 1988 },
      { Chain: "McDonalds", Milestone: 40000, Year: 2023 },
      { Chain: "KFC", Milestone: 100, Year: 1930 },
      { Chain: "KFC", Milestone: 500, Year: 1963 },
      { Chain: "KFC", Milestone: 3000, Year: 1970 },
      { Chain: "KFC", Milestone: 5000, Year: 1983 },
      { Chain: "KFC", Milestone: 10000, Year: 1995 },
      { Chain: "KFC", Milestone: 30000, Year: 2023 },
      { Chain: "Burger King", Milestone: 100, Year: 1953 },
      { Chain: "Burger King", Milestone: 100, Year: 1970 },
      { Chain: "Burger King", Milestone: 2000, Year: 1977 },
      { Chain: "Burger King", Milestone: 3000, Year: 1982 },
      { Chain: "Burger King", Milestone: 5000, Year: 1989 },
      { Chain: "Burger King", Milestone: 10000, Year: 1998 },
      { Chain: "Burger King", Milestone: 20000, Year: 2023 },
      { Chain: "Dunkin Donuts", Milestone: 100, Year: 1948 },
      { Chain: "Dunkin Donuts", Milestone: 100, Year: 1965 },
      { Chain: "Dunkin Donuts", Milestone: 1000, Year: 1979 },
      { Chain: "Dunkin Donuts", Milestone: 2000, Year: 1990 },
      { Chain: "Dunkin Donuts", Milestone: 3000, Year: 1992 },
      { Chain: "Dunkin Donuts", Milestone: 5000, Year: 2002 },
      { Chain: "Dunkin Donuts", Milestone: 10000, Year: 2011 },
      { Chain: "Dunkin Donuts", Milestone: 13200, Year: 2023 },
      { Chain: "Starbucks", Milestone: 100, Year: 1991 },
      { Chain: "Starbucks", Milestone: 500, Year: 1995 },
      { Chain: "Starbucks", Milestone: 1000, Year: 1996 },
      { Chain: "Starbucks", Milestone: 2000, Year: 1999 },
      { Chain: "Starbucks", Milestone: 3000, Year: 2000 },
      { Chain: "Starbucks", Milestone: 5000, Year: 2002 },
      { Chain: "Starbucks", Milestone: 10000, Year: 2005 },
      { Chain: "Starbucks", Milestone: 38000, Year: 2023 },
      { Chain: "Pizza Hut", Milestone: 1000, Year: 1972 },
      { Chain: "Pizza Hut", Milestone: 2000, Year: 1976 },
      { Chain: "Pizza Hut", Milestone: 3000, Year: 1977 },
      { Chain: "Pizza Hut", Milestone: 5000, Year: 1986 },
      { Chain: "Pizza Hut", Milestone: 10000, Year: 1994 },
      { Chain: "Pizza Hut", Milestone: 19900, Year: 2023 },
      { Chain: "Taco Bell", Milestone: 100, Year: 1967 },
      { Chain: "Taco Bell", Milestone: 2000, Year: 1985 },
      { Chain: "Taco Bell", Milestone: 3000, Year: 1990 },
      { Chain: "Taco Bell", Milestone: 5000, Year: 2010 },
      { Chain: "Taco Bell", Milestone: 8200, Year: 2023 },
      { Chain: "Subway", Milestone: 100, Year: 1978 },
      { Chain: "Subway", Milestone: 500, Year: 1985 },
      { Chain: "Subway", Milestone: 1000, Year: 1987 },
      { Chain: "Subway", Milestone: 2000, Year: 1988 },
      { Chain: "Subway", Milestone: 5000, Year: 1990 },
      { Chain: "Subway", Milestone: 10000, Year: 1998 },
      { Chain: "Subway", Milestone: 37000, Year: 2023 },
      { Chain: "Dominos", Milestone: 100, Year: 1960 },
      { Chain: "Dominos", Milestone: 1000, Year: 1983 },
      { Chain: "Dominos", Milestone: 2000, Year: 1985 },
      { Chain: "Dominos", Milestone: 5000, Year: 1989 },
      { Chain: "Dominos", Milestone: 10000, Year: 2012 },
      { Chain: "Dominos", Milestone: 19800, Year: 2023 },
      { Chain: "Hunt Brothers Pizza", Milestone: 750, Year: 1994 },
      { Chain: "Hunt Brothers Pizza", Milestone: 5000, Year: 2015 },
      { Chain: "Hunt Brothers Pizza", Milestone: 9500, Year: 2023 },
      { Chain: "Dairy Queen", Milestone: 100, Year: 1947 },
      { Chain: "Dairy Queen", Milestone: 1000, Year: 1950 },
      { Chain: "Dairy Queen", Milestone: 2000, Year: 1955 },
      { Chain: "Dairy Queen", Milestone: 5000, Year: 1996 },
      { Chain: "Dairy Queen", Milestone: 7000, Year: 2023 },
      { Chain: "Wendys", Milestone: 100, Year: 1975 },
      { Chain: "Wendys", Milestone: 500, Year: 1976 },
      { Chain: "Wendys", Milestone: 1000, Year: 1978 },
      { Chain: "Wendys", Milestone: 2000, Year: 1980 },
      { Chain: "Wendys", Milestone: 3000, Year: 1985 },
      { Chain: "Wendys", Milestone: 5000, Year: 1997 },
      { Chain: "Wendys", Milestone: 7000, Year: 2023 },
      { Chain: "Baskin Robbins", Milestone: 100, Year: 1960 },
      { Chain: "Baskin Robbins", Milestone: 500, Year: 1967 },
      { Chain: "Baskin Robbins", Milestone: 1000, Year: 1979 },
      { Chain: "Baskin Robbins", Milestone: 5000, Year: 2000 },
      { Chain: "Baskin Robbins", Milestone: 8000, Year: 2023 },
      { Chain: "Hardees", Milestone: 2000, Year: 1980 },
      { Chain: "Hardees", Milestone: 3000, Year: 1997 },
      { Chain: "Hardees", Milestone: 5800, Year: 2022 },
      { Chain: "Papa Johns Pizza", Milestone: 500, Year: 1994 },
      { Chain: "Papa Johns Pizza", Milestone: 1000, Year: 1996 },
      { Chain: "Papa Johns Pizza", Milestone: 2000, Year: 1999 },
      { Chain: "Papa Johns Pizza", Milestone: 3000, Year: 2001 },
      { Chain: "Papa Johns Pizza", Milestone: 5000, Year: 2017 },
      { Chain: "Papa Johns Pizza", Milestone: 5400, Year: 2022 },
      { Chain: "Little Caesars", Milestone: 500, Year: 1984 },
      { Chain: "Little Caesars", Milestone: 1000, Year: 1986 },
      { Chain: "Little Caesars", Milestone: 2000, Year: 1997 },
      { Chain: "Little Caesars", Milestone: 5000, Year: 2017 },
      { Chain: "Little Caesars", Milestone: 5300, Year: 2023 },
    ];

    const chartWrapper = container
      .append("div")
      .attr("class", "chart-container")
      .style("width", "100%")
      .style("height", "100%")
      .style("display", "flex")
      .style("justify-content", "center")
      .style("align-items", "center")
      .style("position", "relative")
      .style("margin", "0 auto");

    const tooltip = d3
      .select("body")
      .append("div")
      .attr("id", "chart3-tooltip")
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #d32f2f")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("visibility", "hidden")
      .style("font-size", "14px")
      .style("pointer-events", "none")
      .style("box-shadow", "0 2px 5px rgba(0,0,0,0.2)")
      .style("z-index", "1000");

    const defaultColor = "#E6E6FA";
    const hoverColor = "#CCFF99";
    const logoHeight = 50;
    const logoWidth = 50;
    const logoYOffset = -60;
    const margin = { top: 100, right: 20, bottom: 120, left: 60 };

    const innerW = 1200 - margin.left - margin.right;
    const innerH = 800 - margin.top - margin.bottom;

    const svg = chartWrapper
      .append("svg")
      .attr(
        "viewBox",
        `0 0 ${innerW + margin.left + margin.right} ${
          innerH + margin.top + margin.bottom
        }`
      )
      .attr("preserveAspectRatio", "xMidYMid meet")
      .style("width", "100%")
      .style("height", "100%")
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top + 75})`); // Move chart 50px down

    const minY = d3.min(processedData, (d) => d.Year);
    const maxY = d3.max(processedData, (d) => d.Year);
    const yScale = d3
      .scaleLinear()
      .domain([minY, maxY + 1])
      .range([0, innerH]);

    const chains = Array.from(
      d3.group(processedData, (d) => d.Chain),
      ([chain, arr]) => ({
        chain,
        milestones: arr.sort((a, b) => d3.ascending(a.Year, b.Year)),
      })
    );

    const uniqueChains = [...new Set(processedData.map((d) => d.Chain))];

    const filteredChains = chains.filter((c) => uniqueChains.includes(c.chain));

    const processed = filteredChains.map((c) => {
      const segs = [];
      c.milestones.forEach((m, i) => {
        const start = m.Year;
        const end =
          i + 1 < c.milestones.length ? c.milestones[i + 1].Year : maxY + 1;
        segs.push({
          chain: c.chain,
          milestone: m.Milestone,
          start,
          end,
          targetY: yScale(start),
          targetH: yScale(end) - yScale(start),
        });
      });
      return { chain: c.chain, segments: segs };
    });

    const xScale = d3
      .scaleBand()
      .domain(processed.map((d) => d.chain))
      .range([0, innerW])
      .paddingInner(0.01);

    const groups = svg
      .selectAll(".bar-group")
      .data(processed)
      .enter()
      .append("g")
      .attr("class", "bar-group")
      .attr("transform", (d) => `translate(${xScale(d.chain)},0)`);

    groups.each(function (d) {
      if (!logoURLs[d.chain]) return;
      const bw = xScale.bandwidth();
      const g = d3.select(this);
      g.append("image")
        .attr("xlink:href", logoURLs[d.chain])
        .attr("x", (bw - logoWidth) / 2)
        .attr("y", logoYOffset)
        .attr("width", logoWidth)
        .attr("height", logoHeight);
    });

    groups.each(function (d) {
      const g = d3.select(this);
      const bw = xScale.bandwidth();
      g.selectAll("rect")
        .data(d.segments)
        .enter()
        .append("rect")
        .attr("class", "bar-segment")
        .attr("x", 0)
        .attr("width", bw)
        .attr("y", -50)
        .attr("height", 0)
        .attr("fill", defaultColor)
        .attr("stroke", "#d48af1")
        .attr("stroke-width", 1)
        .on("mouseover", function (event, seg) {
          d3.select(this).attr("fill", hoverColor);
          tooltip
            .style("visibility", "visible")
            .html(
              `<strong>${
                seg.chain
              }</strong><br><b>${seg.milestone.toLocaleString()}</b> stores<br>Year: <b>${
                seg.start
              }</b>`
            );
        })
        .on("mousemove", (event) => {
          tooltip
            .style("left", event.pageX + 12 + "px")
            .style("top", event.pageY - 28 + "px");
        })
        .on("mouseout", function () {
          d3.select(this).attr("fill", defaultColor);
          tooltip.style("visibility", "hidden");
        });
    });

    svg
      .append("g")
      .attr("class", "axis")
      .call(d3.axisLeft(yScale).tickFormat(d3.format("d")).tickSizeOuter(0));

    svg
      .append("g")
      .attr("class", "axis")
      .attr("transform", `translate(0,${innerH})`)
      .call(d3.axisBottom(xScale).tickSizeOuter(0))
      .selectAll("text")
      .attr("transform", "rotate(-45)")
      .style("text-anchor", "end");

    svg
      .append("text")
      .attr("x", innerW / 2)
      .attr("y", -120)
      .attr("text-anchor", "middle")
      .style("font-size", "26px")
      .style("font-weight", "bold")
      .text("Fast Food Chain Growth Timeline");

    svg
      .append("text")
      .attr("x", innerW / 2)
      .attr("y", -90)
      .attr("text-anchor", "middle")
      .style("font-size", "16px")
      .text("Store Count Milestones from First Location to Present Day");

    applyChartCSS();

    function applyChartCSS() {
      const styleRules = `
        .axis path,
        .axis line {
          stroke: #aaa;
        }
        .axis text {
          font-size: 12px;
        }
        #chart3-tooltip {
          background: white;
          border: 1px solid #d32f2f;
          padding: 10px;
          border-radius: 5px;
          font-size: 14px;
          pointer-events: none;
          box-shadow: 0 2px 5px rgba(0,0,0,0.2);
        }
        #scrolly-section3 h2 {
          position: sticky;
          top: 0;
          background-color: rgba(248, 249, 250, 0.9);
          z-index: 100;
          margin: 0;
          padding: 1rem;
        }
      `;

      const styleElement = document.createElement("style");
      styleElement.textContent = styleRules;
      document.head.appendChild(styleElement);
    }

    function setupScrolling() {
      window.updateChart3 = function (progress, stepIndex) {
        try {
          if (!window.chart3Rendered && progress > 0.1) {
            console.log("Initializing chart3 elements");
            window.chart3Rendered = true;

            container.style("visibility", "visible");
            container.style("opacity", "1");

            window.chart3AnimationTriggered =
              window.chart3AnimationTriggered || {
                step0: false,
                step1: false,
                step2: false,
                step3: false,
                step4: false,
                step5: false,
              };

            if (stepIndex === 0) {
              window.chart3AnimationTriggered.step0 = true;
            } else if (stepIndex === 1) {
              animateChains(chainGroups.originalPioneers);
              window.chart3AnimationTriggered.step0 = true;
              window.chart3AnimationTriggered.step1 = true;
            } else if (stepIndex === 2) {
              animateChains(chainGroups.originalPioneers);
              animateChains(chainGroups.burgerCompetitors);
              window.chart3AnimationTriggered.step0 = true;
              window.chart3AnimationTriggered.step1 = true;
              window.chart3AnimationTriggered.step2 = true;
            } else if (stepIndex === 3) {
              animateChains(chainGroups.originalPioneers);
              animateChains(chainGroups.burgerCompetitors);
              animateChains(chainGroups.coffeeAndDonuts);
              window.chart3AnimationTriggered.step0 = true;
              window.chart3AnimationTriggered.step1 = true;
              window.chart3AnimationTriggered.step2 = true;
              window.chart3AnimationTriggered.step3 = true;
            } else if (stepIndex === 4) {
              animateChains(chainGroups.originalPioneers);
              animateChains(chainGroups.burgerCompetitors);
              animateChains(chainGroups.coffeeAndDonuts);
              animateChains(chainGroups.pizzaChains);
              window.chart3AnimationTriggered.step0 = true;
              window.chart3AnimationTriggered.step1 = true;
              window.chart3AnimationTriggered.step2 = true;
              window.chart3AnimationTriggered.step3 = true;
              window.chart3AnimationTriggered.step4 = true;
            } else if (stepIndex === 5) {
              const allChains = [
                ...chainGroups.originalPioneers,
                ...chainGroups.burgerCompetitors,
                ...chainGroups.coffeeAndDonuts,
                ...chainGroups.pizzaChains,
                ...chainGroups.diversity,
              ];
              animateChains(allChains);

              Object.keys(window.chart3AnimationTriggered).forEach((key) => {
                window.chart3AnimationTriggered[key] = true;
              });
            } else {
              animateChains(processed.map((c) => c.chain));
              Object.keys(window.chart3AnimationTriggered).forEach((key) => {
                window.chart3AnimationTriggered[key] = true;
              });
            }

            window.chart3AnimatedOnce = true;
          } else if (window.chart3Rendered) {
            if (stepIndex === 0) {
            } else if (
              stepIndex === 1 &&
              !window.chart3AnimationTriggered.step1
            ) {
              animateChains(chainGroups.originalPioneers);
              window.chart3AnimationTriggered.step1 = true;
            } else if (
              stepIndex === 2 &&
              !window.chart3AnimationTriggered.step2
            ) {
              animateChains(chainGroups.burgerCompetitors);
              window.chart3AnimationTriggered.step2 = true;
            } else if (
              stepIndex === 3 &&
              !window.chart3AnimationTriggered.step3
            ) {
              animateChains(chainGroups.coffeeAndDonuts);
              window.chart3AnimationTriggered.step3 = true;
            } else if (
              stepIndex === 4 &&
              !window.chart3AnimationTriggered.step4
            ) {
              animateChains(chainGroups.pizzaChains);
              window.chart3AnimationTriggered.step4 = true;
            } else if (
              stepIndex === 5 &&
              !window.chart3AnimationTriggered.step5
            ) {
              animateChains(chainGroups.diversity);
              window.chart3AnimationTriggered.step5 = true;
            }
          }
        } catch (err) {
          console.error("Error in updateChart3:", err);
        }
      };

      function animateChains(chainList) {
        processed.forEach((chainData, chainIndex) => {
          if (chainList.includes(chainData.chain)) {
            d3.select(groups.nodes()[chainIndex])
              .selectAll("rect.bar-segment")
              .transition()
              .delay((d, i) => i * 300)
              .duration(800)
              .attr("y", (d) => d.targetY)
              .attr("height", (d) => d.targetH);
          }
        });
      }
    }

    window.chart3Initialized = true;
    setupScrolling();
    console.log("Chart3 initialized and ready for scrollytelling");
  } catch (error) {
    console.error("Error initializing Chart3:", error);
    container.style("visibility", "visible").style("opacity", "1");
    container.html(
      "<div style='padding: 2rem; text-align: center;'>Unable to load fast food chain growth visualization. Please check your connection and try again.</div>"
    );
  }
})();
