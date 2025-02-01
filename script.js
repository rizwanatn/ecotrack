const categories = [
    {
      name: "Travel & Transportation",
      actions: [
        { label: "Walked or cycled", points: 1 },
        { label: "Used public transport", points: 2 },
        { label: "Carpooled or rideshared", points: 3 },
        { label: "Turned off engine when idling", points: 1 },
        { label: "Used an electric/hybrid vehicle", points: 3 },
      ]
    },
    {
      name: "Home & Energy Use",
      actions: [
        { label: "Turned off lights and devices", points: 1 },
        { label: "Used LED bulbs", points: 2 },
        { label: "Reduced AC/heating use", points: 2 },
        { label: "Ventilated naturally", points: 1 },
      ]
    },
    {
      name: "Food & Diet",
      actions: [
        { label: "Ate plant-based meals", points: 3 },
        { label: "Used reusable bags and bottles", points: 1 },
        { label: "Reduced food waste", points: 2 },
        { label: "Avoided packaged drinks", points: 1 },
      ]
    },
    {
      name: "Workplace & Study",
      actions: [
        { label: "Used digital notes", points: 1 },
        { label: "Printed only when needed", points: 1 },
        { label: "Turned off devices", points: 1 },
        { label: "Used a reusable mug", points: 1 },
      ]
    },
    {
      name: "Water Conservation",
      actions: [
        { label: "Took shorter showers", points: 2 },
        { label: "Fixed leaks or turned off taps", points: 1 },
        { label: "Used water-efficient fixtures", points: 2 },
      ]
    },
    {
      name: "Waste Management",
      actions: [
        { label: "Recycled", points: 2 },
        { label: "Avoided single-use plastics", points: 2 },
        { label: "Reused or upcycled items", points: 3 },
      ]
    },
    {
      name: "Nature & Outdoor Activities",
      actions: [
        { label: "Planted a tree or cared for plants", points: 3 },
        { label: "Participated in clean-ups", points: 2 },
        { label: "Used eco-friendly products", points: 2 },
      ]
    },
    {
      name: "Shopping & Consumption",
      actions: [
        { label: "Bought second-hand", points: 2 },
        { label: "Chose minimal packaging", points: 2 },
        { label: "Supported sustainable brands", points: 3 },
        { label: "Used a reusable shopping bag", points: 1 },
      ]
    }
  ];
  
  let dailyPoints = 0;
  let weeklyPoints = 0;
  let dailyStreak = 0;
  
  const categoriesContainer = document.getElementById("categories");
  const submitButton = document.getElementById("submit-btn");
  const streakDisplay = document.getElementById("streak");
  
  function createCategory(category) {
    const categoryDiv = document.createElement("div");
    categoryDiv.classList.add("category");
  
    const categoryTitle = document.createElement("h3");
    categoryTitle.innerText = category.name;
    categoryDiv.appendChild(categoryTitle);
  
    const actionList = document.createElement("ul");
    actionList.classList.add("checkbox-list");
  
    category.actions.forEach(action => {
      const listItem = document.createElement("li");
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.value = action.points;
      checkbox.addEventListener("change", handleCheckboxChange);
      const label = document.createElement("label");
      label.innerText = `${action.label} (+${action.points} points)`;
      listItem.appendChild(checkbox);
      listItem.appendChild(label);
      actionList.appendChild(listItem);
    });
  
    categoryDiv.appendChild(actionList);
    categoriesContainer.appendChild(categoryDiv);
  }
  
  function handleCheckboxChange() {
    dailyPoints = 0;
    const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
    checkboxes.forEach(checkbox => {
      dailyPoints += parseInt(checkbox.value);
    });
    updateUI();
  }
  
  function updateUI() {
    // Enable submit if at least one action is selected
    submitButton.disabled = !document.querySelector('input[type="checkbox"]:checked');
  
    // Update streak display
    streakDisplay.innerText = dailyStreak;
  
    // Display points
    console.log(`Daily Points: ${dailyPoints}`);
  }
  
  function resetDailyPoints() {
    dailyPoints = 0;
    updateUI();
  }
  
  function resetWeeklyPoints() {
    weeklyPoints = 0;
    updateUI();
  }
  
  function checkStreak() {
    // This function will check for streak logic (to be implemented based on user interaction dates)
  }
  
  function submitAction() {
    if (dailyPoints > 0) {
      // Prepare the data to be sent to the backend
      const actions = [];
      const checkboxes = document.querySelectorAll('input[type="checkbox"]:checked');
      checkboxes.forEach(checkbox => {
        actions.push({
          name: checkbox.parentNode.textContent.trim(),
          points: parseInt(checkbox.value)
        });
      });
  
      const userId = 1;  // For now, set a static user_id (you can adjust this based on your login system)
  
      // Send data to the backend via a POST request
      fetch('/submit_actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ user_id: userId, actions: actions })
      })
      .then(response => {
        // Check if the response is OK (status code 2xx)
        if (!response.ok) {
          throw new Error('Failed to submit actions');
        }
        return response.json();  // Parse the JSON response
      })
      .then(data => {
        console.log('Submission successful:', data);
        resetDailyPoints();
        alert(data.message);  // Display success message
      })
      .catch(error => {
        console.error('Error:', error);
        alert('Failed to submit actions. Please try again.');
      });
    } else {
      alert("Please select at least one action to submit.");
    }
  }
  
  setInterval(checkStreak, 1000);  // Just an example of streak check
  
  // Initialize categories
  categories.forEach(createCategory);
  
  submitButton.addEventListener("click", submitAction);
  