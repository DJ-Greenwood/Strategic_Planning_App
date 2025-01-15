let apiKey = "";
let goals = "";

function showSpinner() {
  document.getElementById("spinner").style.display = "block";
}

function hideSpinner() {
  document.getElementById("spinner").style.display = "none";
}

document.querySelectorAll("button").forEach(button => {
  button.addEventListener("click", async (event) => {
    showSpinner();
    try {
      const buttonId = event.target.id;
      if (buttonId === "validateApiKeyButton") {
        await validateApiKey();
      } else if (buttonId === "submitGoalsButton") {
        submitGoals();
      } else if (buttonId === "generateOutcomesButton") {
        await generateOutcomes();
      } else if (buttonId === "generatePlanButton") {
        await generatePlan();
      } else if (buttonId === "generateRewardsButton") {
        await generateRewards();
      } else if (buttonId === "generateReportButton") {
        generateReport();
      } else if (buttonId === "saveReportButton") {
        await saveReport();
      } else if (buttonId === "resetFormButton") {
        await resetForm();
      }
    } finally {
      hideSpinner();
    }
  });
});

async function validateApiKey() {
  showSpinner();
  try {
    apiKey = document.getElementById("apiKey").value;
    if (!apiKey) {
      document.getElementById("apiStatus").textContent = "API Key is required!";
      return;
    }
    const response = await fetch("https://api.openai.com/v1/models", {
      headers: { Authorization: `Bearer ${apiKey}` },
    });
    if (response.ok) {
      document.getElementById("apiStatus").style.color = "green";
      document.getElementById("apiStatus").textContent = "API Key validated!";
      document.getElementById("planningSteps").style.display = "block";
      document.getElementById("apikey").hidden = true;
    } else {
      throw new Error("Invalid API Key");
    }
  } catch (error) {
    document.getElementById("apikey").textContent = error.message;
  } finally {
    hideSpinner();
  }
}

function submitGoals() {
  const objective = document.getElementById("objective").value;
  const metrics = document.getElementById("metrics").value;
  const timeline = document.getElementById("timeline").value;
  const category = document.getElementById("category").value;

  if (!objective || !metrics || !timeline || !category) {
    document.getElementById("goalsStatus").textContent = "Please fill in all fields!";
    return;
  }

  goals = `Objective: ${objective}\nMetrics: ${metrics}\nTimeline: ${timeline}\nCategory: ${category}`;
  document.getElementById("goalsStatus").textContent = "Goals saved!";
}

async function generateOutcomes() {
  showSpinner();
  try {
    const prompt = `Based on these goals:\n${goals}\nHelp me break them into specific, measurable, actionable and time-bound achievable outcomes.`;
    const outcomes = await queryOpenAI(prompt);
    document.getElementById("outcomes").value = outcomes;
  } finally {
    hideSpinner();
  }
}

async function generatePlan() {
  showSpinner();
  try {
    const selectedOutcome = document.getElementById("selectedOutcome").value;
    const prompt = `Create a step-by-step plan to achieve these outcomes. Communicate each step and how it aligns with the planned outcomes:\n${selectedOutcome}`;
    const plan = await queryOpenAI(prompt);
    document.getElementById("plan").value = plan;
  } finally {
    hideSpinner();
  }
}

async function generateRewards() {
  showSpinner();
  try {
    const selectedOutcome = document.getElementById("selectedOutcome").value;
    const prompt = `Suggest rewards for achieving the steps outlined:\n${selectedOutcome}`;
    const rewards = await queryOpenAI(prompt);
    document.getElementById("rewards").value = rewards;
  } finally {
    hideSpinner();
  }
}

function generateReport() {
  const objective = document.getElementById("objective").value;
  const metrics = document.getElementById("metrics").value;
  const timeline = document.getElementById("timeline").value;
  const category = document.getElementById("category").value;
  const outcomes = document.getElementById("outcomes").value;
  const plan = document.getElementById("plan").value;
  const rewards = document.getElementById("rewards").value;

  const report = 
    `Strategic Plan Document
    =======================
    Objective: ${objective}
    Metrics: ${metrics}
    Timeline: ${timeline}
    Category: ${category}


    ${outcomes}


    ${plan}

    
    ${rewards}`;

  document.getElementById("report").value = report;
}

async function saveReport() {
  showSpinner();
  try {
    const report = document.getElementById("report").value;
    const filename = document.getElementById("filename").value;

    if (!report || !filename) {
      document.getElementById("saveStatus").textContent = "Please fill in all fields!";
      return;
    }

    const blob = new Blob([report], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `${filename}.txt`;
    a.download = `${filename}.txt`;
    URL.revokeObjectURL(url);
    document.getElementById("saveStatus").textContent = "Report saved!";
  } finally {
    hideSpinner();
  }
}

async function resetForm() {
  showSpinner();
  try {
    document.getElementById("objective").value = "";
    document.getElementById("metrics").value = "";
    document.getElementById("timeline").value = "";
    document.getElementById("category").value = "";
    document.getElementById("outcomes").value = "";
    document.getElementById("selectedOutcome").value = "";
    document.getElementById("plan").value = "";
    document.getElementById("rewards").value = "";
    document.getElementById("report").value = "";
    document.getElementById("filename").value = "";
    document.getElementById("saveStatus").textContent = "";
    document.getElementById("goalsStatus").textContent = "";
    document.getElementById("apiStatus").textContent = "";
    document.getElementById("planningSteps").style.display = "none";
    document.getElementById("apiStatus").style.color = "red";
  } finally {
    hideSpinner();
  }
}

async function queryOpenAI(prompt) {
  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-4",
        messages: [
          { role: "system", content: "You are a strategy planning assistant." },
          { role: "user", content: prompt },
        ],
      }),
    });
    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error(error);
    return "Error generating response.";
  }
}