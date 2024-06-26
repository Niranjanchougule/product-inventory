import React, { useState } from "react";
import {
  Box,
  Button,
  FormControl,
  FormLabel,
  Input,
  VStack,
  Heading,
  useToast,
} from "@chakra-ui/react";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router";

const fetchUser = async ({ queryKey }) => {
  const [_, username, password] = queryKey;
  const response = await fetch(
    `http://localhost:3000/users?email=${username}&password=${password}`
  );
  if (!response.ok) {
    throw new Error("Network response was not ok");
  }
  return response.json();
};

const Login = () => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const toast = useToast();
  const navigate = useNavigate();
  const { data: users, refetch } = useQuery({
    queryKey: ["user", username, password],
    queryFn: fetchUser,
    enabled: false, // Disable automatic query
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const result = await refetch();
      if (result.data.length > 0) {
        const token = btoa(`${username}:${password}`);
        localStorage.setItem("token", token);
        toast({
          title: "Logged in",
          description: "You've successfully logged in.",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        navigate(`/home`);
      } else {
        toast({
          title: "Login failed",
          description: "Invalid username or password.",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    } catch (error) {
      console.error("Error logging in:", error);
      toast({
        title: "An error occurred",
        description: "Unable to log in. Please try again later.",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  return (
    <Box
      w="100%"
      maxW="md"
      mx="auto"
      mt={8}
      p={8}
      borderWidth={1}
      borderRadius={8}
      boxShadow="lg"
    >
      <Heading as="h2" mb={6} textAlign="center">
        Login
      </Heading>
      <form onSubmit={handleSubmit}>
        <VStack spacing={4}>
          <FormControl id="username" isRequired>
            <FormLabel>Username</FormLabel>
            <Input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
            />
          </FormControl>
          <FormControl id="password" isRequired>
            <FormLabel>Password</FormLabel>
            <Input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </FormControl>
          <Button type="submit" colorScheme="teal" width="full">
            Login
          </Button>
        </VStack>
      </form>
    </Box>
  );
};

export default Login;
