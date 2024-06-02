import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";

const UnAuthGuard = ({ component }) => {
  const [status, setStatus] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    checkToken();
  }, [component]);

  const checkToken = async () => {
    try {
      const token = await localStorage.getItem("token");
      if (token) {
        // decode token
        const decodedToken = atob(token);
        const [username, password] = decodedToken.split(":");
        const response = await fetch(
          `http://localhost:3000/users?email=${username}&password=${password}`
        );
        const users = await response.json();
        const user = users.length > 0 ? users[0] : null;
        if (user) {
          navigate(`/home`);
        } else {
          localStorage.removeItem("token");
        }
      }

      setStatus(true);
    } catch (error) {
      navigate(`/`);
    }
  };

  return status ? (
    <React.Fragment>{component}</React.Fragment>
  ) : (
    <React.Fragment></React.Fragment>
  );
};

export default UnAuthGuard;
