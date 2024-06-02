import { Button } from "@chakra-ui/react";
import { useColorMode } from "@chakra-ui/react";
import "./Header.css";

function Header() {
  const { colorMode, toggleColorMode } = useColorMode();
  return (
    <div className="header-containar">
      <div></div>
      <h3>Product Inventory</h3>
      <div>
        <Button colorScheme="blue" size="sm" onClick={toggleColorMode}>
          Toggle {colorMode === "light" ? "Dark" : "Light"}
        </Button>
      </div>
    </div>
  );
}

export default Header;
