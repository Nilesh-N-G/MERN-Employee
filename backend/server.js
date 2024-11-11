const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
const multer = require("multer");
const bodyParser = require('body-parser');
const userRoutes = require('./routes/userRoutes');  // Import the user routes file
const app = express();
const port = 5000;

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/employeeDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
  serverSelectionTimeoutMS: 30000,
  socketTimeoutMS: 30000,
})
  .then(() => console.log("MongoDB connected successfully"))
  .catch((err) => console.error("MongoDB connection error:", err));

// Middleware
app.use(cors({ origin: "*" }));
app.use(express.json());
app.use(bodyParser.json());

// Multer configuration for handling image uploads
const storage = multer.memoryStorage(); // Store files in memory
const upload = multer({ storage });

// Import Employee model
const Employee = require('./models/Employee'); // Adjust the path as needed

// Routes
app.use('/api', userRoutes);  // Mount user routes

// Add a new employee with image upload
app.post("/api/employee", upload.single("img"), async (req, res) => {
  try {
    const { name, email, mobile, designation, gender, course } = req.body;

    if (!name || !email || !mobile || !designation || !gender || !course || !req.file) {
      return res.status(400).json({ error: "All fields are required, including an image" });
    }

    // Check for duplicate email
    const existingEmployee = await Employee.findOne({ f_Email: email });
    if (existingEmployee) {
      return res.status(409).json({ error: "Email already exists" });
    }

    // Store image as Base64 string
    const imageBase64 = req.file.buffer.toString("base64");

    const newEmployee = new Employee({
      f_Id: new mongoose.Types.ObjectId(),
      f_Image: imageBase64,
      f_Name: name,
      f_Email: email,
      f_Mobile: mobile,
      f_Designation: designation,
      f_Gender: gender,
      f_Course: Array.isArray(course) ? course : course.split(","),
      f_Createdate: new Date(),
    });

    await newEmployee.save();
    res.status(201).json({ message: "Employee added successfully", employee: newEmployee });
  } catch (err) {
    console.error("Error saving employee data:", err);
    res.status(500).json({ error: "Error saving employee data" });
  }
});


// Get all employees
app.get("/api/employees", async (req, res) => {
  try {
    const employees = await Employee.find();
    res.status(200).json(employees);
  } catch (err) {
    console.error("Error retrieving employees:", err);
    res.status(500).json({ error: "Error retrieving employees" });
  }
});

// Get employee details by ID
app.get("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json(employee);
  } catch (error) {
    console.error("Error fetching employee:", error);
    res.status(500).json({ error: "Server error" });
  }
});

// Get individual employee image by ID
app.get("/api/employee/image/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findById(id);

    if (!employee) return res.status(404).json({ error: "Employee not found" });

    const imageBuffer = Buffer.from(employee.f_Image, "base64");
    res.contentType("image/jpeg").send(imageBuffer);
  } catch (err) {
    console.error("Error retrieving image:", err);
    res.status(500).json({ error: "Error retrieving image" });
  }
});

// Update employee details by ID (Including image if provided)
app.put("/api/employees/:id", upload.single("img"), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, mobile, designation, gender, course } = req.body;

    const employee = await Employee.findById(id);
    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    // Check if the email is being updated and if it already exists for another employee
    if (email && email !== employee.f_Email) {
      const existingEmployee = await Employee.findOne({ f_Email: email });
      if (existingEmployee && existingEmployee._id.toString() !== id) {
        return res.status(409).json({ error: "Email already exists" });
      }
    }

    // Update fields only if new values are provided
    employee.f_Name = name || employee.f_Name;
    employee.f_Email = email || employee.f_Email;
    employee.f_Mobile = mobile || employee.f_Mobile;
    employee.f_Designation = designation || employee.f_Designation;
    employee.f_Gender = gender || employee.f_Gender;
    employee.f_Course = Array.isArray(course) ? course : course?.split(",") || employee.f_Course;

    if (req.file) {
      const imageBase64 = req.file.buffer.toString("base64");
      employee.f_Image = imageBase64;
    }

    await employee.save();

    res.status(200).json({ message: "Employee updated successfully", employee });
  } catch (err) {
    console.error("Error updating employee data:", err);
    res.status(500).json({ error: "Error updating employee data" });
  }
});

// Delete employee by ID
app.delete("/api/employees/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const employee = await Employee.findByIdAndDelete(id);

    if (!employee) {
      return res.status(404).json({ error: "Employee not found" });
    }

    res.status(200).json({ message: "Employee deleted successfully" });
  } catch (err) {
    console.error("Error deleting employee:", err);
    res.status(500).json({ error: "Error deleting employee" });
  }
});



// Start server
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});



