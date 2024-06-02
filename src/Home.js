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
  Tabs,
  Tab,
  TabList,
  TabPanel,
  TabPanels,
  Table,
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
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";
import React, { useEffect, useState } from "react";
import { Controller, useFieldArray, useForm } from "react-hook-form";
import { MultiSelect } from "chakra-multiselect";

// Fetch products from the API
const fetchProducts = async () => {
  const { data } = await axios.get("http://localhost:3000/products");
  return data;
};

// Fetch sale orders from the API
const fetchSaleOrders = async () => {
  const { data } = await axios.get("http://localhost:3000/sale-orders");
  return data;
};

// Save sale order to the API
const saveSaleOrder = async (saleOrder) => {
  const { data } = await axios.post(
    "http://localhost:3000/sale-orders",
    saleOrder
  );
  return data;
};

// Fetch sale order by ID from the API
const fetchSaleOrderById = async (id) => {
  const { data } = await axios.get(`http://localhost:3000/sale-orders/${id}`);
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

  const mutation = useMutation({
    mutationFn: saveSaleOrder,
    onSuccess: () => {
      queryClient.invalidateQueries(["saleOrders"]);
      toast({
        title: "Sale Order Created.",
        description: "Your sale order has been created successfully.",
        status: "success",
        duration: 5000,
        isClosable: true,
      });
      reset();
      onClose();
    },
    onError: (error) => {
      toast({
        title: "An error occurred.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    },
  });

  const onSubmit = (data) => {
    const hasErrors = validateForm(data);
    if (hasErrors) return;
    const items = data.items.map((item) => ({
      sku_id: item.sku_id,
      price: item.price,
      quantity: parseInt(item.quantity),
      product_id: parseInt(item.product_id),
    }));
    const saleOrder = {
      customer_id: data.customer_id,
      invoice_no: data.invoice_no,
      invoice_date: data.invoice_date,
      items,
      paid: false,
    };
    saleOrder.adding_date = new Date().toISOString();
    saleOrder.updated_on = new Date().toISOString();
    mutation.mutate(saleOrder);
  };

  useEffect(() => {
    if (saleOrderId && products) {
      fetchSaleOrderById(saleOrderId).then((data) => {
        const productIds = [];
        const items = data.items.map((item) => {
          const product = products.find((p) => p.id === item.product_id);
          const sku = product?.sku.find((s) => s.id === item.sku_id);
          if (!productIds.includes(item.product_id)) {
            productIds.push(item.product_id);
          }
          return {
            ...item,
            quantity_in_inventory: sku?.quantity_in_inventory,
            amount: sku?.amount,
            unit: sku?.unit,
            max_retail_price: sku?.max_retail_price,
          };
        });
        let selectedProducts = products.filter((p) =>
          productIds.includes(p.id)
        );
        selectedProducts = selectedProducts.map((p) => ({
          label: p.name,
          value: p.name,
          sku: p.sku,
        }));

        setSelectedProducts(selectedProducts);

        reset({
          customer_id: data.customer_id,
          invoice_no: data.invoice_no,
          invoice_date: data.invoice_date,
          items,
        });
      });
    } else {
      reset({
        customer_id: "",
        invoice_no: "",
        invoice_date: "",
        items: [],
      });
    }
  }, [saleOrderId, products, reset]);

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
    console.log(selectedProducts);
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
        product_id: product.id,
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
        <ModalHeader>
          {saleOrderId ? "Edit Sale Order" : "Create Sale Order"}
        </ModalHeader>
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
  const { data: saleOrders, isLoading } = useQuery({
    queryKey: ["saleOrders"],
    queryFn: fetchSaleOrders,
  });
  const [editSaleOrderId, setEditSaleOrderId] = useState(null);

  if (isLoading) return <p>Loading...</p>;

  const handleEdit = (saleOrderId) => {
    setEditSaleOrderId(saleOrderId);
    onOpen();
  };

  const activeSaleOrders = saleOrders.filter((order) => !order.paid);
  const completedSaleOrders = saleOrders.filter((order) => order.paid);

  return (
    <Box p={4}>
      <Tabs>
        <TabList>
          <Tab>Active Sale Orders</Tab>
          <Tab>Completed Sale Orders</Tab>
          <Button
            style={{
              position: "absolute",
              right: "0px",
            }}
            onClick={() => {
              setEditSaleOrderId(null);
              onOpen();
            }}
          >
            Create Sale Order
          </Button>
        </TabList>

        <TabPanels>
          <TabPanel>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Customer Id</Th>
                  <Th>Invoice Date</Th>
                  <Th>Last Modified</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {activeSaleOrders.map((order) => (
                  <Tr key={order.id}>
                    <Td>{order.id}</Td>
                    <Td>{order.customer_id}</Td>
                    <Td>{order.invoice_date}</Td>
                    <Td>{order.updated_on}</Td>
                    <Td>
                      <IconButton
                        aria-label="Edit"
                        icon={<EditIcon />}
                        size="sm"
                        mr={2}
                        onClick={() => handleEdit(order.id)}
                      />
                      <IconButton
                        aria-label="View"
                        icon={<ViewIcon />}
                        size="sm"
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
          <TabPanel>
            <Table variant="simple">
              <Thead>
                <Tr>
                  <Th>ID</Th>
                  <Th>Customer Id</Th>
                  <Th>Invoice Date</Th>
                  <Th>Last Modified</Th>
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {completedSaleOrders.map((order) => (
                  <Tr key={order.id}>
                    <Td>{order.id}</Td>
                    <Td>{order.customer_id}</Td>
                    <Td>{order.invoice_date}</Td>
                    <Td>{order.updated_on}</Td>
                    <Td>
                      <IconButton
                        aria-label="View"
                        icon={<ViewIcon />}
                        size="sm"
                      />
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </TabPanel>
        </TabPanels>
      </Tabs>
      <SaleOrderForm
        isOpen={isOpen}
        onClose={onClose}
        saleOrderId={editSaleOrderId}
      />
    </Box>
  );
};

export default Home;
