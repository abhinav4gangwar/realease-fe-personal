export const dummyAnalytics = {
  cards: [
    {
      id: "1",
      type: "basic",
      title: "Total Number of Assets",
      color: "secondary",
      value: "1,250",
      insight: "This shows the total number of assets currently available."
    },
    {
      id: "2",
      type: "basic",
      title: "Total Asset Value",
      color: "secondary",
      value: "₹ 382.92 Cr",
      insight: "This shows the total asset value across all assets."
    },
    {
      id: "3",
      type: "basic",
      title: "Assets in Litigation",
      color: "primary",
      value: "12.6%",
      insight: "This represents the percentage of assets that are in litigation."
    },

    {
      id: "4",
      type: "chart",
      chartType: "bar",
      title: "Asset Location Distribution",
      insight:
        "This chart displays the distribution of assets by Number, highlighting the concentration across different Cities.",
      data: [
        { label: "Mumbai", percentage: 38, value: 380, color: "#A2CFE3" },
        { label: "Bengaluru", percentage: 30, value: 300, color: "#F16F70" },
        { label: "Hyderabad", percentage: 19, value: 190, color: "#C1B5E4" },
        { label: "Delhi", percentage: 13, value: 130, color: "#5C9FAD" }
      ]
    },
    {
      id: "5",
      type: "chart",
      chartType: "pie",
      title: "Asset Type Distribution",
      insight:
        "This chart shows the distribution of assets based on their type (e.g., Residential, Commercial, Industrial).",
      data: [
        { label: "Residential", percentage: 45, value: 450, color: "#A2CFE3" },
        { label: "Commercial", percentage: 30, value: 300, color: "#F16F70" },
        { label: "Industrial", percentage: 15, value: 150, color: "#C1B5E4" },
        { label: "Agricultural", percentage: 10, value: 100, color: "#5C9FAD" }
      ]
    },
    {
      id: "6",
      type: "chart",
      chartType: "donut",
      title: "Asset Owner Distribution",
      insight:
        "This chart shows the distribution of assets owned by different owner categories.",
      data: [
        { label: "Government", percentage: 25, value: 250, color: "#A2CFE3" },
        { label: "Private", percentage: 50, value: 500, color: "#F16F70" },
        { label: "Corporate", percentage: 20, value: 200, color: "#C1B5E4" },
        { label: "Others", percentage: 5, value: 50, color: "#5C9FAD" }
      ]
    }
  ]
}
