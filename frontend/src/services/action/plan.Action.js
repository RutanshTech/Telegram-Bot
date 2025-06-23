import axios from "axios";
import { toast } from "react-toastify";

export const addNewplans = (data) => {
  return {
    type: "ADD_NEW_PLANS",
    payload: data
  };
}
export const getplans=(data)=>{
  return {
    type: "GET_PLANS",
    payload: data,
  };
}
export const addplanasync = (data) => {
  console.log("data",data);
  
  return (dispatch) => {
    axios
      .post("https://telegram-bot-1-f9v5.onrender.com/api/plans/add", data)
      .then((res) => {
        dispatch(addNewplans(res.data));
        toast.success("Plan added successfully!");
      })
      .catch((err) => {
        console.log(err);
        toast.error(`Error: ${err.message}`);
      });
  };
};

export const getplansasync = () => {
  return (dispatch) => {
    axios.get("https://telegram-bot-1-f9v5.onrender.com/api/plans/get")
    .then((res) => {
      dispatch(getplans(res.data));
    })
    .catch((err) => {
      console.log(err.message);
      toast.error(`Error: ${err.message}`);
    });
  };
};

export const deleteplanasync = (id) => {
  return (dispatch) => {
    axios.delete(`https://telegram-bot-1-f9v5.onrender.com/api/plans/delete/${id}`)
    .then((res)=>{
      dispatch(getplansasync());
      toast.success("Plan deleted successfully!");
    })
    .catch((err)=>{
      console.log(err);
      toast.error(`Error: ${err.message}`);
    });
  };
};

export const updateplanasync = (id, data) => {
  return (dispatch) => {
    axios.put(`https://telegram-bot-1-f9v5.onrender.com/api/plans/edit/${id}`, data)
    .then((res)=>{
      dispatch(getplansasync());
      toast.success("Plan updated successfully!");
    })
    .catch((err)=>{
      console.log(err);
      toast.error(`Error: ${err.message}`);
    });
  };
}