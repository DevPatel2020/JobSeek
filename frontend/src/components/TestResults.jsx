import React, { useEffect, useState } from "react";
import { useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import axios from "axios"; // Import axios

const TestResults = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Extract index and isProject from location state
  const { index, isProject } = location.state || {}; 

  // Fetch data from Redux store
  const feedbackList = useSelector((state) => state.interviewFeedback.feedbackList);
  const testScores = useSelector((state) => state.interviewFeedback.testScores);

  const [statusMessage, setStatusMessage] = useState(""); // State for API response messages

  // Compute average score for each corresponding pair
  const combinedResults = feedbackList.map((feedback, i) => {
    const testScore = testScores[i] || {}; // Handle cases where testScores might be shorter
    const feedbackScore = feedback.score || 5; // Ensure numeric value
    const testRating = testScore.rating || 0; // Use `rating` instead of `ratings`

    const averageScore = ((feedbackScore + testRating) / 2).toFixed(2); // Compute average score

    return parseFloat(averageScore); // Convert to number for summation
  });

  // Calculate total average score
  const totalAverageScore = combinedResults.length > 0 
    ? (combinedResults.reduce((sum, score) => sum + score, 0) / combinedResults.length).toFixed(2)
    : 0;

  // Function to send data to levelUpdate API
  const handleLevelUpdate = async () => {
    try {
      const response = await axios.post("http://localhost:8000/api/v1/resume/levelUpdate", {
        index,
        isProject,
        totalAverageScore,
        
      },{withCredentials:true});
console.log(response)
     
    } catch (error) {
      console.error("Error updating skill level:", error);
      setStatusMessage("Error connecting to server.");
    }
  };

  // Call API when totalAverageScore is computed
  useEffect(() => {
    if (index !== undefined && totalAverageScore > 0) {
      handleLevelUpdate();
    }
  }, [index, totalAverageScore]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 to-purple-500 text-white p-5">
      {/* Heading */}
      <h1 className="text-4xl font-extrabold mb-6 drop-shadow-lg">Test Results</h1>

      {/* Display index and isProject */}
      <p className="text-lg">{isProject ? `Project Test - Question ${index + 1}` : `Regular Test - Question ${index + 1}`}</p>

      {/* Circular Score Display */}
      <div className="relative flex justify-center items-center mb-6 w-40 h-40">
        <svg className="absolute w-full h-full" viewBox="0 0 36 36">
          <circle className="text-gray-200 stroke-current" strokeWidth="3" cx="18" cy="18" r="16" fill="none" />
          <circle
            className="text-yellow-300 stroke-current"
            strokeWidth="3"
            strokeDasharray="100"
            strokeDashoffset={100 - totalAverageScore * 10}
            cx="18"
            cy="18"
            r="16"
            fill="none"
          />
        </svg>
        <span className="absolute text-2xl font-bold">{totalAverageScore}/10</span>
      </div>

      {/* Display Total Average Score */}
      <div className="w-full max-w-md bg-white text-gray-800 p-6 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold mb-3 text-blue-600">Overall Performance</h2>
        <p className="text-lg font-semibold">Your average score is <span className="text-blue-500 text-3xl">{totalAverageScore}</span> out of 10.</p>
      </div>

      {/* API Response Message */}
      {statusMessage && (
        <p className="mt-4 text-lg font-semibold text-yellow-300">{statusMessage}</p>
      )}

      {/* Navigation Button */}
      <button 
        className="bg-yellow-400 text-gray-900 px-6 py-3 mt-6 rounded-full font-bold text-lg hover:bg-yellow-500 transition shadow-md"
        onClick={() => navigate("/")}
      >
        Go to Home
      </button>
    </div>
  );
};

export default TestResults;
