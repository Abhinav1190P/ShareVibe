import { useEffect } from "react";
import NProgress from "nprogress";
import { Spinner, Box } from "@chakra-ui/react";


// We will be using Chakra UI for the UI of our Website, lets install that
const LoadingScreen = () => {
    NProgress.configure({
        showSpinner: false,
    });

    useEffect(() => {
        NProgress.start();

        return () => {
            NProgress.done();
        };
    }, []);

    return (
        <Box
            sx={{
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
            }}
        >
            <Spinner />
        </Box>
    );
};

export default LoadingScreen;