import { useCounter } from "../../services/state";
import { Box, Container, Text, Image, Center } from "@chakra-ui/react";
import { useSelector } from "react-redux";
import { selectAuthState } from "../../redux/features/Users/auth";

const Admin = () => {
  const [state, actions] = useCounter();
  const { user } = useSelector(selectAuthState);

  if (
    state.listNomineeModal ||
    state.listCodesModal ||
    state.showResultsModal
  ) {
    actions.landingPage(false);
  } else {
    actions.landingPage(true);
  }

  return (
    <>
      <Box>
        <Container
          maxW="container.xl"
          w="100%"
          h="calc(100vh - 80px)"
          padding="10px"
        >
          <Box
            display={{ md: "flex" }}
            py="8%"
            my="2%"
            borderRight="1px"
            borderTop="1px"
            borderColor="gray.200"
            boxShadow="base"
            overflowY="scroll"
            sx={{
              "&::-webkit-scrollbar": {
                width: "1px",
                borderRadius: "8px",
                backgroundColor: `rgba(0, 0, 0, 0.05)`,
              },
              "&::-webkit-scrollbar-thumb": {
                borderRadius: "8px",
                backgroundColor: `rgba(0, 0, 0, 0.05)`,
              },
            }}
          >
            <Box h={{ base: "150px", md: "250px", lg: "350px" }} ml="5">
              <Center>
                <Image
                  src="/landing.png"
                  w="inherit"
                  h="inherit"
                  alt="Welcome"
                />
              </Center>
            </Box>
            <Box p={5} w={{ base: "95%", md: "50%", lg: "45%" }}>
              <Box mt="5">
                <Center>
                  <Text
                    textAlign="center"
                    fontStyle="italic"
                    fontFamily="Georgia"
                    p="5"
                    fontSize={{ base: "25px", md: "35px", lg: "40px" }}
                  >
                    Hello {user === null || undefined ? " " : user.userName}
                  </Text>
                </Center>
              </Box>

              <Box mt="5">
                <Center>
                  <Text
                    textAlign="center"
                    id="dashboard"
                    fontSize={{ base: "14px", md: "16px", lg: "18px" }}
                    fontFamily="Georgia"
                  >
                    Welcome to your dashboard😊
                  </Text>
                </Center>
              </Box>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
};

export default Admin;
