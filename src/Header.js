import { Button, Heading } from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/react";
import "./Header.css";

function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <div className="header-containar">
      <div></div>
      <Heading as={"h2"}>Product Inevntory</Heading>
      <div>
        <Button colorScheme="blue" size="sm" onClick={toggleColorMode}>
          Toggle {colorMode === "light" ? "Dark" : "Light"}
        </Button>
      </div>
    </div>
  );
}

export default Header;
