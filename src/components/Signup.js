import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = (props) => {
  const host = "http://localhost:5000/api";
  const [credential, setCredential] = useState({
    name: "",
    email: "",
    password: "",
    cpassword: "",
  });
  let history = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { name, email, password } = credential;
    const response = await fetch(`${host}/auth/createuser`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ name, email, password }),
    });
    const json = await response.json();
    console.log(json);
    if (json.success) {
      // Save the authToken and redirect
      localStorage.setItem("token", json.authtoken);
      history("/");
      props.showAlert("Account created Succesfully", "success");

    } else {
      props.showAlert("Invalid Credential","danger")
    }
  };
  const onChange = (e) => {
    setCredential({ ...credential, [e.target.name]: e.target.value });
  };
  return (
    <div className="mt-3 container">
      <h2 className="my-3">Create an account to use iNoteBook</h2>
      <form onSubmit={handleSubmit}>
        <div className="mb-3">
          <label htmlFor="name" className="form-label">
            Name
          </label>
          <input
            type="text"
            className="form-control"
            id="name"
            aria-describedby="emailHelp"
            onChange={onChange}
            name="name"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="email" className="form-label">
            Email address
          </label>
          <input
            type="email"
            className="form-control"
            id="email"
            aria-describedby="emailHelp"
            onChange={onChange}
            name="email"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="password" className="form-label">
            Password
          </label>
          <input
            type="password"
            className="form-control"
            id="password"
            onChange={onChange}
            required
            minLength={5}
            name="password"
          />
        </div>
        <div className="mb-3">
          <label htmlFor="cpassword" className="form-label">
            Confirm Password
          </label>
          <input
            type="password"
            className="form-control"
            id="cpassword"
            onChange={onChange}
            required
            minLength={5}
            name="cpassword"
          />
        </div>
        <button type="submit" className="btn btn-primary">
          Submit
        </button>
      </form>
    </div>
  );
};

export default Signup;
