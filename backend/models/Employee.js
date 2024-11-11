const mongoose = require("mongoose");
const employeeSchema = new mongoose.Schema({
    f_Id: { type: String, required: true },
    f_Image: { type: String, required: true },  // Make image field required
    f_Name: { type: String, required: true },
    f_Email: { type: String, required: true },
    f_Mobile: { type: String, required: true },
    f_Designation: { type: String, required: true },
    f_Gender: { type: String, required: true },
    f_Course: { type: [String], required: true },
    f_Createdate: { type: Date, default: Date.now },
  });
  
  const Employee = mongoose.model("Employee", employeeSchema);
  
  module.exports = Employee;
  