import React, { useEffect, useState } from "react";
import Navbar from "./shared/Navbar";
import Job from "./Job";
import { useSelector } from "react-redux";
import { motion } from "framer-motion";
import img1 from '../assets/Home.png';

const Jobs = () => {
    const { allJobs } = useSelector((store) => store.job);
    const [filterJobs, setFilterJobs] = useState(allJobs);
    const [searchQuery, setSearchQuery] = useState("");
    const [filters, setFilters] = useState({
        jobType: "",
        salary: { min: null, max: null },  // Ensure salary is an object
        location: "",
        experience: "",
    });

    const [openDropdown, setOpenDropdown] = useState(null);

    useEffect(() => {
        let filteredJobs = allJobs;
    
        // Apply search query filter
        if (searchQuery) {
            filteredJobs = filteredJobs.filter(
                (job) =>
                    (typeof job.title === "string" && job.title.toLowerCase().includes(searchQuery.toLowerCase())) ||
                    (typeof job.description === "string" && job.description.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Apply dropdown filters
        Object.keys(filters).forEach((key) => {
            if (filters[key]) {
                if (key === "salary" && filters.salary.min !== null) {
                    // Salary filter
                    filteredJobs = filteredJobs.filter((job) => {
                        const jobSalary = parseInt(job.salary);
                        return (
                            (!filters.salary.min || jobSalary >= filters.salary.min) &&
                            (!filters.salary.max || jobSalary <= filters.salary.max)
                        );
                    });
                } else if (typeof filters[key] === "string" && filters[key] !== "") {
                    // Other filters (Ensure job[key] exists and is a string)
                    filteredJobs = filteredJobs.filter((job) => 
                        typeof job[key] === "string" && job[key].toLowerCase().includes(filters[key].toLowerCase())
                    );
                }
            }
        });
    
        setFilterJobs(filteredJobs);
    }, [allJobs, searchQuery, filters]);

    // Extract unique locations dynamically
    const uniqueLocations = [...new Set(allJobs.map((job) => job.location))];

    const handleFilterChange = (key, value) => {
        setFilters((prev) => ({
            ...prev,
            [key]: key === "salary" ? value : value,  // Ensure salary stays as object
        }));
    };

    const toggleDropdown = (key) => {
        setOpenDropdown(openDropdown === key ? null : key);
    };

    return (
       <div className="relative min-h-screen">
            {/* Background Image */}
            <div 
                className="absolute inset-0 bg-cover bg-center"
                style={{ backgroundImage: `url(${img1})` }}
            >
                <div className="absolute inset-0 bg-black/0"></div> {/* Dark Overlay */}
            </div>

            <Navbar />
            <div className="max-w-7xl mx-auto mt-5">

                {/* Search Bar */}
                <div className="mb-4">
                    <input
                        type="text"
                        placeholder="Search by title or description..."
                        className="w-full p-3 rounded-lg shadow-lg bg-white/10 backdrop-blur-lg text-black placeholder-gray-200 border border-white/30 focus:outline-none focus:ring-2 focus:ring-white/40"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Section */}
                <div className="flex gap-4 bg-white/10 backdrop-blur-lg p-4 rounded-lg shadow-lg border border-white/30 z-50 relative">
                    {[
                        { key: "jobType", label: "Job Type ▼", options: ["All", "Remote", "Onsite", "Hybrid"] },
                        { key: "location", label: "Location ▼", options: ["All", ...uniqueLocations] },
                        { key: "experience", label: "Experience ▼", options: ["All", "0-1 years", "1-3 years", "3-5 years", "5+ years"] },
                    ].map(({ key, label, options }) => (
                        <div key={key} className="relative z-50">
                            <button
                                className="bg-white/10 text-white border border-white/30 p-2 rounded-lg shadow-md cursor-pointer hover:bg-white/20"
                                onClick={() => toggleDropdown(key)}
                            >
                                {label}
                            </button>
                            {openDropdown === key && (
                                <motion.div
                                    initial={{ opacity: 0, y: -10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    exit={{ opacity: 0, y: -10 }}
                                    transition={{ duration: 0.2 }}
                                    className="absolute mt-2 bg-white backdrop-blur-lg border border-white/30 rounded-lg shadow-lg p-2 w-44"
                                >
                                    {options.map((option) => (
                                        <div
                                            key={option}
                                            className="cursor-pointer p-2 text-black rounded-lg"
                                            onClick={() => handleFilterChange(key, option === "All" ? "" : option)}
                                        >
                                            {option}
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </div>
                    ))}

                    {/* Salary Filter */}
                    <div className="relative z-50">
                        <button
                            className="bg-white/10 text-white border border-white/30 p-2 rounded-lg shadow-md cursor-pointer hover:bg-white/20"
                            onClick={() => toggleDropdown("salary")}
                        >
                            Salary ▼
                        </button>
                        {openDropdown === "salary" && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                transition={{ duration: 0.2 }}
                                className="absolute mt-2 bg-white backdrop-blur-lg border border-white/30 rounded-lg shadow-lg p-2 w-44"
                            >
                                {[
                                    { label: "All", min: null, max: null },
                                    { label: "10-20 LPA", min: 10, max: 20 },
                                    { label: "20-50 LPA", min: 20, max: 50 },
                                    { label: "50-100 LPA", min: 50, max: 100 },
                                    { label: "100+ LPA", min: 100, max: null },
                                ].map((range) => (
                                    <div
                                        key={range.label}
                                        className="cursor-pointer p-2 text-black rounded-lg"
                                        onClick={() => handleFilterChange("salary", range.min !== null ? range : { min: null, max: null })}
                                    >
                                        {range.label}
                                    </div>
                                ))}
                            </motion.div>
                        )}
                    </div>
                </div>

                {/* Job List */}
                {filterJobs.length <= 0 ? (
                    <span className="block mt-5 text-center text-white text-lg">No jobs found</span>
                ) : (
                    <div className="h-[80vh] overflow-y-auto pb-5">
                        <div className="grid grid-cols-3 gap-4 mt-5">
                            {filterJobs.map((job) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 100 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: -100 }}
                                    transition={{ duration: 0.3 }}
                                    key={job?._id}
                                >
                                    <Job job={job} />
                                </motion.div>
                            ))}
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default Jobs;
