import streamlit as st
from openai import OpenAI
import pandas as pd
import seaborn as sns

# API key input
st.title("Enhanced Strategic Planning Coach")
st.write("Enter your OpenAI API key to begin.")
api_key = st.text_input("OpenAI API Key", type="password")

if api_key:
    # Initialize OpenAI client
    try:
        client = OpenAI(api_key=api_key)
        st.success("API key accepted!")
    except Exception as e:
        st.error(f"Invalid API key: {str(e)}")
else:
    st.warning("Please enter your OpenAI API key to proceed.")

# ChatGPT function
def chat_with_gpt(prompt):
    try:
        completion = client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": "You are a strategy planning assistant."},
                {"role": "user", "content": prompt}
            ]
        )
        return completion.choices[0].message.content
    except Exception as e:
        return f"Error: {str(e)}"

# Initialize session state
if 'conversation' not in st.session_state:
    st.session_state.conversation = []
if 'goals' not in st.session_state:
    st.session_state.goals = ""
if 'outcomes' not in st.session_state:
    st.session_state.outcomes = ""
if 'plan' not in st.session_state:
    st.session_state.plan = ""
if 'rewards' not in st.session_state:
    st.session_state.rewards = ""

# Reset button
if st.button("Reset"):
    st.session_state.conversation = []
    st.session_state.goals = ""
    st.session_state.outcomes = ""
    st.session_state.plan = ""
    st.session_state.rewards = ""
    st.experimental_rerun()

if api_key:  # Ensure the app only works after a valid API key is provided
    # Step 1: Define Strategic Goals
    st.header("Step 1: Define Your Strategic Goals")

    # Structured Inputs
    objective = st.text_input("Objective: What do you aim to achieve?")
    metrics = st.text_input("Metrics: How will success be measured?")
    timeline = st.text_input("Timeline: When do you expect results?")
    category = st.selectbox("Category", ["Financial", "Operational", "Marketing", "Other"])

    if st.button("Submit Goals"):
        if objective and metrics and timeline:
            st.session_state.goals = f"Objective: {objective}\nMetrics: {metrics}\nTimeline: {timeline}\nCategory: {category}"
            st.session_state.conversation.append(st.session_state.goals)
            st.success("Your strategic goals have been saved.")
        else:
            st.error("Please fill in all fields for your goals.")

    # Step 2: Break Down Goals into Outcomes
    st.header("Step 2: Break Down Goals into Achievable Outcomes")
    if st.session_state.goals:
        outcomes_prompt = f"Based on these goals:\n{st.session_state.goals}\nHelp me break them down into smaller, achievable outcomes."

        if st.button("Generate Outcomes"):
            st.session_state.outcomes = chat_with_gpt(outcomes_prompt)
            st.session_state.conversation.append(st.session_state.outcomes)
            st.text_area("Achievable Outcomes", st.session_state.outcomes, height=200)
        elif st.session_state.outcomes:
            st.text_area("Achievable Outcomes", st.session_state.outcomes, height=200)

    # Step 3: Plan for Each Outcome
    st.header("Step 3: Plan for Each Outcome")
    selected_outcome = st.text_area(
        "Select an outcome to plan for:",
        st.session_state.outcomes if 'outcomes' in st.session_state else ""
    )
    if selected_outcome:
        plan_prompt = f"Create a step-by-step plan to achieve this outcome:\n{selected_outcome}"
        if st.button("Generate Plan"):
            st.session_state.plan = chat_with_gpt(plan_prompt)
            st.session_state.conversation.append(st.session_state.plan)
            st.text_area("Plan for Outcome", st.session_state.plan, height=200)
        elif st.session_state.plan:
            st.text_area("Plan for Outcome", st.session_state.plan, height=200)

    # Step 4: Define Rewards
    st.header("Step 4: Define Rewards for Achieving Outcomes")
    if selected_outcome:
        reward_prompt = f"Suggest rewards for achieving this outcome:\n{selected_outcome}"
        if st.button("Generate Rewards"):
            st.session_state.rewards = chat_with_gpt(reward_prompt)
            st.session_state.conversation.append(st.session_state.rewards)
            st.text_area("Rewards", st.session_state.rewards, height=200)
        elif st.session_state.rewards:
            st.text_area("Rewards", st.session_state.rewards, height=200)

    # Step 5: Feedback Loop
    st.header("Step 5: Feedback and Iteration")
    feedback = st.radio("Does this plan align with your goals?", ["Yes", "No"])
    if feedback == "No":
        refinement_prompt = f"Refine the plan for the following feedback:\n{selected_outcome}\nFeedback: {feedback}"
        if st.button("Refine Plan"):
            refined_plan = chat_with_gpt(refinement_prompt)
            st.session_state.plan = refined_plan
            st.text_area("Refined Plan", refined_plan, height=200)

    # Step 6: Visualization Placeholder
    st.header("Step 6: Visualize Your Plan")
    st.write("Future feature: Visualize your outcomes and plans using Gantt charts or flow diagrams.")
    
    # Final Review
    st.header("Review Your Strategic Plan")
    if st.session_state.plan:
        st.write("### Your Strategic Plan")
        st.write(f"**Goals:**\n{st.session_state.goals}")
        st.write(f"**Outcome:**\n{selected_outcome}")
        st.write(f"**Plan:**\n{st.session_state.plan}")
        st.write(f"**Rewards:**\n{st.session_state.rewards}")
    else:
        st.warning("Complete all steps to review your strategic plan.")
else:
    st.warning("Please provide a valid API key to unlock the strategic planning features.")

# Footer
st.write("\n---")
st.write("Powered by ChatGPT and Streamlit.")
