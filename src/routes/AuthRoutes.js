import React from "react";
import { Route } from "react-router-dom";
import AuthGuard from "../guards/AuthGuard";
import Home from "../Home";

const AuthRoutes = [
  <Route key="Home" path="Home" element={<AuthGuard component={<Home />} />} />,
];

export default AuthRoutes;
