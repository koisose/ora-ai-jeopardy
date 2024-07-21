import "@rainbow-me/rainbowkit/styles.css";
import { ScaffoldEthAppWithProviders } from "~~/components/ScaffoldEthAppWithProviders";
import { ThemeProvider } from "~~/components/ThemeProvider";
import "~~/styles/globals.css";
import Ppa from "~~/components/0a/page";


const ScaffoldEthApp = () => {
  return (
    
        <ThemeProvider enableSystem>
          <ScaffoldEthAppWithProviders><Ppa/></ScaffoldEthAppWithProviders>
        </ThemeProvider>
    
  );
};

export default ScaffoldEthApp;
