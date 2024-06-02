import { EditIcon, ViewIcon } from "@chakra-ui/icons";
import {
  Box,
  Button,
  Divider,
  Flex,
  FormControl,
  FormLabel,
  Heading,
  IconButton,
  Input,
  Modal,
  ModalBody,
  ModalCloseButton,
  ModalContent,
  ModalFooter,
  ModalHeader,
  ModalOverlay,
  Select,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
  Tabs,
  Tag,
  Tbody,
  Td,
  Text,
  Th,
  Thead,
  Tr,
  useDisclosure,
  useToast,
} from "@chakra-ui/react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { MultiSelect } from "chakra-multiselect";

// Fetch products from the API
const fetchProducts = async () => {
  const { data } = await axios.get("http://localhost:3000/products");
  return data;
};

const SaleOrderForm = ({ isOpen, onClose, saleOrderId }) => {
  const initialRef = React.useRef();
  const queryClient = useQueryClient();
  const toast = useToast();

  const [selectedProducts, setSelectedProducts] = useState([]);
  const { data: products, isLoading } = useQuery({
    queryKey: "products",
    queryFn: fetchProducts,
  });

  const {
    control,
    handleSubmit,
    reset,
    watch,
    formState: { errors },
    setError,
    clearErrors,
  } = useForm({
    defaultValues: {
      customer_id: "",
      invoice_no: "",
      invoice_date: "",
      items: [],
    },
  });

  const { fields, remove } = useFieldArray({
    control,
    name: "items",
  });

  const onSubmit = (data) => {
    const hasErrors = validateForm(data);
    if (hasErrors) return;

    console.log(data);
    // Handle form submission

    toast({
      title: "Sale Order Created.",
      description: "Your sale order has been created successfully.",
      status: "success",
      duration: 5000,
      isClosable: true,
    });
    onClose();
  };

  useEffect(() => {
    if (saleOrderId) {
      // Fetch the existing sale order details and set the form values
      // reset(formDataFromAPI);
    }
  }, [saleOrderId, reset]);

  const validateForm = (data) => {
    let hasErrors = false;

    if (!data.customer_id) {
      setError("customer_id", {
        type: "manual",
        message: "Customer ID is required",
      });
      hasErrors = true;
    } else {
      clearErrors("customer_id");
    }

    if (!data.invoice_no) {
      setError("invoice_no", {
        type: "manual",
        message: "Invoice number is required",
      });
      hasErrors = true;
    } else {
      clearErrors("invoice_no");
    }

    if (!data.invoice_date) {
      setError("invoice_date", {
        type: "manual",
        message: "Invoice date is required",
      });
      hasErrors = true;
    } else {
      clearErrors("invoice_date");
    }

    data.items.forEach((item, index) => {
      if (!item.price || item.price <= 0) {
        setError(`items[${index}].price`, {
          type: "manual",
          message: "Price must be a positive number",
        });
        hasErrors = true;
      } else {
        clearErrors(`items[${index}].price`);
      }

      if (!item.quantity || item.quantity <= 0) {
        setError(`items[${index}].quantity`, {
          type: "manual",
          message: "Quantity must be a positive number",
        });
        hasErrors = true;
      } else if (item.quantity > item.quantity_in_inventory) {
        setError(`items[${index}].quantity`, {
          type: "manual",
          message: "Quantity exceeds inventory",
        });
        hasErrors = true;
      } else {
        clearErrors(`items[${index}].quantity`);
      }
    });

    return hasErrors;
  };

  const handleProductSelect = (selectedProducts) => {
    setSelectedProducts(selectedProducts);
    const skus = selectedProducts.flatMap((product) =>
      product.sku.map((sku) => ({
        sku_id: sku.id,
        price: sku.selling_price,
        quantity: 0, // default value
        quantity_in_inventory: sku.quantity_in_inventory,
        amount: `${sku.amount} ${sku.unit}`,
        unit: sku.unit,
        max_retail_price: sku.max_retail_price,
      }))
    );
    reset({ ...watch(), items: skus });
  };

  if (isLoading) return <p>Loading...</p>;

  const options = products?.map((product) => ({
    label: product.name,
    value: product.name,
    sku: product.sku,
  }));
  return (
    <Modal
      initialFocusRef={initialRef}
      isOpen={isOpen}
      onClose={onClose}
      size="xl"
    >
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Create Sale Order</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <form onSubmit={handleSubmit(onSubmit)}>
            <FormControl isInvalid={errors.customer_id}>
              <FormLabel>Customer ID</FormLabel>
              <Controller
                name="customer_id"
                control={control}
                render={({ field }) => (
                  <Input
                    {...field}
                    placeholder="Customer ID"
                    ref={initialRef}
                  />
                )}
              />
              {errors.customer_id && <p>{errors.customer_id.message}</p>}
            </FormControl>

            <FormControl mt={4} isInvalid={errors.invoice_no}>
              <FormLabel>Invoice Number</FormLabel>
              <Controller
                name="invoice_no"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Invoice Number" />
                )}
              />
              {errors.invoice_no && <p>{errors.invoice_no.message}</p>}
            </FormControl>

            <FormControl mt={4} isInvalid={errors.invoice_date}>
              <FormLabel>Invoice Date</FormLabel>
              <Controller
                name="invoice_date"
                control={control}
                render={({ field }) => (
                  <Input {...field} placeholder="Invoice Date" type="date" />
                )}
              />
              {errors.invoice_date && <p>{errors.invoice_date.message}</p>}
            </FormControl>

            <FormControl mt={4}>
              <FormLabel>All Products</FormLabel>
              <MultiSelect
                value={selectedProducts}
                options={options}
                placeholder="Select products"
                onChange={handleProductSelect}
              />
            </FormControl>

            {fields.map((field, index) => (
              <Box
                key={field.id}
                mt={4}
                borderWidth="1px"
                borderRadius="lg"
                p={4}
              >
                <Flex justifyContent={"space-between"} marginBottom={1}>
                  <Text>
                    {index}. SKU {field.sku_id} ({field.quantity_in_inventory}{" "}
                    {field.unit})
                  </Text>
                  <Tag>Rate: ₹{field.max_retail_price}</Tag>
                </Flex>
                <Divider />
                <Flex gap={10}>
                  <FormControl mt={2} isInvalid={errors?.items?.[index]?.price}>
                    <FormLabel>Selling Rate</FormLabel>
                    <Controller
                      name={`items[${index}].price`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter selling rate"
                          type="number"
                        />
                      )}
                    />
                    {errors?.items?.[index]?.price && (
                      <p>{errors.items[index].price.message}</p>
                    )}
                  </FormControl>

                  <FormControl
                    mt={2}
                    isInvalid={errors?.items?.[index]?.quantity}
                  >
                    <FormLabel>Total Items</FormLabel>
                    <Controller
                      name={`items[${index}].quantity`}
                      control={control}
                      render={({ field }) => (
                        <Input
                          {...field}
                          placeholder="Enter Quantity"
                          type="number"
                        />
                      )}
                    />
                    {errors?.items?.[index]?.quantity && (
                      <p>{errors.items[index].quantity.message}</p>
                    )}
                  </FormControl>
                </Flex>
                <Flex
                  justifyContent={"space-between"}
                  alignItems={"center"}
                  marginTop={1}
                >
                  <Button
                    size={"xs"}
                    mt={2}
                    margin={0}
                    colorScheme="red"
                    onClick={() => remove(index)}
                  >
                    Remove
                  </Button>
                  <Tag size="sm" colorScheme="green">
                    {field.quantity_in_inventory} Items Remaining
                  </Tag>
                </Flex>
              </Box>
            ))}

            <Button colorScheme="teal" mt={4} type="submit">
              Save
            </Button>
          </form>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Cancel</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

const Home = () => {
  const { isOpen, onOpen, onClose } = useDisclosure();

  return (
    <Box p={4}>
      <Heading as="h1" mb={6}>
        Sales Orders
      </Heading>
      <Tabs>
        <TabList>
          <Tab>Active Sale Orders</Tab>
          <Tab>Completed Sale Orders</Tab>
          <Button onClick={onOpen}>Create Sale Order</Button>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Customer Name</Th>
                  <Th>Price</Th>
                  <Th>Last Modified</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* Sample data for illustration */}
                <Tr>
                  <Td>1</Td>
                  <Td>John Doe</Td>
                  <Td>$100.00</Td>
                  <Td>2024-05-27</Td>
                  <Td>
                    <IconButton
                      aria-label="Edit"
                      icon={<EditIcon />}
                      size="sm"
                      mr={2}
                    />
                    <IconButton
                      aria-label="View"
                      icon={<ViewIcon />}
                      size="sm"
                    />
                  </Td>
                </Tr>
                {/* Add more rows as needed */}
              </Tbody>
            </Table>
          </TabPanel>
          <TabPanel>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Customer Name</Th>
                  <Th>Price</Th>
                  <Th>Last Modified</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {/* Sample data for illustration */}
                <Tr>
                  <Td>2</Td>
                  <Td>Jane Smith</Td>
                  <Td>$150.00</Td>
                  <Td>2024-05-26</Td>
                  <Td>
                    <IconButton
                      aria-label="Edit"
                      icon={<EditIcon />}
                      size="sm"
                      mr={2}
                    />
                    <IconButton
                      aria-label="View"
                      icon={<ViewIcon />}
                      size="sm"
                    />
                  </Td>
                </Tr>
                {/* Add more rows as needed */}
              </Tbody>
            </Table>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <SaleOrderForm isOpen={isOpen} onClose={onClose} />
    </Box>
  );
};

export default Home;
