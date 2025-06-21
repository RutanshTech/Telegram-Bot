const Plan = require('../models/plan');

const createPlan = async (data) => {
  const plan = new Plan(data);
  return await plan.save();
};

const getAllPlans = async () => {
  return await Plan.find();
};

const getPlanById = async (id) => {
  return await Plan.findById(id);
};

const updatePlan = async (id, data) => {
  return await Plan.findByIdAndUpdate(id, data, { new: true });
};

const deletePlan = async (id) => {
  return await Plan.findByIdAndDelete(id);
};

module.exports = {
  createPlan,
  getAllPlans,
  getPlanById,
  updatePlan,
  deletePlan
};
