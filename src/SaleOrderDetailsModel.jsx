import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalCloseButton,
  ModalBody,
  ModalFooter,
  Button,
  Box,
  Text,
  Flex,
  Divider,
  useToast,
} from "@chakra-ui/react";
import axios from "axios";
import { useQuery } from "@tanstack/react-query";

const fetchSaleOrderById = async (id) => {
  const { data } = await axios.get(`http://localhost:3000/sale-orders/${id}`);
  return data;
};

const SaleOrderDetailsModal = ({ isOpen, onClose, saleOrderId }) => {
  const toast = useToast();
  const {
    data: saleOrder,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["saleOrder", saleOrderId],
    queryFn: () => fetchSaleOrderById(saleOrderId),
    enabled: !!saleOrderId,
  });

  useEffect(() => {
    if (error) {
      toast({
        title: "An error occurred.",
        description: error.message,
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    }
  }, [error, toast]);

  if (isLoading) return <p>Loading...</p>;
  if (!saleOrder) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} size="xl">
      <ModalOverlay />
      <ModalContent>
        <ModalHeader>Sale Order Details</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <Flex direction="column" gap={4}>
            <Box>
              <Text fontWeight="bold">Customer ID:</Text>
              <Text>{saleOrder.customer_id}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Invoice Number:</Text>
              <Text>{saleOrder.invoice_no}</Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Invoice Date:</Text>
              <Text>
                {new Date(saleOrder.invoice_date).toLocaleDateString()}
              </Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Adding Date:</Text>
              <Text>
                {new Date(saleOrder.adding_date).toLocaleDateString()}
              </Text>
            </Box>
            <Box>
              <Text fontWeight="bold">Last Modified:</Text>
              <Text>{new Date(saleOrder.updated_on).toLocaleDateString()}</Text>
            </Box>
            <Divider />
            <Box>
              <Text fontWeight="bold" mb={2}>
                Items:
              </Text>
              {saleOrder.items.map((item, index) => (
                <Box key={index} mb={4}>
                  <Text fontWeight="bold">Item {index + 1}</Text>
                  <Flex>
                    <Text fontWeight="bold">SKU ID:</Text>
                    <Text>{item.sku_id}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold">Product ID:</Text>
                    <Text>{item.product_id}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold">Price:</Text>
                    <Text>₹{item.price}</Text>
                  </Flex>
                  <Flex>
                    <Text fontWeight="bold">Quantity:</Text>
                    <Text>{item.quantity}</Text>
                  </Flex>
                  <Divider mt={2} />
                </Box>
              ))}
            </Box>
          </Flex>
        </ModalBody>
        <ModalFooter>
          <Button onClick={onClose}>Close</Button>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
};

export default SaleOrderDetailsModal;
