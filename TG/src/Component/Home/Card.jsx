import React, { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate, useLocation } from "react-router-dom";
import { getplansasync } from "../../services/action/plan.Action";

const Card = () => {
  const { plans } = useSelector((state) => state.planReducer);
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    dispatch(getplansasync());
    
    // Scroll to top when component mounts
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  }, [dispatch, location]);

  const handlePress = (plan) => {
    const isLoggedIn = localStorage.getItem('isAuthenticated') === 'true';
    
    if (isLoggedIn) {
      // If logged in, go directly to payment
      navigate(`/payment/${plan._id || plan.id}`, {
        state: {
          productName: plan.type,
          productPrice: plan.mrp,
          planData: plan
        }
      });
    } else {
      // If not logged in, go to login with plan info
      navigate("/login", {
        state: {
          plan: plan
        }
      });
    }
  };

  return (
    <div id="plans-section" className="py-6 sm:py-16 px-2 sm:px-6 lg:pt-[150px]">
      <div className="text-center mb-6 sm:mb-14 hidden lg:block animate-fade-in-down">
        <h2 className="text-3xl sm:text-4xl font-extrabold text-gray-900 dark:text-white bg-clip-text text-transparent bg-gradient-to-r from-indigo-600 to-purple-600">
          Simple, Transparent Pricing
        </h2>
        <p className="mt-3 sm:mt-4 text-base sm:text-lg text-gray-600 dark:text-gray-400">
          No contracts. No hidden fees. Cancel anytime.
        </p>
      </div>

      <div className="max-w-6xl sm:max-w-7xl mx-auto grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-3 gap-2 sm:gap-4 lg:gap-6 px-2 sm:px-4">
        {plans.map((plan, index) => {
          const isHighlight = plan.highlight;

          return (
            <div
              key={plan._id || plan.id || index}
              className={`relative w-full rounded-lg sm:rounded-2xl border shadow-md sm:shadow-lg hover:shadow-xl p-3 sm:p-6 lg:p-8 flex flex-col justify-between transition-all duration-700 ease-out hover:-translate-y-3 hover:scale-[1.02] animate-fade-in-down ${
                isHighlight
                  ? "bg-gradient-to-br from-indigo-600 to-purple-600 text-white border-transparent hover:shadow-indigo-500/30"
                  : "bg-white dark:bg-gray-800 text-gray-900 dark:text-white border-gray-200 dark:border-gray-700 hover:shadow-gray-500/20"
              }`}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              {isHighlight && (
                <div className="absolute -top-2 left-0 right-0 flex justify-center animate-bounce-slow">
                  <span className="bg-gradient-to-r from-yellow-400 to-yellow-500 text-black text-[9px] sm:text-xs px-3 sm:px-4 py-0.5 sm:py-1 rounded-full font-semibold shadow-md sm:shadow-lg uppercase border border-yellow-300">
                    Most Popular
                  </span>
                </div>
              )}

              <div className="text-center space-y-2 sm:space-y-3">
                <h3 className="text-base sm:text-xl lg:text-2xl font-bold tracking-wide animate-fade-in-down">
                  {plan.type}
                </h3>
                <div className="text-2xl sm:text-4xl lg:text-5xl font-extrabold animate-fade-in-down">
                  ₹{plan.mrp}
                  <span className="text-[10px] sm:text-sm lg:text-base font-medium ml-1 opacity-80">
                    / {plan.duration}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handlePress(plan)}
                className={`mt-3 sm:mt-6 lg:mt-8 w-full py-2 sm:py-3 text-xs sm:text-sm font-semibold rounded-lg sm:rounded-xl transition-all duration-300 transform hover:scale-[1.05] hover:shadow-lg animate-bounce-slow ${
                  isHighlight
                    ? "bg-white text-indigo-700 hover:bg-gray-50 hover:shadow-md sm:hover:shadow-lg"
                    : "bg-indigo-600 text-white hover:bg-indigo-700 hover:shadow-md sm:hover:shadow-lg"
                }`}
              >
                {isHighlight ? "Get Started" : "Extract plans"}
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default Card;