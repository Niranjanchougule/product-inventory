import ReactDOM from "react-dom/client";
import React from "react";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import "./index.css";
import Layout from "./Layout";
import { ChakraBaseProvider } from "@chakra-ui/react";
import theme from "./theme";
import { ColorModeScript } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import AuthRoutes from "./routes/AuthRoutes";
import UnAuthRoutes from "./routes/UnAuthRoutes";

const queryClient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraBaseProvider theme={theme}>
        <BrowserRouter>
          <Routes>
            <Route path="/" element={<Layout />}>
              {AuthRoutes}
              {UnAuthRoutes}
            </Route>
          </Routes>
        </BrowserRouter>
      </ChakraBaseProvider>
    </QueryClientProvider>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(
  <>
    {/* 👇 Here's the script */}
    <ColorModeScript initialColorMode={theme.config.initialColorMode} />
    <App />
  </>
);
