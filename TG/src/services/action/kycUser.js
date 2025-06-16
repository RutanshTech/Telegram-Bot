import axios from "axios";
import { toast } from "react-toastify";

export const createUser = (formData) => async (dispatch) => {
  try {
    // Get user ID from localStorage
    const userData = localStorage.getItem("user");
    let userId;
    
    try {
      const user = JSON.parse(userData);
      userId = user?._id || user?.id;
    } catch (error) {
      console.error("Error parsing user data:", error);
    }
    
    if (!userId) {
      toast.error("Please login first!");
      return false;
    }

    // Add userId to formData
    const dataToSend = {
      ...formData,
      userid: userId
    };

    console.log("Sending data to backend:", dataToSend); // Debug log
    
    const response = await axios.post("http://localhost:4000/api/kyc/add", dataToSend, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });
    
    console.log("Backend response:", response.data); // Debug log
    
    if (response.data) {
      dispatch({
        type: "CREATE_USER",
        payload: response.data
      });
      
      // Set KYC completion status in localStorage
      localStorage.setItem("kycCompleted", "true");
      
      toast.success("KYC submitted successfully!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
      return true;
    }
  } catch (error) {
    console.error("Backend error:", error.response || error); // Debug log
    
    if (error.response?.data?.message === "User already verified") {
      toast.error("You are already verified!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    } else {
      toast.error(error.response?.data?.message || "Something went wrong!", {
        position: "top-right",
        autoClose: 3000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
      });
    }
    return false;
  }
};
