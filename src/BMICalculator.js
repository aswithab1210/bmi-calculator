import React, { useState, useEffect } from 'react';
import { CircularProgressbar, buildStyles } from 'react-circular-progressbar';
import 'react-circular-progressbar/dist/styles.css';
import './App.css';

const BMICalculator = () => {
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [bmi, setBmi] = useState(null);
  const [status, setStatus] = useState("");
  const [history, setHistory] = useState([]);
  const [unit, setUnit] = useState("select");
  const [gender, setGender] = useState("select");

  useEffect(() => {
    const savedHistory = JSON.parse(localStorage.getItem("bmiHistory"));
    if (savedHistory) setHistory(savedHistory);
  }, []);

  useEffect(() => {
    localStorage.setItem("bmiHistory", JSON.stringify(history));
  }, [history]);

  const calculateBMI = () => {
    if (weight > 0 && height > 0 && unit !== "select" && gender !== "select") {
      let calculatedBmi;
      if (unit === "imperial") {
        const hM = (height * 2.54) / 100;
        const wKg = weight * 0.453592;
        calculatedBmi = (wKg / (hM * hM)).toFixed(2);
      } else {
        const hM = height / 100;
        calculatedBmi = (weight / (hM * hM)).toFixed(2);
      }

      let category = "";
      if (gender === "male") {
        if (calculatedBmi < 20) category = "Underweight";
        else if (calculatedBmi < 25) category = "Normal weight";
        else if (calculatedBmi < 30) category = "Overweight";
        else category = "Obese";
      } else {
        if (calculatedBmi < 18.5) category = "Underweight";
        else if (calculatedBmi < 25) category = "Normal weight";
        else if (calculatedBmi < 30) category = "Overweight";
        else category = "Obese";
      }

      const newEntry = {
        unit,
        weight,
        height,
        bmi: calculatedBmi,
        status: category,
        gender,
        date: new Date().toLocaleString()
      };

      setBmi(calculatedBmi);
      setStatus(category);
      setHistory([newEntry, ...history]);
    } else {
      setBmi(null);
      setStatus("Please select valid inputs for Unit and Gender, and enter valid weight and height.");
    }
  };

  const handleUnitChange = (newUnit) => {
    if (weight && height) {
      if (newUnit === "imperial" && unit === "metric") {
        setWeight((weight * 2.20462).toFixed(2));
        setHeight((height / 2.54).toFixed(2));
      } else if (newUnit === "metric" && unit === "imperial") {
        setWeight((weight * 0.453592).toFixed(2));
        setHeight((height * 2.54).toFixed(2));
      }
    }
    setBmi(null);
    setStatus("");
    setUnit(newUnit);
  };

  const getBadgeClass = (category) => {
    switch (category) {
      case "Underweight": return "badge bg-primary";
      case "Normal weight": return "badge bg-success";
      case "Overweight": return "badge bg-warning text-dark";
      case "Obese": return "badge bg-danger";
      default: return "badge bg-secondary";
    }
  };

  const clearHistory = () => {
    if (window.confirm("Are you sure you want to clear your BMI history?")) {
      setHistory([]);
      localStorage.removeItem("bmiHistory");
    }
  };

  const clearCalculator = () => {
    setWeight("");
    setHeight("");
    setBmi(null);
    setStatus("");
    setUnit("select");
    setGender("select");
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-blue-500 via-purple-500 to-pink-500 text-gray-900 p-5">
      <div className="max-w-3xl mx-auto p-6 rounded-2xl shadow-xl bg-white">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-4xl font-bold text-center text-gradient">BMI Calculator</h2>
        </div>

        <div className="grid md:grid-cols-2 gap-4">
          <div>
            <label className="form-label">Unit System</label>
            <select className="form-select" value={unit} onChange={(e) => handleUnitChange(e.target.value)}>
              <option value="select">Select</option>
              <option value="imperial">Imperial (lbs & inches)</option>
              <option value="metric">Metric (kg & cm)</option>
            </select>
          </div>

          <div>
            <label className="form-label">Gender</label>
            <select className="form-select" value={gender} onChange={(e) => setGender(e.target.value)}>
              <option value="select">Select</option>
              <option value="male">Male</option>
              <option value="female">Female</option>
            </select>
          </div>
        </div>

        <div className="mt-4">
          <label className="form-label">Weight ({unit === "imperial" ? "lbs" : "kg"})</label>
          <input
            className="form-control"
            type="number"
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            placeholder={`Enter weight in ${unit === "imperial" ? "lbs" : "kg"}`}
          />
        </div>

        <div className="mt-4">
          <label className="form-label">Height ({unit === "imperial" ? "inches" : "cm"})</label>
          <input
            className="form-control"
            type="number"
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            placeholder={`Enter height in ${unit === "imperial" ? "inches" : "cm"}`}
          />
        </div>

        <div className="grid grid-cols-2 gap-4 mt-6">
          <button className="btn btn-gradient" onClick={calculateBMI}>Calculate BMI</button>
          <button className="btn btn-gradient" onClick={clearCalculator}>Clear</button>
        </div>

        {bmi && (
          <div className="alert mt-6 text-center">
            <h5>Your BMI: <strong>{bmi}</strong></h5>
            <span className={getBadgeClass(status)}>{status}</span>
            <div className="mt-4 mx-auto w-1/2">
              <CircularProgressbar
                value={bmi}
                maxValue={40}
                text={`${bmi}`}
                styles={buildStyles({
                  pathColor: bmi < 18.5 ? '#FF0000' : bmi < 24.9 ? '#00FF00' : '#FF7F00',
                  textColor: '#000',
                  trailColor: '#d6d6d6'
                })}
              />
            </div>
          </div>
        )}

        {status && !bmi && (
          <div className="alert alert-danger mt-3 text-center">
            {status}
          </div>
        )}

        {history.length > 0 && (
          <div className="mt-6">
            <div className="flex justify-between items-center mb-2">
              <h5 className="font-semibold">BMI History</h5>
              <button className="btn btn-danger" onClick={clearHistory}>Clear History</button>
            </div>
            <ul className="list-group space-y-2">
              {history.map((entry, index) => (
                <li key={index} className="list-group-item flex justify-between items-center">
                  {entry.date} — BMI: <strong>{entry.bmi}</strong> <span className={getBadgeClass(entry.status)}>{entry.status}</span> ({entry.gender})
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  );
};

export default BMICalculator;
