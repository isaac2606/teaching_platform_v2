import { useContext, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import Button from "../components/ui/Button";
import Input from "../components/ui/Input";
import api from "../services/api";
import { AuthContext } from "../context/AuthContext";

export default function Register() {

  const {login , user} = useContext(AuthContext)
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    role:"student"
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  
  const navigate = useNavigate();

  const handleChange = (e) => {
    const {name,value}=e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Using our configured Axios interceptor api.js
      const response  = await api.post("/auth/Register", formData);
      const data = response.data;
      // If successful, redirect to login

      if (data.accessToken){

        login(data.user, data.accessToken, data.refreshToken);
          
        navigate(data.user.role === "teacher" ? "/dashboard/teacher" : "/dashboard/student");
        
      }
    } catch (err) {
      if (!err.response) {
        setError("Network error. Please ensure the backend server is running.");
      } else {
        setError(err.response?.data?.message || "Registration failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-bg-base px-4">
      <div className="max-w-md w-full bg-bg-surface p-8 rounded-2xl shadow-2xl border border-white/5">
        
        <div className="text-center mb-8">
          <h2 className="text-3xl font-bold text-white mb-2">Create an Account</h2>
          <p className="text-text-secondary">Join the Private Educator Platform</p>
        </div>

        {error && (
          <div className="mb-4 p-3 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg text-sm text-center">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input 
            label="Username"
            name="username"
            value={formData.username}
            onChange={handleChange}
            placeholder="johndoe"
            required
          />
          
          <Input 
            label="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="john@example.com"
            required
          />

          <Input 
            label="Password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            required
          />
          <div className="p-4 border-b border-white/10">
              <div className="flex bg-black/20 rounded-lg p-1 border border-white/5">
                <button 
                  type="button"
                  onClick={() => {
                    setFormData({
                        ...formData,
                        role:"teacher"
                  })
                }}
                      
                  className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                    formData.role === "teacher" ? "bg-brand-primary text-white shadow-md" : "text-text-secondary hover:text-white"
                  }`}
                >
                  Teacher
                </button>
                <button 
                  type="button"
                  onClick={() => {
                    setFormData({
                        ...formData,
                        role:"student"
                  })
                }}
                  className={`flex-1 py-1.5 rounded-md text-sm font-semibold transition-all duration-200 ${
                    formData.role === "student" ? "bg-brand-primary text-white shadow-md" : "text-text-secondary hover:text-white"
                  }`}
                >
                  Student
                </button>
              </div>
            </div>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-full mt-6"
            disabled={loading}
          >
            {loading ? "Creating account..." : "Sign Up"}
          </Button>
        </form>

        <p className="mt-6 text-center text-text-secondary text-sm">
          Already have an account?{" "}
          <Link to="/auth/login" className="text-brand-primary hover:text-brand-hover font-medium transition-colors">
            Log in here
          </Link>
        </p>

      </div>
    </div>
  );
}
