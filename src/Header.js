import React, { useState, useEffect } from "react";
import { Button, Heading } from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/react";
import { useNavigate } from "react-router-dom";
import "./Header.css";

function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    setIsLoggedIn(!!token);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    setIsLoggedIn(false);
    navigate("/");
  };

  return (
    <div className="header-container">
      <div></div>
      <Heading as="h2">Product Inventory</Heading>
      <div>
        <Button colorScheme="blue" size="sm" onClick={toggleColorMode} mr={2}>
          Toggle {colorMode === "light" ? "Dark" : "Light"}
        </Button>
        {isLoggedIn && (
          <Button colorScheme="red" size="sm" onClick={handleLogout}>
            Logout
          </Button>
        )}
      </div>
    </div>
  );
}

export default Header;
