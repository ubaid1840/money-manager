"use client";
import {
  Box,
  FormLabel,
  Heading,
  Input,
  Select,
  Stack,
  Table,
  Thead,
  Tbody,
  Tr,
  Th,
  Td,
  Text,
  IconButton,
  useColorModeValue,
  useToast,
} from "@chakra-ui/react";
import { useEffect, useState } from "react";
import { FaEdit, FaTrash } from "react-icons/fa";
import { Calendar } from "primereact/calendar";
import "primereact/resources/themes/saga-blue/theme.css"; // Choose your theme
import "primereact/resources/primereact.min.css"; // Core CSS
import "primeicons/primeicons.css"; // Icons
import Sidebar from "@/components/sidebar";
import GetLinkItems from "@/utils/SidebarItems";
import Button from "@/components/ui/Button";
import { AddValue, DeleteValue, GetValueAll } from "@/config/functions";
import Loading from "@/app/loading";
import moment from "moment";

const TransactionEntry = () => {
  const [transactionType, setTransactionType] = useState("Credit");
  const [bankAccount, setBankAccount] = useState({ name: "", account: "" });
  const [allBanks, setAllbanks] = useState([]);
  const [amount, setAmount] = useState("");
  const [date, setDate] = useState(null);
  const [note, setNote] = useState("");
  const [transactions, setTransactions] = useState([]);
  const toast = useToast();
  const [loading, setLoading] = useState(true);
  const [uniqueBanks, setUniqueBanks] = useState([]);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    GetValueAll("record").then((val) => {
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

  function clearAll() {
    setBankAccount({ name: "", account: "" });
    setAmount("");
    setDate(null);
    setNote("");
  }

  const handleAddTransaction = () => {
    AddValue("record", {
      type: transactionType,
      name: bankAccount.name,
      account: bankAccount.account,
      note: note,
      date: new Date(date).getTime(),
      amount: Number(amount),
    }).then((val) => {
      setLoading(false);
      if (val.type) {
        clearAll();
        setTransactions((prevState) => {
          const newState = [...prevState];
          newState.push({
            type: transactionType,
            name: bankAccount.name,
            account: bankAccount.account,
            note: note,
            date: new Date(date).getTime(),
            id: val.data.id,
            amount: Number(amount),
          });
          return newState;
        });
        toast({
          title: "Success",
          description: val.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed",
          description: val.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    });
  };

  const handleDeleteTransaction = (tId) => {
    DeleteValue("record", tId).then((val) => {
      setLoading(false);
      if (val.type) {
        setTransactions(transactions.filter((item) => item.id !== tId));
        toast({
          title: "Success",
          description: val.message,
          status: "success",
          duration: 3000,
          isClosable: true,
        });
      } else {
        toast({
          title: "Failed",
          description: val.message,
          status: "error",
          duration: 3000,
          isClosable: true,
        });
      }
    });
  };

  // const handleEditTransaction = (transactionId) => {
  //   // Logic to edit the transaction
  //   console.log("Edit Transaction ID:", transactionId);
  // };

  return (
    <Sidebar LinkItems={GetLinkItems("dashboard")}>
      {loading ? (
        <Loading />
      ) : (
        <Box
          minH="100vh"
          p={8}
          bg={"gray.100"}
          color={"gray.800"}
          display={"flex"}
          flexDir={"column"}
          alignItems={"center"}
        >
          <Heading
            as="h1"
            size="xl"
            mb={8}
            textAlign="center"
            color={"teal.600"}
          >
            Transaction Entry
          </Heading>

          <Box
            bg={"white"}
            borderRadius="lg"
            boxShadow="md"
            p={8}
            mb={8}
            maxW={"600px"}
          >
            <Stack spacing={4}>
              <Select
                value={transactionType}
                onChange={(e) => setTransactionType(e.target.value)}
                placeholder="Select transaction type"
              >
                <option value="Credit">Credit</option>
                <option value="Debit">Debit</option>
              </Select>
              <Input
                type="number"
                placeholder="Amount"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
              <Select
                isDisabled={uniqueBanks.length === 0}
                value={bankAccount.name}
                onChange={(e) => {
                  setBankAccount({
                    name: e.target.value,
                    account: "",
                  });
                }}
              >
                <option value={""}>{"Select one"}</option>
                {uniqueBanks.map((eachBank, index) => (
                  <option key={index} value={eachBank.name}>
                    {eachBank.name}
                  </option>
                ))}
              </Select>

              {bankAccount.name && (
                <Select
                  isDisabled={allBanks.length === 0}
                  value={bankAccount.account}
                  onChange={(e) => {
                    setBankAccount((prevState) => ({
                      ...prevState,
                      account: e.target.value,
                    }));
                  }}
                >
                  <option value={""}>{"Select one"}</option>
                  {allBanks
                    .filter((item) => item.name === bankAccount.name)
                    .map((eachBank, index) => (
                      <option key={index} value={eachBank.account}>
                        {eachBank.account}
                      </option>
                    ))}
                </Select>
              )}

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
                  value={date}
                  onChange={(e) => setDate(e.value)}
                  placeholder="Select Date"
                  dateFormat="mm/dd/yy"
                  showIcon
                />
              </Box>
              <Input
                placeholder="Note"
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
              <Button
                isDisabled={
                  !note ||
                  !transactionType ||
                  !date ||
                  !bankAccount.account ||
                  !amount
                }
                colorScheme="teal"
                onClick={() => {
                  setLoading(true);
                  handleAddTransaction();
                }}
              >
                Add Transaction
              </Button>
            </Stack>
          </Box>

          <Box
            bg={"white"}
            borderRadius="lg"
            boxShadow="md"
            p={8}
            width={"100%"}
          >
            <Text fontSize="lg" fontWeight="bold" mb={4}>
              Transaction List
            </Text>
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
                  <Th>Actions</Th>
                </Tr>
              </Thead>
              <Tbody>
                {transactions.sort((a,b)=> b.date - a.date).map((transaction) => (
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
                    <Td>
                      <Stack direction="row" spacing={2}>
                        {/* <IconButton
                          icon={<FaEdit />}
                          colorScheme="blue"
                          variant="outline"
                          aria-label="Edit Transaction"
                          onClick={() => handleEditTransaction(transaction.id)}
                        /> */}
                        <IconButton
                          icon={<FaTrash />}
                          colorScheme="red"
                          variant="outline"
                          aria-label="Delete Transaction"
                          onClick={() => {
                            setLoading(true);
                            handleDeleteTransaction(transaction.id);
                          }}
                        />
                      </Stack>
                    </Td>
                  </Tr>
                ))}
              </Tbody>
            </Table>
          </Box>
        </Box>
      )}
    </Sidebar>
  );
};

export default TransactionEntry;
