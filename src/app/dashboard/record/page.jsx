"use client";
import {
  Box,
  FormLabel,
  Heading,
  Stack,
  Text,
  Select,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  useColorModeValue,
  HStack,
  Spacer,
  useToast,
} from "@chakra-ui/react";
import { Calendar } from "primereact/calendar";
import { useEffect, useState } from "react";
import "primereact/resources/themes/saga-blue/theme.css"; // Choose your theme
import "primereact/resources/primereact.min.css"; // Core CSS
import "primeicons/primeicons.css"; // Icons
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SidebarItems";
import Button from "@/components/ui/Button";
import moment from "moment";
import { GetValueAll } from "@/config/functions";

const TransactionFilter = () => {
  // Sample raw transaction data
  const [transactions, setTransactions] = useState([]);

  const [startDate, setStartDate] = useState(new Date());
  const [endDate, setEndDate] = useState(new Date());
  const [selectedBank, setSelectedBank] = useState();
  const [selectedAccount, setSelectedAccount] = useState();
  const [filteredTransactions, setFilteredTransactions] = useState([]);
  const [allBanks, setAllbanks] = useState([]);
  const toast = useToast();
  const [loading, setLoading] = useState(false);
  const [uniqueBanks, setUniqueBanks] = useState([]);

  useEffect(() => {
    fetchBanks();
  }, []);

  const handleFilter = () => {
    fetchData();
  };

  async function fetchBanks() {
    GetValueAll("banks").then((val) => {
      setLoading(false);
      if (val.type) {
        const uniqueArray = Array.from(
          new Map(val.data.map((item) => [item.name, item])).values()
        );
        setUniqueBanks(uniqueArray);
        setAllbanks(val.data);
      } else {
        toast({
          title: "Failed",
          description: val.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      setLoading(false);
    });
  }

  async function fetchData() {
    GetValueAll(
      "record",
      moment(new Date(startDate)).startOf("day").valueOf(),
      moment(new Date(endDate)).endOf("day").valueOf(),
      selectedBank,
      selectedAccount
    ).then((val) => {
      setLoading(false);
      if (val.type) {
        setTransactions(val.data);
      } else {
        toast({
          title: "Failed",
          description: val.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
      setLoading(false);
    });
  }

  function downloadCSV(data) {
    const headers =
      ["type", "amount", "name", "account", "note", "date"].join(",") + "\n";
    const rows = data
      .map((row) => {
        const formattedDate = moment(new Date(row.date)).format("DD/MM/YY");
        return `"${row.type}","${row.amount}","${row.name}","${row.account}","${row.note}","${formattedDate}"`;
      })
      .join("\n");
    const csvContent = headers + rows;
    const blob = new Blob([csvContent], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "data.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  return (
    <Sidebar LinkItems={GetLinkItems("dashboard")}>
      <Box minH="100vh" p={8} bg={"gray.100"} color={"gray.800"}>
        <Heading as="h1" size="xl" mb={8} textAlign="center" color={"teal.600"}>
          Transaction Filter
        </Heading>

        <Box bg={"white"} borderRadius="lg" boxShadow="md" p={8} mb={8}>
          <Stack spacing={4}>
            <FormLabel>Start Date</FormLabel>
            <Box
              border={"1px solid"}
              borderColor={"#e2e8f0"}
              rounded={4}
              height={"40px"}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
              px={"10px"}
            >
              <Calendar
                style={{ width: "100%" }}
                value={startDate}
                onChange={(e) => setStartDate(e.value)}
                placeholder="Select Start Date"
                dateFormat="mm/dd/yy"
                showIcon
              />
            </Box>
            <FormLabel>End Date</FormLabel>
            <Box
              border={"1px solid"}
              borderColor={"#e2e8f0"}
              rounded={4}
              height={"40px"}
              display={"flex"}
              alignItems={"center"}
              justifyContent={"center"}
              px={"10px"}
            >
              <Calendar
                style={{ width: "100%" }}
                value={endDate}
                onChange={(e) => setEndDate(e.value)}
                placeholder="Select End Date"
                dateFormat="mm/dd/yy"
                showIcon
              />
            </Box>
            <Select
              isDisabled={uniqueBanks.length === 0}
              value={selectedBank}
              onChange={(e) => {
                setSelectedBank(e.target.value);
              }}
            >
              <option value={""}>{"Select one"}</option>
              {uniqueBanks.map((eachBank, index) => (
                <option key={index} value={eachBank.name}>
                  {eachBank.name}
                </option>
              ))}
            </Select>
            {selectedBank && (
              <Select
                isDisabled={allBanks.length === 0}
                value={selectedAccount}
                onChange={(e) => {
                  setSelectedAccount(e.target.value);
                }}
              >
                <option value={""}>{"Select one"}</option>
                {allBanks
                  .filter((item) => item.name === selectedBank)
                  .map((eachBank, index) => (
                    <option key={index} value={eachBank.account}>
                      {eachBank.account}
                    </option>
                  ))}
              </Select>
            )}
            <Button
              isLoading={loading}
              isDisabled={!selectedAccount}
              colorScheme="teal"
              onClick={() => {
                setLoading(true);
                handleFilter();
              }}
            >
              Filter Records
            </Button>
          </Stack>
        </Box>

        <Box bg={"white"} borderRadius="lg" boxShadow="md" p={8}>
          <HStack w={"100%"}>
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Filtered Transaction List
            </Text>
            <Spacer />
            <Button onClick={() => downloadCSV(transactions)}>
              Export to CSV
            </Button>
          </HStack>
          <Table variant="simple" colorScheme="gray">
            <Thead>
              <Tr>
                <Th>Type</Th>
                <Th>Bank</Th>
                <Th>Account</Th>
                <Th>Amount</Th>
                {/* <Th>Made By</Th> */}
                <Th>Date</Th>
                <Th>Note</Th>
              </Tr>
            </Thead>
            <Tbody>
              {transactions.length > 0 ? (
                transactions.map((transaction) => (
                  <Tr key={transaction.id}>
                    <Td>{transaction.type}</Td>
                    <Td>{transaction.name}</Td>
                    <Td>{transaction.account}</Td>
                    <Td>{transaction.amount}</Td>
                    {/* <Td>{transaction.madeBy}</Td> */}
                    <Td>
                      {moment(new Date(transaction.date)).format("DD/MM/YYYY")}
                    </Td>
                    <Td>{transaction.note}</Td>
                  </Tr>
                ))
              ) : (
                <Tr>
                  <Td colSpan="6" textAlign="center">
                    No transactions found
                  </Td>
                </Tr>
              )}
            </Tbody>
          </Table>
        </Box>
      </Box>
    </Sidebar>
  );
};

export default TransactionFilter;
