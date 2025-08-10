import React, { useState, useEffect } from 'react';

// This is the core of the application, a self-contained React component
// that simulates an HVAC system and an AI learning to control it.

// Helper component for creating a clean, responsive line chart using SVG.
// This avoids external libraries and keeps the project self-contained.
const LineChart = ({ data, xKey, yKeys, title, colors }) => {
    if (!data || data.length === 0) return null;

    const margin = { top: 20, right: 20, bottom: 30, left: 50 };
    const svgWidth = 600;
    const svgHeight = 250;
    const width = svgWidth - margin.left - margin.right;
    const height = svgHeight - margin.top - margin.bottom;

    const xMax = data.length > 0 ? Math.max(...data.map((d, i) => i)) : 0;
    const yMax = Math.max(...yKeys.flatMap(key => data.map(d => d[key])));
    const yMin = Math.min(...yKeys.flatMap(key => data.map(d => d[key])));
    const yRange = yMax - yMin;

    const xScale = (i) => (i / xMax) * width;
    const yScale = (value) => height - ((value - yMin) / yRange) * height;

    const getLinePath = (key) => {
        return data.map((d, i) => {
            const x = xScale(i);
            const y = yScale(d[key]);
            return `${i === 0 ? 'M' : 'L'} ${x} ${y}`;
        }).join(' ');
    };

    const yAxisTicks = Array.from({ length: 5 }, (_, i) => {
        const value = yMin + (yRange / 4) * i;
        const y = yScale(value);
        return (
            <g key={i} transform={`translate(0, ${y})`}>
                <line x2={-5} stroke="rgba(255, 255, 255, 0.4)" />
                <text x={-10} dy=".32em" textAnchor="end" fill="white" fontSize="12">
                    {value.toFixed(1)}
                </text>
            </g>
        );
    });

    const xAxisTicks = Array.from({ length: 5 }, (_, i) => {
        const value = (xMax / 4) * i;
        const x = xScale(value);
        return (
            <g key={i} transform={`translate(${x}, ${height})`}>
                <line y2={5} stroke="rgba(255, 255, 255, 0.4)" />
                <text y={15} dy=".32em" textAnchor="middle" fill="white" fontSize="12">
                    {value.toFixed(0)}
                </text>
            </g>
        );
    });

    return (
        <div className="w-full h-full p-4 bg-gray-900 rounded-xl shadow-lg">
            <h3 className="text-xl font-semibold text-white mb-4 text-center">{title}</h3>
            <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`}>
                <g transform={`translate(${margin.left}, ${margin.top})`}>
                    {/* Y-Axis */}
                    <line x1={0} y1={0} x2={0} y2={height} stroke="rgba(255, 255, 255, 0.4)" />
                    {yAxisTicks}
                    {/* X-Axis */}
                    <line x1={0} y1={height} x2={width} y2={height} stroke="rgba(255, 255, 255, 0.4)" />
                    {xAxisTicks}
                    {/* Data Lines */}
                    {yKeys.map((key, index) => (
                        <path
                            key={key}
                            d={getLinePath(key)}
                            stroke={colors[index] || 'white'}
                            strokeWidth="2"
                            fill="none"
                        />
                    ))}
                </g>
            </svg>
            <div className="flex justify-center mt-2">
                {yKeys.map((key, index) => (
                    <div key={key} className="flex items-center mx-2">
                        <div className="w-4 h-4 rounded-full" style={{ backgroundColor: colors[index] }}></div>
                        <span className="text-white text-sm ml-2">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                    </div>
                ))}
            </div>
        </div>
    );
};

// The main application component
const App = () => {
    // === SIMULATION STATE MANAGEMENT ===
    // We use React's useState hook to manage the state of our simulation.
    // This includes environmental factors, the AI's performance metrics,
    // and the simulation's history for charting.

    // Environmental state
    const [roomTemp, setRoomTemp] = useState(22); // Initial room temperature in °C
    const [extTemp, setExtTemp] = useState(30);   // External temperature, simulates weather
    const [roomHumid, setRoomHumid] = useState(50); // Initial room humidity in %
    const targetTemp = 23; // The ideal temperature the AI tries to maintain

    // Simulation controls
    const [isSimulating, setIsSimulating] = useState(false);
    const [simTime, setSimTime] = useState(0);

    // AI and performance metrics
    const [learningRate, setLearningRate] = useState(0.01); // Simulates the AI "getting smarter"
    const [cumulativeReward, setCumulativeReward] = useState(0); // AI's total score
    const [energyConsumption, setEnergyConsumption] = useState(0); // Total energy used
    const [action, setAction] = useState('Idle'); // Current action of the HVAC system

    // Data history for plotting
    const [history, setHistory] = useState([]);

    // === SIMULATION LOGIC: THE CORE GAME LOOP ===
    // The useEffect hook runs the simulation loop whenever 'isSimulating' changes.
    // This is the heart of the project where all the physics and AI decisions happen.
    useEffect(() => {
        let interval;
        if (isSimulating) {
            interval = setInterval(() => {
                // 1. Update Simulation Time
                setSimTime(prevTime => prevTime + 1);

                // 2. The AI Agent Makes a Decision (Reinforcement Learning Logic)
                // This is a simplified "policy" that improves with a higher learning rate.
                let nextAction = 'Idle';
                let energyUsed = 0;
                let newRoomTemp = roomTemp;
                let newRoomHumid = roomHumid;

                const tempDiff = roomTemp - targetTemp;

                // The AI's decision is based on its current learning rate.
                // A higher learning rate means more precise, energy-efficient actions.
                if (tempDiff > 0.5) { // Room is too warm, need to cool
                    // Cooling action
                    const coolingPower = 0.5 * (1 + learningRate * 5); // Learning makes cooling more effective
                    newRoomTemp -= coolingPower;
                    newRoomHumid += 1;
                    energyUsed = 2;
                    nextAction = 'Cooling';
                } else if (tempDiff < -0.5) { // Room is too cold, need to heat
                    // Heating action
                    const heatingPower = 0.5 * (1 + learningRate * 5); // Learning makes heating more effective
                    newRoomTemp += heatingPower;
                    newRoomHumid -= 1;
                    energyUsed = 2;
                    nextAction = 'Heating';
                } else {
                    // Idle state
                    nextAction = 'Idle';
                    energyUsed = 0;
                }

                // 3. Environmental Dynamics (Physics of the "Room")
                // Temperature naturally drifts towards the external temperature.
                const tempDrift = (extTemp - newRoomTemp) * 0.1;
                newRoomTemp += tempDrift;

                // Humidity naturally drifts towards a base value.
                const humidDrift = (50 - newRoomHumid) * 0.1;
                newRoomHumid += humidDrift;

                // 4. Calculate Reward (The AI's Score)
                // This is how the AI learns. It gets a score for its actions.
                // Reward for being close to the target temperature.
                const comfortReward = 10 - Math.abs(newRoomTemp - targetTemp) * 5;
                // Penalty for using energy.
                const energyPenalty = energyUsed * 1;
                const reward = comfortReward - energyPenalty;

                // 5. Update State
                setRoomTemp(newRoomTemp);
                setRoomHumid(newRoomHumid);
                setEnergyConsumption(prevEnergy => prevEnergy + energyUsed);
                setCumulativeReward(prevReward => prevReward + reward);
                setAction(nextAction);

                // 6. AI "Learning" Progress
                // Simulating learning by gradually increasing the learning rate.
                setLearningRate(prevRate => Math.min(0.5, prevRate + 0.001));

                // 7. Store data for visualization
                setHistory(prevHistory => [...prevHistory, {
                    time: simTime,
                    roomTemp: newRoomTemp,
                    extTemp: extTemp,
                    roomHumid: newRoomHumid,
                    reward: reward,
                    cumulativeReward: prevHistory.length > 0 ? prevHistory[prevHistory.length - 1].cumulativeReward + reward : reward
                }]);
            }, 1000); // 1000ms = 1 second per simulation step
        } else if (!isSimulating && simTime !== 0) {
            clearInterval(interval);
        }
        return () => clearInterval(interval);
    }, [isSimulating, roomTemp, roomHumid, extTemp, simTime, learningRate, cumulativeReward]); // Dependencies for the effect

    // === UI HANDLERS ===
    const handleStartStop = () => setIsSimulating(!isSimulating);
    const handleReset = () => {
        setIsSimulating(false);
        setSimTime(0);
        setRoomTemp(22);
        setRoomHumid(50);
        setLearningRate(0.01);
        setCumulativeReward(0);
        setEnergyConsumption(0);
        setAction('Idle');
        setHistory([]);
    };

    // === MAIN UI RENDER ===
    return (
        <div className="min-h-screen bg-gray-950 text-white font-sans p-4 sm:p-8 flex flex-col items-center">
            {/* Header */}
            <header className="text-center mb-10 w-full max-w-4xl">
                <h1 className="text-4xl font-bold mb-2">Smart HVAC with Reinforcement Learning</h1>
                <p className="text-gray-400 text-lg">
                    A simulation of an AI agent learning to optimize energy usage while maintaining room comfort.
                </p>
            </header>

            {/* Main Content Grid */}
            <main className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-3 gap-6">

                {/* Simulation Controls & Metrics */}
                <div className="lg:col-span-1 bg-gray-800 p-6 rounded-xl shadow-lg flex flex-col justify-between">
                    <div>
                        <h2 className="text-2xl font-bold mb-4">Simulation Status</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Simulation Time:</span>
                                <span className="text-xl font-mono">{simTime}s</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Room Temperature:</span>
                                <span className={`text-2xl font-bold ${Math.abs(roomTemp - targetTemp) > 1 ? 'text-red-400' : 'text-green-400'}`}>
                                    {roomTemp.toFixed(2)} °C
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Room Humidity:</span>
                                <span className="text-2xl font-bold">{roomHumid.toFixed(2)} %</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">External Temp:</span>
                                <span className="text-2xl font-bold">{extTemp.toFixed(1)} °C</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">HVAC Action:</span>
                                <span className={`text-xl font-bold ${action === 'Idle' ? 'text-yellow-400' : 'text-blue-400'}`}>{action}</span>
                            </div>
                        </div>
                    </div>
                    
                    <div className="mt-8 pt-4 border-t border-gray-700">
                        <h2 className="text-2xl font-bold mb-4">AI Performance</h2>
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Cumulative Reward:</span>
                                <span className="text-xl font-bold text-teal-400">{cumulativeReward.toFixed(2)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Energy Consumed:</span>
                                <span className="text-xl font-bold text-rose-400">{energyConsumption} Units</span>
                            </div>
                            <div className="flex items-center justify-between">
                                <span className="text-gray-300">Learning Progress:</span>
                                <span className="text-xl font-bold text-purple-400">{(learningRate * 100).toFixed(1)}%</span>
                            </div>
                        </div>
                    </div>

                    {/* Control Buttons */}
                    <div className="mt-8 flex justify-center space-x-4">
                        <button
                            onClick={handleStartStop}
                            className={`px-6 py-3 rounded-full text-lg font-bold transition-all duration-300 ${
                                isSimulating
                                    ? 'bg-red-600 hover:bg-red-700 text-white'
                                    : 'bg-green-600 hover:bg-green-700 text-white'
                            }`}
                        >
                            {isSimulating ? 'Stop' : 'Start'} Simulation
                        </button>
                        <button
                            onClick={handleReset}
                            className="px-6 py-3 rounded-full text-lg font-bold bg-gray-600 hover:bg-gray-700 text-white transition-all duration-300"
                        >
                            Reset
                        </button>
                    </div>
                </div>

                {/* Charts */}
                <div className="lg:col-span-2 space-y-6">
                    <LineChart
                        data={history}
                        xKey="time"
                        yKeys={['roomTemp', 'extTemp']}
                        title="Temperature and Humidity Over Time"
                        colors={['#4ade80', '#f87171']}
                    />
                    <LineChart
                        data={history}
                        xKey="time"
                        yKeys={['cumulativeReward']}
                        title="AI Cumulative Reward (Learning Curve)"
                        colors={['#c084fc']}
                    />
                </div>
            </main>

            {/* Footer */}
            <footer className="mt-10 text-center text-gray-500 text-sm">
                <p>Designed and simulated for a project portfolio. AI logic is a simplified model of a real reinforcement learning agent.</p>
            </footer>
        </div>
    );
};

export default App;
